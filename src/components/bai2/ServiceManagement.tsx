// components/ServiceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Service } from '../../interfaces/types';
import { serviceService } from '../../services/bai2/localStorageService';
import { v4 as uuidv4 } from 'uuid';

const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const servicesData = serviceService.getAll();
    setServices(servicesData);
  };

  const showModal = (service?: Service) => {
    setEditingService(service || null);
    if (service) {
      form.setFieldsValue(service);
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

      if (editingService) {
        // Cập nhật dịch vụ
        const updatedService = {
          ...editingService,
          ...values,
        };
        serviceService.update(updatedService);
      } else {
        // Thêm dịch vụ mới
        const newService: Service = {
          id: uuidv4(),
          ...values,
        };
        serviceService.add(newService);
      }

      setIsModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    serviceService.delete(id);
    loadData();
  };

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString('vi-VN'),
    },
    {
      title: 'Thời gian thực hiện (phút)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Service) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa dịch vụ này?"
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
    <Card title="Quản lý dịch vụ">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Thêm dịch vụ
      </Button>

      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
      />

      <Modal
        title={editingService ? "Cập nhật thông tin dịch vụ" : "Thêm dịch vụ mới"}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            price: 0,
            durationMinutes: 30,
          }}
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Thời gian thực hiện (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện!' }]}
          >
            <InputNumber min={5} max={480} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ServiceManagement;
