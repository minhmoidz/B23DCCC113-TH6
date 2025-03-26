import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Employee } from '../../models/bai2/employee';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

/** Định dạng mã nhân viên ngắn gọn hơn */
const formatEmployeeId = (id: string) => `NV-${id.slice(-4).toUpperCase()}`;

/** Hiển thị màu sắc cho trạng thái nhân viên */
const getStatusColor = (status: string) =>
  status === 'Đã ký hợp đồng' ? 'green' : 'orange';

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onEdit, onDelete, loading }) => {
  const handleDelete = (id: string, name: string) => {
    onDelete(id);
    message.success(`🗑️ Nhân viên "${name}" đã bị xóa thành công!`);
  };

  const columns = [
    {
      title: 'Mã NV',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Tooltip title={`Mã nhân viên đầy đủ: ${id}`}>
          <Tag color="blue">{formatEmployeeId(id)}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      align: 'right' as const,
      sorter: (a: Employee, b: Employee) => a.salary - b.salary,
      render: (salary: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {salary.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center' as const,
      width: 140,
      render: (_: any, record: Employee) => (
        <Space size="middle">
          {/* Nút chỉnh sửa */}
          <Tooltip title="Chỉnh sửa nhân viên">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onEdit(record);
                message.info(`✏️ Đang chỉnh sửa nhân viên "${record.name}"`);
              }}
            />
          </Tooltip>

          {/* Nút xóa (chỉ hiển thị với nhân viên thử việc) */}
          {record.status === 'Thử việc' ? (
            <Popconfirm
              title={`Bạn có chắc muốn xóa nhân viên "${record.name}"?`}
              onConfirm={() => handleDelete(record.id, record.name)}
              okText="Xóa"
              cancelText="Hủy"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            >
              <Tooltip title="Xóa nhân viên">
                <Button type="primary" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Tooltip title="Không thể xóa nhân viên đã ký hợp đồng">
              <Button type="default" disabled icon={<DeleteOutlined />} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={employees}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 'max-content' }}
      bordered // Hiển thị viền bảng
    />
  );
};

export default EmployeeTable;
