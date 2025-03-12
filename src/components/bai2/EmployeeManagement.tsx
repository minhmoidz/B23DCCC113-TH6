import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  TimePicker,
  Space,
  Card,
  message,
  Tooltip,
  Tag
} from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined, ScheduleOutlined } from '@ant-design/icons';
import { getEmployees, getServices, addEmployee, updateEmployee, deleteEmployee, getReviews,initializeDemoData } from '../../services/bai2/localStorageService';
import { Employee, Service, Review } from '../../interfaces/types';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { Option } = Select;
const { TextArea } = Input;

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      await loadData();
      setServices(getServices()); // Cập nhật sau khi load xong
    };
    fetchData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await initializeDemoData(); // Đảm bảo khởi tạo trước khi lấy dữ liệu
    setEmployees(getEmployees());
    setReviews(getReviews());
    setLoading(false);
  };
  const showModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);

    if (employee) {
      // Format working hours for form
      const formValues = {
        ...employee,
        workingHours: employee.workingHours.reduce((acc, wh) => ({
          ...acc,
          [`${wh.day}_isWorking`]: wh.isWorking,
          [`${wh.day}_startTime`]: wh.startTime ? dayjs(wh.startTime, 'HH:mm') : null,
          [`${wh.day}_endTime`]: wh.endTime ? dayjs(wh.endTime, 'HH:mm') : null,
        }), {})
      };

      form.setFieldsValue(formValues);
    } else {
      // Set default values for new employee
      const defaultWorkingHours = daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [`${day}_isWorking`]: day !== 'Sunday',
        [`${day}_startTime`]: dayjs('09:00', 'HH:mm'),
        [`${day}_endTime`]: dayjs('17:00', 'HH:mm'),
      }), {});

      form.setFieldsValue({
        maxAppointmentsPerDay: 8,
        ...defaultWorkingHours
      });
    }

    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (employeeId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa nhân viên',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.',
      onOk() {
        deleteEmployee(employeeId);
        message.success('Xóa nhân viên thành công');
        loadData();
      },
    });
  };

  const onFinish = (values: any) => {
    // Format working hours from form values
    const workingHours = daysOfWeek.map(day => ({
      day,
      startTime: values[`${day}_startTime`] ? values[`${day}_startTime`].format('HH:mm') : '09:00',
      endTime: values[`${day}_endTime`] ? values[`${day}_endTime`].format('HH:mm') : '17:00',
      isWorking: values[`${day}_isWorking`] || false,
    }));

    const employeeData = {
      name: values.name,
      services: values.services,
      maxAppointmentsPerDay: values.maxAppointmentsPerDay,
      workingHours,
    };

    if (editingEmployee) {
      // Update existing employee
      updateEmployee({
        ...employeeData,
        id: editingEmployee.id,
        averageRating: editingEmployee.averageRating,
      });
      message.success('Cập nhật nhân viên thành công');
    } else {
      // Add new employee
      addEmployee(employeeData);
      message.success('Thêm nhân viên thành công');
    }

    setIsModalVisible(false);
    form.resetFields();
    loadData();
  };

  const getEmployeeReviews = (employeeId: string) => {
    return reviews.filter(r => r.employeeId === employeeId);
  };

  const columns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'services',
      key: 'services',
      render: (serviceIds: string[]) => (
        <div>
          {serviceIds.map(id => {
            const service = services.find(s => s.id === id);
            return service ? (
              <Tag color="blue" key={id}>
                {service.name}
              </Tag>
            ) : null;
          })}
        </div>
      ),
    },
    {
      title: 'Số lịch hẹn tối đa/ngày',
      dataIndex: 'maxAppointmentsPerDay',
      key: 'maxAppointmentsPerDay',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating: number) => (
        <div>
          {rating > 0 ? (
            <span>{rating.toFixed(1)} ⭐ ({getEmployeeReviews(editingEmployee?.id || '').length} đánh giá)</span>
          ) : (
            <span>Chưa có đánh giá</span>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (text: string, record: Employee) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý nhân viên">
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => showModal()}
      >
        Thêm nhân viên mới
      </Button>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Tên nhân viên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Dịch vụ"
            name="services"
            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
          >
            <Select mode="multiple">
            {services.map(service => (
              <Select.Option key={service.name} value={service.name}>
                {service.name}
              </Select.Option>
            ))}
          </Select>

          </Form.Item>

          <Form.Item
            label="Số lịch hẹn tối đa/ngày"
            name="maxAppointmentsPerDay"
            rules={[{ required: true, message: 'Vui lòng nhập số lịch hẹn tối đa' }]}
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Card title="Giờ làm việc" size="small">
            {daysOfWeek.map(day => (
              <Space key={day} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  name={`${day}_isWorking`}
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>{day}</Checkbox>
                </Form.Item>
                <Form.Item
                  name={`${day}_startTime`}
                  style={{ marginBottom: 0 }}
                >
                  <TimePicker format="HH:mm" minuteStep={15} />
                </Form.Item>
                <span>-</span>
                <Form.Item
                  name={`${day}_endTime`}
                  style={{ marginBottom: 0 }}
                >
                  <TimePicker format="HH:mm" minuteStep={15} />
                </Form.Item>
              </Space>
            ))}
          </Card>
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeeManagement;
