// AppointmentForm.tsx - Component để đặt lịch hẹn
import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, TimePicker, Input, Button, message, Card } from 'antd';
import { getEmployees, getServices, getAppointments, addAppointment, updateAppointment } from '../../services/bai2/localStorageService';
import {
  isEmployeeAvailable,
  hasAppointmentConflict,
  calculateEndTime,
  countAppointmentsPerDay,
  getAvailableTimeSlots
} from '../../services/bai2/utils';
import { Employee, Service, Appointment } from '../../interfaces/types';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { Option } = Select;
const { TextArea } = Input;

interface AppointmentFormProps {
  initialValues?: Appointment;
  onSubmit?: (appointment: Appointment) => void;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialValues,
  onSubmit,
  customerId,
  customerName,
  customerPhone
}) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    setEmployees(getEmployees());
    setServices(getServices());
    setAppointments(getAppointments());

    if (initialValues) {
      setSelectedServiceId(initialValues.serviceId);
      setSelectedEmployeeId(initialValues.employeeId);
      setSelectedDate(initialValues.date);
      form.setFieldsValue({
        ...initialValues,
        date: new Date(initialValues.date),
      });
    }
  }, [form, initialValues]);

  useEffect(() => {
    if (selectedServiceId && selectedEmployeeId && selectedDate) {
      const employee = employees.find(e => e.id === selectedEmployeeId);
      const service = services.find(s => s.id === selectedServiceId);

      if (employee && service) {
        const slots = getAvailableTimeSlots(employee, service, selectedDate, appointments);
        setAvailableTimeSlots(slots);
      }
    }
  }, [selectedServiceId, selectedEmployeeId, selectedDate, employees, services, appointments]);

  const filteredEmployees = services && selectedServiceId
    ? employees.filter(employee => employee.services.includes(selectedServiceId))
    : employees;

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    // Reset employee and time if service changes
    form.setFieldsValue({ employeeId: undefined, time: undefined });
    setSelectedEmployeeId('');
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    // Reset time if employee changes
    form.setFieldsValue({ time: undefined });
  };

  const handleDateChange = (date: any) => {
    if (date) {
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedDate(formattedDate);
      form.setFieldsValue({ time: undefined });
    } else {
      setSelectedDate('');
    }
  };

  const handleSubmit = (values: any) => {
    const selectedService = services.find(s => s.id === values.serviceId);
    if (!selectedService) {
      message.error('Vui lòng chọn dịch vụ');
      return;
    }

    const formattedDate = values.date.format('YYYY-MM-DD');
    const startTime = values.time;
    const endTime = calculateEndTime(startTime, selectedService.durationMinutes);

    const selectedEmployee = employees.find(e => e.id === values.employeeId);
    if (!selectedEmployee) {
      message.error('Vui lòng chọn nhân viên');
      return;
    }

    // Check if employee is available on this day/time
    if (!isEmployeeAvailable(selectedEmployee, formattedDate, startTime, endTime)) {
      message.error('Nhân viên không làm việc vào thời gian này');
      return;
    }

    // Check if employee has reached max appointments for the day
    const appointmentsCount = countAppointmentsPerDay(
      appointments,
      values.employeeId,
      formattedDate
    );

    if (
      appointmentsCount >= selectedEmployee.maxAppointmentsPerDay &&
      (!initialValues || initialValues.employeeId !== values.employeeId || initialValues.date !== formattedDate)
    ) {
      message.error('Nhân viên đã đạt số lượng lịch hẹn tối đa trong ngày');
      return;
    }

    // Check for appointment conflicts
    if (
      hasAppointmentConflict(
        appointments,
        values.employeeId,
        formattedDate,
        startTime,
        endTime,
        initialValues?.id
      )
    ) {
      message.error('Thời gian này đã có lịch hẹn khác');
      return;
    }

    // Create or update appointment
    const appointmentData = {
      customerId: customerId || values.customerId,
      customerName: customerName || values.customerName,
      customerPhone: customerPhone || values.customerPhone,
      employeeId: values.employeeId,
      serviceId: values.serviceId,
      date: formattedDate,
      startTime,
      endTime,
      status: initialValues?.status || 'pending',
      notes: values.notes,
    };

    if (initialValues) {
      const updatedAppointment = {
        ...initialValues,
        ...appointmentData,
      };
      updateAppointment(updatedAppointment);
      message.success('Cập nhật lịch hẹn thành công');
      if (onSubmit) onSubmit(updatedAppointment);
    } else {
      const newAppointment = addAppointment(appointmentData);
      message.success('Đặt lịch hẹn thành công');
      form.resetFields();
      if (onSubmit) onSubmit(newAppointment);
    }
  };

  return (
    <Card title={initialValues ? "Cập nhật lịch hẹn" : "Đặt lịch hẹn"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={customerId ? { customerId, customerName, customerPhone } : {}}
      >
        {!customerId && (
          <>
            <Form.Item
              name="customerName"
              label="Tên khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>

            <Form.Item
              name="customerPhone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="serviceId"
          label="Dịch vụ"
          rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
        >
          <Select
            placeholder="Chọn dịch vụ"
            onChange={handleServiceChange}
          >
            {services.map(service => (
              <Option key={service.id} value={service.id}>
                {service.name} - {service.price.toLocaleString('vi-VN')}đ - {service.durationMinutes} phút
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="employeeId"
          label="Nhân viên"
          rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}
        >
          <Select
                style={{ width: 140 }}
              >
                <Option value="all">Tất cả</Option>
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>{employee.name}</Option>
                ))}
              </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Ngày hẹn"
          rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            onChange={handleDateChange}
            locale={locale}

          />
        </Form.Item>

        <Form.Item
          name="time"
          label="Giờ hẹn"
          rules={[{ required: true, message: 'Vui lòng chọn giờ' }]}
        >
          <Select
            placeholder={availableTimeSlots.length ? "Chọn giờ hẹn" : "Không có giờ trống"}
            disabled={!availableTimeSlots.length}
          >
            {availableTimeSlots.map(slot => (
              <Option key={slot} value={slot}>{slot}</Option>
            ))}
          </Select>

        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Cập nhật' : 'Đặt lịch'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AppointmentForm;
