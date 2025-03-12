// components/AppointmentBooking.tsx
import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Input, Card, message, Steps, Result } from 'antd';
import { Employee, Service, Appointment, Customer } from '../../interfaces/types';
import { employeeService, serviceService, appointmentService, customerService } from '../../services/bai2/localStorageService';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;
const { Step } = Steps;

const AppointmentBooking: React.FC = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const servicesData = serviceService.getAll();
    const employeesData = employeeService.getAll();
    setServices(servicesData);
    setEmployees(employeesData);
  };

  // Xử lý khi chọn dịch vụ
  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);

      // Lọc nhân viên có thể cung cấp dịch vụ này
      const filtered = employees.filter(emp => emp.services.includes(serviceId));
      setAvailableEmployees(filtered);

      form.setFieldsValue({ employeeId: undefined, date: undefined, timeSlot: undefined });
      setAvailableTimeSlots([]);
    }
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) {
      setSelectedDate(null);
      setAvailableTimeSlots([]);
      return;
    }

    setSelectedDate(date);

    const employeeId = form.getFieldValue('employeeId');
    if (employeeId && selectedService) {
      checkAvailableTimeSlots(employeeId, date, selectedService);
    }
  };

  // Xử lý khi chọn nhân viên
  const handleEmployeeChange = (employeeId: string) => {
    const date = form.getFieldValue('date');
    if (date && selectedService) {
      checkAvailableTimeSlots(employeeId, date, selectedService);
    }
  };

  // Xử lý khi chọn khung giờ
  const handleTimeSlotChange = (value: string) => {
    setSelectedTimeSlot(value);
  };

  // Kiểm tra các khung giờ có sẵn (sáng/chiều)
  const checkAvailableTimeSlots = (employeeId: string, date: dayjs.Dayjs, service: Service) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const dayOfWeek = date.day(); // 0 = Chủ nhật, 1-6 = Thứ 2 - Thứ 7

    // Tìm lịch làm việc của nhân viên vào ngày đã chọn
    const workSchedule = employee.workSchedule.find(schedule => schedule.dayOfWeek === dayOfWeek);
    if (!workSchedule) {
      message.warning('Nhân viên không làm việc vào ngày này!');
      setAvailableTimeSlots([]);
      return;
    }

    // Lấy danh sách các lịch hẹn đã có của nhân viên trong ngày
    const dateString = date.format('YYYY-MM-DD');
    const existingAppointments = appointmentService.getByEmployeeAndDate(employeeId, dateString)
      .filter(app => app.status !== 'cancelled');

    // Kiểm tra số lịch hẹn trong ngày đã đạt tối đa chưa
    if (existingAppointments.length >= employee.maxAppointmentsPerDay) {
      message.warning('Nhân viên đã đạt số lượng lịch hẹn tối đa trong ngày!');
      setAvailableTimeSlots([]);
      return;
    }

    // Kiểm tra xem buổi sáng và buổi chiều có lịch trống không
    const morningStart = "08:00";
    const morningEnd = "12:00";
    const afternoonStart = "13:00";
    const afternoonEnd = "17:00";

    const availableSlots: string[] = [];

    // Kiểm tra buổi sáng có trống không
    const hasMorningAppointment = existingAppointments.some(app => {
      return (app.startTime >= morningStart && app.startTime < morningEnd) ||
             (app.endTime > morningStart && app.endTime <= morningEnd);
    });

    // Kiểm tra buổi chiều có trống không
    const hasAfternoonAppointment = existingAppointments.some(app => {
      return (app.startTime >= afternoonStart && app.startTime < afternoonEnd) ||
             (app.endTime > afternoonStart && app.endTime <= afternoonEnd);
    });

    // Kiểm tra xem nhân viên có làm việc buổi sáng không
    const workStartMinutes = convertTimeToMinutes(workSchedule.startTime);
    const workEndMinutes = convertTimeToMinutes(workSchedule.endTime);
    const morningStartMinutes = convertTimeToMinutes(morningStart);
    const morningEndMinutes = convertTimeToMinutes(morningEnd);
    const afternoonStartMinutes = convertTimeToMinutes(afternoonStart);
    const afternoonEndMinutes = convertTimeToMinutes(afternoonEnd);

    // Nếu nhân viên làm việc buổi sáng và chưa có lịch hẹn buổi sáng
    if (workStartMinutes <= morningStartMinutes && workEndMinutes >= morningEndMinutes && !hasMorningAppointment) {
      availableSlots.push("Buổi sáng (8:00 - 12:00)");
    }

    // Nếu nhân viên làm việc buổi chiều và chưa có lịch hẹn buổi chiều
    if (workStartMinutes <= afternoonStartMinutes && workEndMinutes >= afternoonEndMinutes && !hasAfternoonAppointment) {
      availableSlots.push("Buổi chiều (13:00 - 17:00)");
    }

    setAvailableTimeSlots(availableSlots);
  };

  // Chuyển đổi thời gian từ chuỗi "HH:mm" sang số phút
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Xử lý khi đặt lịch hẹn
  const handleBooking = async () => {
    try {
      console.log("Đang xử lý đặt lịch...");
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (!selectedService) {
        message.error('Vui lòng chọn dịch vụ!');
        return;
      }

      // Lấy lại giá trị từ bước 1
      const step1Values = form.getFieldsValue(['serviceId', 'employeeId', 'date', 'timeSlot']);
      console.log("Step 1 values:", step1Values);

      if (!step1Values.date) {
        message.error('Ngày hẹn không hợp lệ!');
        return;
      }

      const dateString = step1Values.date.format('YYYY-MM-DD');

      // Xác định thời gian bắt đầu và kết thúc dựa trên khung giờ
      let startTime, endTime;
      const timeSlot = step1Values.timeSlot || selectedTimeSlot;

      if (!timeSlot) {
        message.error('Vui lòng chọn buổi hẹn!');
        return;
      }

      if (timeSlot.includes("sáng")) {
        startTime = "08:00";
        endTime = "12:00";
      } else {
        startTime = "13:00";
        endTime = "17:00";
      }

      // Kiểm tra xem khách hàng đã tồn tại chưa
      let customer = customerService.getByPhone(values.phone);

      if (!customer) {
        // Tạo khách hàng mới
        customer = {
          id: uuidv4(),
          name: values.name,
          phone: values.phone,
          email: values.email,
        };
        customerService.add(customer);
      }

      // Tạo lịch hẹn mới
      const newAppointment: Appointment = {
        id: uuidv4(),
        customerId: customer.id,
        customerName: values.name,
        customerPhone: values.phone,
        serviceId: selectedService.id,
        employeeId: step1Values.employeeId,
        date: dateString,
        startTime: startTime,
        endTime: endTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      appointmentService.add(newAppointment);
      setAppointmentId(newAppointment.id);
      setBookingComplete(true);
      setCurrentStep(2);

      message.success('Đặt lịch hẹn thành công!');
    } catch (error) {
      console.error('Validate Failed:', error);
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields(['serviceId', 'employeeId', 'date', 'timeSlot']);
        setCurrentStep(1);
      } catch (error) {
        console.error('Validate Failed:', error);
        message.error('Vui lòng điền đầy đủ thông tin ở bước 1!');
      }
    } else if (currentStep === 1) {
      handleBooking();
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    form.resetFields();
    setSelectedService(null);
    setSelectedDate(null);
    setAvailableTimeSlots([]);
    setSelectedTimeSlot('');
    setBookingComplete(false);
    setCurrentStep(0);
  };

  return (
    <Card title="Đặt lịch hẹn">
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Chọn dịch vụ" description="Chọn dịch vụ và thời gian" />
        <Step title="Thông tin khách hàng" description="Điền thông tin cá nhân" />
        <Step title="Hoàn tất" description="Xác nhận đặt lịch" />
      </Steps>

      {!bookingComplete ? (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs(),
          }}
          preserve={true}
        >
          {currentStep === 0 && (
            <>
              <Form.Item
                name="serviceId"
                label="Dịch vụ"
                rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
              >
                <Select placeholder="Chọn dịch vụ" onChange={handleServiceChange}>
                  {services.map(service => (
                    <Option key={service.id} value={service.id}>
                      {service.name} - {service.price.toLocaleString('vi-VN')} VNĐ - {service.durationMinutes} phút
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="employeeId"
                label="Nhân viên"
                rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
              >
                <Select
                  placeholder="Chọn nhân viên"
                  disabled={!selectedService}
                  onChange={handleEmployeeChange}
                >
                  {availableEmployees.map(employee => (
                    <Option key={employee.id} value={employee.id}>
                      {employee.name} - Đánh giá: {employee.averageRating}/5
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Ngày hẹn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  onChange={handleDateChange}
                />
              </Form.Item>

              <Form.Item
                name="timeSlot"
                label="Buổi hẹn"
                rules={[{ required: true, message: 'Vui lòng chọn buổi hẹn!' }]}
              >
                <Select
                  placeholder="Chọn buổi hẹn"
                  onChange={handleTimeSlotChange}
                >
                  {availableTimeSlots.map(slot => (
                    <Option key={slot} value={slot}>
                      {slot}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {currentStep > 0 && (
                <Button onClick={prevStep}>
                  Quay lại
                </Button>
              )}
              <Button type="primary" onClick={nextStep}>
                {currentStep === 1 ? 'Đặt lịch' : 'Tiếp tục'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      ) : (
        <Result
          status="success"
          title="Đặt lịch hẹn thành công!"
          subTitle={`Mã lịch hẹn của bạn: ${appointmentId}. Chúng tôi sẽ liên hệ để xác nhận lịch hẹn của bạn.`}
          extra={[
            <Button type="primary" key="new" onClick={resetForm}>
              Đặt lịch hẹn mới
            </Button>,
          ]}
        />
      )}
    </Card>
  );
};

export default AppointmentBooking;
