// components/AppointmentManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Select, DatePicker, Card, Tag, Space, Modal, message } from 'antd';
import { Appointment, Service, Employee } from '../../interfaces/types';
import { appointmentService, serviceService, employeeService } from '../../services/bai2/localStorageService';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, dateRange, employeeFilter]);

  const loadData = () => {
    const appointmentsData = appointmentService.getAll();
    const servicesData = serviceService.getAll();
    const employeesData = employeeService.getAll();

    setAppointments(appointmentsData);
    setServices(servicesData);
    setEmployees(employeesData);
    setFilteredAppointments(appointmentsData);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(app => {
        const appDate = dayjs(app.date);
        return appDate.isAfter(startDate.startOf('day')) && appDate.isBefore(endDate.endOf('day'));
      });
    }

    if (employeeFilter) {
      filtered = filtered.filter(app => app.employeeId === employeeFilter);
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn thay đổi trạng thái lịch hẹn này thành "${getStatusText(newStatus)}"?`,
      onOk() {
        const appointment = appointmentService.getById(appointmentId);
        if (appointment) {
          const updatedAppointment = {
            ...appointment,
            status: newStatus
          };
          appointmentService.update(updatedAppointment);
          message.success('Cập nhật trạng thái thành công!');
          loadData();
        }
      }
    });
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="blue">{getStatusText(status)}</Tag>;
      case 'confirmed':
        return <Tag color="green">{getStatusText(status)}</Tag>;
      case 'completed':
        return <Tag color="purple">{getStatusText(status)}</Tag>;
      case 'cancelled':
        return <Tag color="red">{getStatusText(status)}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã lịch hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceId',
      key: 'serviceId',
      render: (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        return service ? service.name : 'N/A';
      },
    },
    {
      title: 'Nhân viên',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId: string) => {
        const employee = employees.find(e => e.id === employeeId);
        return employee ? employee.name : 'N/A';
      },
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Giờ hẹn',
      key: 'time',
      render: (_, record: Appointment) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record: Appointment) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button type="primary" size="small" onClick={() => handleStatusChange(record.id, 'confirmed')}>
                Xác nhận
              </Button>
              <Button danger size="small" onClick={() => handleStatusChange(record.id, 'cancelled')}>
                Hủy
              </Button>
            </>
          )}
          {record.status === 'confirmed' && (
            <Button type="primary" size="small" onClick={() => handleStatusChange(record.id, 'completed')}>
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý lịch hẹn">
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="pending">Chờ duyệt</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>

        <RangePicker
          style={{ width: 300 }}
          onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
        />

        <Select
          placeholder="Lọc theo nhân viên"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => setEmployeeFilter(value)}
        >
          {employees.map(employee => (
            <Option key={employee.id} value={employee.id}>{employee.name}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={loadData}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAppointments}
        rowKey="id"
      />
    </Card>
  );
};

export default AppointmentManagement;
