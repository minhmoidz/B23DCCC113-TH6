// components/appointment/ServiceSelectionForm.tsx
import React from 'react';
import { Form, Select, DatePicker } from 'antd';
import { Employee, Service } from '../../interfaces/types';
import dayjs from 'dayjs';

const { Option } = Select;

interface ServiceSelectionFormProps {
  form: any;
  services: Service[];
  availableEmployees: Employee[];
  availableTimes: string[];
  handleServiceChange: (serviceId: string) => void;
  handleEmployeeChange: (employeeId: string) => void;
  handleDateChange: (date: dayjs.Dayjs | null) => void;
  selectedService: Service | null;
}

const ServiceSelectionForm: React.FC<ServiceSelectionFormProps> = ({
  form,
  services,
  availableEmployees,
  availableTimes,
  handleServiceChange,
  handleEmployeeChange,
  handleDateChange,
  selectedService
}) => {
  return (
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
          disabled={!form.getFieldValue('employeeId')}
        />
      </Form.Item>

      <Form.Item
        name="time"
        label="Giờ hẹn"
        rules={[{ required: true, message: 'Vui lòng chọn giờ hẹn!' }]}
      >
        <Select
          placeholder="Chọn giờ hẹn"
          disabled={availableTimes.length === 0}
        >
          {availableTimes.map(time => (
            <Option key={time} value={time}>
              {time}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default ServiceSelectionForm;
