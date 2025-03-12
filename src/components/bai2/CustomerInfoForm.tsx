// components/AppointmentBooking.tsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, message, Steps, Result } from 'antd';
import { Employee, Service, Appointment, Customer } from '../../interfaces/types';
import { employeeService, serviceService, appointmentService, customerService } from '../../services/bai2/localStorageService';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import ServiceSelectionForm from './ServiceSelectionForm';
import CustomerInfoForm from './CustomerInfoForm';

const { Step } = Steps;

const AppointmentBooking: React.FC = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>('');

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

      form.setFieldsValue({ employeeId: undefined, date: undefined, time: undefined });
      setAvailableTimes([]);
    }
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) {
      setSelectedDate(null);
      setAvailableTimes([]);
      return;
    }

    setSelectedDate(date);

    const employeeId = form.getFieldValue('employeeId');
    if (employeeId && selectedService) {
      generateAvailableTimes(employeeId, date, selectedService);
    }
  };

  // Xử lý khi chọn nhân viên
  const handleEmployeeChange = (employeeId: string) => {
    const date = form.getFieldValue('date');
    if (date && selectedService) {
      generateAvailableTimes(employeeId, date, selectedService);
    }
  };

  // Tạo danh sách các khung giờ có sẵn
  const generateAvailableTimes = (employeeId: string, date: dayjs.Dayjs, service: Service) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const dayOfWeek = date.day(); // 0 = Chủ nhật, 1-6 = Thứ 2 - Thứ 7

    // Tìm lịch làm việc của nhân viên vào ngày đã chọn
    const workSchedule = employee.workSchedule.find(schedule => schedule.dayOfWeek === dayOfWeek);
    if (!workSchedule) {
      message.warning('Nhân viên không làm việc vào ngày này!');
      setAvailableTimes([]);
      return;
    }

    // Chuyển đổi thời gian làm việc sang phút
    const startMinutes = convertTimeToMinutes(workSchedule.startTime);
    const endMinutes = convertTimeToMinutes(workSchedule.endTime);

    // Lấy danh sách các lịch hẹn đã có của nhân viên trong ngày
    const dateString = date.format('YYYY-MM-DD');
    const existingAppointments = appointmentService.getByEmployeeAndDate(employeeId, dateString)
      .filter(app => app.status !== 'cancelled');

    // Tạo danh sách các khung giờ có thể đặt
    const times: string[] = [];
    const serviceDuration = service.durationMinutes;

    // Kiểm tra số lịch hẹn trong ngày đã đạt tối đa chưa
    if (existingAppointments.length >= employee.maxAppointmentsPerDay) {
      message.warning('Nhân viên đã đạt số lượng lịch hẹn tối đa trong ngày!');
      setAvailableTimes([]);
      return;
    }

    // Tạo các khung giờ với bước 15 phút
    for (let time = startMinutes; time <= endMinutes - serviceDuration; time += 15) {
      const startTime = convertMinutesToTime(time);
      const endTime = convertMinutesToTime(time + serviceDuration);

      // Kiểm tra xem khung giờ này có trùng với lịch hẹn nào không
      const isOverlap = appointmentService.checkOverlap(employeeId, dateString, startTime, endTime);

      if (!isOverlap) {
        times.push(startTime);
      }
    }

    setAvailableTimes(times);
  };

  // Chuyển đổi thời gian từ chuỗi "HH:mm" sang số phút
  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Chuyển đổi số phút sang chuỗi "HH:mm"
  const convertMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Xử lý khi đặt lịch hẹn
  const handleBooking = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedService) {
        message.error('Vui lòng chọn dịch vụ!');
        return;
      }

      const dateString = values.date.format('YYYY-MM-DD');
      const startTime = values.time;
      const endTime = convertMinutesToTime(convertTimeToMinutes(startTime) + selectedService.durationMinutes);

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
        employeeId: values.employeeId,
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
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields(['serviceId', 'employeeId', 'date', 'time']);
        setCurrentStep(1);
      } catch (error) {
        console.error('Validate Failed:', error);
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
    setAvailableTimes([]);
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
        >
          {currentStep === 0 && (
            <ServiceSelectionForm
              form={form}
              services={services}
              availableEmployees={availableEmployees}
              availableTimes={availableTimes}
              handleServiceChange={handleServiceChange}
              handleEmployeeChange={handleEmployeeChange}
              handleDateChange={handleDateChange}
              selectedService={selectedService}
            />
          )}

          {currentStep === 1 && <CustomerInfoForm />}

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
