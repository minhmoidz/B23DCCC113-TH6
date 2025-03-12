// components/EmployeeManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, TimePicker, Space, Popconfirm, Card, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Employee, Service } from '../../interfaces/types';
import { employeeService, serviceService } from '../../services/bai2/localStorageService';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const { Option } = Select;

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const employeesData = employeeService.getAll();
    const servicesData = serviceService.getAll();
    setEmployees(employeesData);
    setServices(servicesData);
  };

  const showModal = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    if (employee) {
      form.setFieldsValue({
        ...employee,
        workSchedule: employee.workSchedule.map(schedule => ({
          ...schedule,
          startTime: dayjs(schedule.startTime, 'HH:mm'),
          endTime: dayjs(schedule.endTime, 'HH:mm'),
        })),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Chuyển đổi định dạng thời gian
      const formattedValues = {
        ...values,
        workSchedule: values.workSchedule.map((schedule: any) => ({
          ...schedule,
          startTime: schedule.startTime.format('HH:mm'),
          endTime: schedule.endTime.format('HH:mm'),
        })),
      };

      if (editingEmployee) {
        // Cập nhật nhân viên
        const updatedEmployee = {
          ...editingEmployee,
          ...formattedValues,
        };
        employeeService.update(updatedEmployee);
      } else {
        // Thêm nhân viên mới
        const newEmployee: Employee = {
          id: uuidv4(),
          averageRating: 0,
          ...formattedValues,
        };
        employeeService.add(newEmployee);
      }

      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    employeeService.delete(id);
    loadData();
  };

  const columns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Dịch vụ cung cấp',
      dataIndex: 'services',
      key: 'services',
      render: (serviceIds: string[]) => (
        <>
          {serviceIds.map(id => {
            const service = services.find(s => s.id === id);
            return service ? <div key={id}>{service.name}</div> : null;
          })}
        </>
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
      render: (rating: number) => <Rate disabled defaultValue={rating} allowHalf />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Employee) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý nhân viên">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Thêm nhân viên
      </Button>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <div>

              <h4>Lịch làm việc:</h4>
              <ul>
                {record.workSchedule.map((schedule, index) => {
                  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                  return (
                    <li key={index}>
                      {days[schedule.dayOfWeek]}: {schedule.startTime} - {schedule.endTime}
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
        }}
      />

      <Modal
        title={editingEmployee ? "Cập nhật thông tin nhân viên" : "Thêm nhân viên mới"}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            workSchedule: [{ dayOfWeek: 1, startTime: dayjs('09:00', 'HH:mm'), endTime: dayjs('17:00', 'HH:mm') }],
            maxAppointmentsPerDay: 10,
          }}
        >
          <Form.Item
            name="name"
            label="Tên nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="services"
            label="Dịch vụ cung cấp"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một dịch vụ!' }]}
          >
            <Select mode="multiple" placeholder="Chọn dịch vụ">
              {services.map(service => (
                <Option key={service.id} value={service.id}>{service.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="maxAppointmentsPerDay"
            label="Số lịch hẹn tối đa/ngày"
            rules={[{ required: true, message: 'Vui lòng nhập số lịch hẹn tối đa!' }]}
          >
            <InputNumber min={1} max={50} />
          </Form.Item>

          <Form.List name="workSchedule">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'dayOfWeek']}
                      rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
                    >
                      <Select style={{ width: 120 }} placeholder="Ngày">
                        <Option value={0}>Chủ nhật</Option>
                        <Option value={1}>Thứ 2</Option>
                        <Option value={2}>Thứ 3</Option>
                        <Option value={3}>Thứ 4</Option>
                        <Option value={4}>Thứ 5</Option>
                        <Option value={5}>Thứ 6</Option>
                        <Option value={6}>Thứ 7</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'startTime']}
                      rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
                    >
                      <TimePicker format="HH:mm" placeholder="Giờ bắt đầu" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'endTime']}
                      rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
                    >
                      <TimePicker format="HH:mm" placeholder="Giờ kết thúc" />
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>Xóa</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm lịch làm việc
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeeManagement;

