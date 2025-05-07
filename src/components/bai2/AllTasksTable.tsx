import React from 'react';
import { Table, Space, Button, Tag, Card, Avatar, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Task } from '../../types/bai2';
import TaskFilters from './TaskFilters';

interface AllTasksTableProps {
  tasks: Task[];
  searchText: string;
  statusFilter: string | null;
  assigneeFilter: string | null;
  usernames: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onAssigneeFilterChange: (value: string | null) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  reassignMode: boolean;
  selectedTaskIds: string[];
  onToggleSelection: (taskId: string) => void;
}

const AllTasksTable: React.FC<AllTasksTableProps> = ({
  tasks,
  searchText,
  statusFilter,
  assigneeFilter,
  usernames,
  onSearchChange,
  onStatusFilterChange,
  onAssigneeFilterChange,
  onEdit,
  onDelete,
  reassignMode,
  selectedTaskIds,
  onToggleSelection
}) => {
  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <div>
          {reassignMode && (
            <Checkbox
              checked={selectedTaskIds.includes(record.id)}
              onChange={() => onToggleSelection(record.id)}
              style={{ marginRight: 8 }}
            />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignee: string) => (
        <div>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          {assignee}
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        let color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            type="text"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            danger
            type="text"
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="All Tasks">
      <TaskFilters
        searchText={searchText}
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        usernames={usernames}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        onAssigneeFilterChange={onAssigneeFilterChange}
      />

      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default AllTasksTable;