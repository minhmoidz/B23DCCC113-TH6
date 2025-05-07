import React from 'react';
import { Row, Col, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

interface TaskFiltersProps {
  searchText: string;
  statusFilter: string | null;
  assigneeFilter: string | null;
  usernames: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onAssigneeFilterChange: (value: string | null) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchText,
  statusFilter,
  assigneeFilter,
  usernames,
  onSearchChange,
  onStatusFilterChange,
  onAssigneeFilterChange
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Input
          placeholder="Search by task name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
      </Col>
      <Col span={8}>
        <Select
          placeholder="Filter by status"
          style={{ width: '100%' }}
          allowClear
          value={statusFilter || undefined}
          onChange={(value) => onStatusFilterChange(value)}
        >
          <Option value="Todo">Todo</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Completed">Completed</Option>
        </Select>
      </Col>
      <Col span={8}>
        <Select
          placeholder="Filter by assignee"
          style={{ width: '100%' }}
          allowClear
          value={assigneeFilter || undefined}
          onChange={(value) => onAssigneeFilterChange(value)}
        >
          {usernames.map(user => (
            <Option key={user} value={user}>{user}</Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default TaskFilters;