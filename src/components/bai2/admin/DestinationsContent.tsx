// src/components/admin/DestinationsContent.tsx
import React, { useState } from 'react';
import {
  Card, Table, Button, Form, Input, InputNumber,
  Select, Upload, Modal, Row, Col, Popconfirm, Space, Tag, Rate
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { formatPrice, getTypeName, getTypeColor } from '../../../utils/bai2/helpers';
import type { DestinationType } from '../../../types/bai2/index';

const { Option } = Select;

interface DestinationsContentProps {
  destinations: DestinationType[];
  onAdd: (destination: DestinationType) => void;
  onUpdate: (destination: DestinationType) => void;
  onDelete: (id: string) => void;
}

const DestinationsContent: React.FC<DestinationsContentProps> = ({
  destinations, onAdd, onUpdate, onDelete
}) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingDestination, setEditingDestination] = useState<DestinationType | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const showAddModal = () => {
    setEditingDestination(null);
    form.resetFields();
    setImageUrl('');
    setIsModalVisible(true);
  };

  const showEditModal = (destination: DestinationType) => {
    setEditingDestination(destination);
    form.setFieldsValue({
      name: destination.name,
      location: destination.location,
      type: destination.type,
      price: destination.price,
      rating: destination.rating,
      description: destination.description
    });
    setImageUrl(destination.imageUrl);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = (values: any) => {
    setLoading(true);

    // Prepare destination data
    const destinationData: DestinationType = {
      id: editingDestination ? editingDestination.id : Date.now().toString(),
      name: values.name,
      location: values.location,
      type: values.type,
      price: values.price,
      rating: values.rating,
      description: values.description || '',
      imageUrl: imageUrl || 'https://via.placeholder.com/300x200'
    };

    // Simulate API call
    setTimeout(() => {
      if (editingDestination) {
        onUpdate(destinationData);
      } else {
        onAdd(destinationData);
      }

      setLoading(false);
      setIsModalVisible(false);
    }, 1000);
  };

  const handleImageUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }

    if (info.file.status === 'done') {
      // This is just a mock, in a real app you would get the URL from the server response
      setImageUrl(`https://source.unsplash.com/random/300x200?travel&sig=${Date.now()}`);
    }
  };

  const destinationColumns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string) => (
        <img src={imageUrl} alt="Destination" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
      )
    },
    {
      title: 'Tên điểm đến',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DestinationType, b: DestinationType) => a.name.localeCompare(b.name)
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      sorter: (a: DestinationType, b: DestinationType) => a.location.localeCompare(b.location)
    },
    {
      title: 'Loại hình',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{getTypeName(type)}</Tag>
      ),
      filters: [
        { text: 'Biển', value: 'beach' },
        { text: 'Núi', value: 'mountain' },
        { text: 'Thành phố', value: 'city' },
        { text: 'Nông thôn', value: 'countryside' },
        { text: 'Văn hóa', value: 'cultural' }
      ],
      onFilter: (value: string, record: DestinationType) => record.type === value
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
      sorter: (a: DestinationType, b: DestinationType) => a.price - b.price
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
      sorter: (a: DestinationType, b: DestinationType) => a.rating - b.rating
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: DestinationType) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => onDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="destinations-content">
      <Card
        title="Quản lý điểm đến"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Thêm điểm đến
          </Button>
        }
      >
        <Table
          dataSource={destinations}
          columns={destinationColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingDestination ? "Sửa điểm đến" : "Thêm điểm đến mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên điểm đến"
                rules={[{ required: true, message: 'Vui lòng nhập tên điểm đến' }]}
              >
                <Input placeholder="Nhập tên điểm đến" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Địa điểm"
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
              >
                <Input placeholder="Nhập địa điểm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Loại hình"
                rules={[{ required: true, message: 'Vui lòng chọn loại hình' }]}
              >
                <Select placeholder="Chọn loại hình">
                  <Option value="beach">Biển</Option>
                  <Option value="mountain">Núi</Option>
                  <Option value="city">Thành phố</Option>
                  <Option value="countryside">Nông thôn</Option>
                  <Option value="cultural">Văn hóa</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}đ`}
                  parser={value => value!.replace('đ', '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="rating"
                label="Đánh giá"
                rules={[{ required: true, message: 'Vui lòng chọn đánh giá' }]}
              >
                <Rate allowHalf />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả về điểm đến" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
          >
            <div className="upload-container">
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                onChange={handleImageUpload}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
              {imageUrl && (
                <Button
                  danger
                  onClick={() => setImageUrl('')}
                  style={{ marginTop: 8 }}
                >
                  Xóa hình ảnh
                </Button>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDestination ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={handleCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DestinationsContent;
