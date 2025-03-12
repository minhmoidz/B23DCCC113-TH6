// AppointmentList.tsx - Danh sách các lịch hẹn
import React, { useState, useEffect } from 'react';
import {
  Table,
  Space,
  Button,
  Tag,
  Modal,
  message,
  Card,
  Select,
  DatePicker,
  Form,
  Input,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  StarOutlined
} from '@ant-design/icons';
import {
  getAppointments,
  getEmployees,
  getServices,
  updateAppointment,
  deleteAppointment,
  getCurrentUser
} from '../../services/bai2/localStorageService';
import { formatDate } from '../../services/bai2/utils';
import { Appointment, Employee, Service, User } from '../../interfaces/types';
import AppointmentForm from './AppointmentForm';
import ReviewForm from './ReviewForm';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface AppointmentListProps {
  customerId?: string;
  employeeId?: string;
  role?: 'admin' | 'employee' | 'customer';
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  customerId,
  employeeId,
  role = 'admin'
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    employeeId: 'all',
    serviceId: 'all',
    dateRange: [] as [string, string] | [],
    searchText: '',
  });
  const [form] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [customerId, employeeId]);

  // Reload data when filters change
  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadData = () => {
    setLoading(true);
    setEmployees(getEmployees());
    setServices(getServices());

    let allAppointments = getAppointments();

    // Filter by customerId or employeeId if provided
    if (customerId) {
      allAppointments = allAppointments.filter(a => a.customerId === customerId);
    }

    if (employeeId) {
      allAppointments = allAppointments.filter(a => a.employeeId === employeeId);
    }

    // Sort by date and time (most recent first)
    allAppointments.sort((a, b) => {
      // Compare dates first
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      // If dates are equal, compare times
      return a.startTime.localeCompare(b.startTime);
    });

    setAppointments(allAppointments);
    setLoading(false);
  };

  const applyFilters = () => {
    let filteredAppointments = getAppointments();

    // Filter by customerId or employeeId if provided
    if (customerId) {
      filteredAppointments = filteredAppointments.filter(a => a.customerId === customerId);
    }

    if (employeeId) {
      filteredAppointments = filteredAppointments.filter(a => a.employeeId === employeeId);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filteredAppointments = filteredAppointments.filter(a => a.status === filters.status);
    }

    // Apply employee filter
    if (filters.employeeId !== 'all') {
      filteredAppointments = filteredAppointments.filter(a => a.employeeId === filters.employeeId);
    }

    // Apply service filter
    if (filters.serviceId !== 'all') {
      filteredAppointments = filteredAppointments.filter(a => a.serviceId === filters.serviceId);
    }

    // Apply date range filter
    if (filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filteredAppointments = filteredAppointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate);
      });
    }

    // Apply search filter (by customer name or phone)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredAppointments = filteredAppointments.filter(a =>
        a.customerName.toLowerCase().includes(searchLower) ||
        a.customerPhone.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date and time (most recent first)
    filteredAppointments.sort((a, b) => {
      // Compare dates first
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      // If dates are equal, compare times
      return a.startTime.localeCompare(b.startTime);
    });

    setAppointments(filteredAppointments);
  };

  const handleEdit = (record: Appointment) => {
    setEditingAppointment(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: Appointment) => {
    Modal.confirm({
      title: 'Xác nhận xóa lịch hẹn',
      content: 'Bạn có chắc chắn muốn xóa lịch hẹn này?',
      onOk() {
        deleteAppointment(record.id);
        message.success('Xóa lịch hẹn thành công');
        loadData();
      },
    });
  };

  const handleUpdateStatus = (record: Appointment, newStatus: Appointment['status']) => {
    const updatedAppointment = { ...record, status: newStatus };
    updateAppointment(updatedAppointment);
    message.success(`Cập nhật trạng thái thành công: ${getStatusText(newStatus)}`);
    loadData();
  };

  const handleFormSubmit = () => {
    setIsModalVisible(false);
    setEditingAppointment(null);
    loadData();
  };

  const handleReviewSubmit = () => {
    setIsReviewModalVisible(false);
    setSelectedAppointment(null);
    loadData();
  };

  const handleOpenReviewModal = (record: Appointment) => {
    setSelectedAppointment(record);
    setIsReviewModalVisible(true);
  };

  const getStatusText = (status: Appointment['status']): string => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status: Appointment['status']): string => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      setFilters(prev => ({
        ...prev,
        dateRange: [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        dateRange: []
      }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchText: e.target.value
    }));
  };

  const handleReset = () => {
    form.resetFields();
    setFilters({
      status: 'all',
      employeeId: 'all',
      serviceId: 'all',
      dateRange: [],
      searchText: '',
    });
  };

  const columns = [
    {
      title: 'Mã lịch hẹn',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => text.slice(-6),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string, record: Appointment) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.customerPhone}</div>
        </div>
      ),
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
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Giờ',
      key: 'time',
      render: (text: string, record: Appointment) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Appointment['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: Appointment) => {
        const currentUser = getCurrentUser();
        const canEditDelete = role === 'admin' ||
                            (role === 'employee' && record.employeeId === employeeId) ||
                            (role === 'customer' && record.customerId === customerId);

        const canChangeStatus = role === 'admin' || (role === 'employee' && record.employeeId === employeeId);

        const canReview = role === 'customer' &&
                          record.status === 'completed' &&
                          record.customerId === customerId;

        return (
          <Space size="small">
            {canEditDelete && record.status !== 'completed' && record.status !== 'cancelled' && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
            )}

            {canEditDelete && record.status !== 'completed' && record.status !== 'cancelled' && (
              <Tooltip title="Xóa">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            )}

            {canChangeStatus && record.status === 'pending' && (
              <Tooltip title="Xác nhận">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => handleUpdateStatus(record, 'confirmed')}
                />
              </Tooltip>
            )}

            {canChangeStatus && (record.status === 'confirmed' || record.status === 'pending') && (
              <Tooltip title="Hoàn thành">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', color: 'white' }}
                  onClick={() => handleUpdateStatus(record, 'completed')}
                />
              </Tooltip>
            )}

            {canChangeStatus && record.status !== 'cancelled' && record.status !== 'completed' && (
              <Tooltip title="Hủy">
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  onClick={() => handleUpdateStatus(record, 'cancelled')}
                />
              </Tooltip>
            )}

            {canReview && (
              <Tooltip title="Đánh giá">
                <Button
                  icon={<StarOutlined />}
                  size="small"
                  style={{ backgroundColor: '#faad14', color: 'white' }}
                  onClick={() => handleOpenReviewModal(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Card title="Danh sách lịch hẹn" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 16, flexWrap: 'wrap', gap: '8px' }}
          initialValues={{
            status: 'all',
            employeeId: 'all',
            serviceId: 'all',
          }}
        >
          <Form.Item name="status" label="Trạng thái">
            <Select
              style={{ width: 140 }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          {!employeeId && (
            <Form.Item name="employeeId" label="Nhân viên">
              <Select
                style={{ width: 140 }}
                onChange={(value) => handleFilterChange('employeeId', value)}
              >
                <Option value="all">Tất cả</Option>
                {employees.map(employee => (
                  <Option key={employee.id} value={employee.id}>{employee.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="serviceId" label="Dịch vụ">
            <Select
              style={{ width: 140 }}
              onChange={(value) => handleFilterChange('serviceId', value)}
            >
              <Option value="all">Tất cả</Option>
              {services.map(service => (
                <Option key={service.id} value={service.id}>{service.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Thời gian">
            <RangePicker onChange={handleDateRangeChange} locale={locale} />
          </Form.Item>

          <Form.Item name="searchText" label="Tìm kiếm">
            <Input
              placeholder="Tên hoặc SĐT"
              prefix={<SearchOutlined />}
              onChange={handleSearch}
              style={{ width: 150 }}
            />
          </Form.Item>

          <Form.Item>
            <Button onClick={handleReset}>Đặt lại</Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <Modal
        title="Cập nhật lịch hẹn"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        {editingAppointment && (
          <AppointmentForm
            initialValues={editingAppointment}
            onSubmit={handleFormSubmit}
          />
        )}
      </Modal>

      <Modal
        title="Đánh giá dịch vụ"
        visible={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedAppointment && (
          <ReviewForm
            appointmentId={selectedAppointment.id}
            customerId={selectedAppointment.customerId}
            employeeId={selectedAppointment.employeeId}
            serviceId={selectedAppointment.serviceId}
            onSubmit={handleReviewSubmit}
          />
        )}
      </Modal>
    </div>
  );
};

export default AppointmentList;
