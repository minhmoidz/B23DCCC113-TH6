import React from 'react';
import { Row, Col, Tag, Button, Space, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Task } from '../../types/bai2';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showSelection?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string) => void;
  provided?: any;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  showSelection = false,
  isSelected = false,
  onToggleSelection,
  provided
}) => {
  return (
    <div
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      style={{
        ...(provided?.draggableProps?.style || {}),
        padding: 16,
        marginBottom: 8,
        border: '1px solid #f0f0f0',
        borderRadius: 4,
        backgroundColor: 'white',
        cursor: provided ? 'grab' : 'default'
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <div>
            {showSelection && onToggleSelection && (
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleSelection(task.id)}
                style={{ marginRight: 8 }}
              />
            )}
            <strong>{task.title}</strong>
          </div>
          <Space size="small" style={{ marginTop: 8 }}>
            <Tag color={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'orange' : 'green'}>
              {task.priority}
            </Tag>
            <Tag color={task.status === 'Completed' ? 'green' : task.status === 'In Progress' ? 'blue' : 'default'}>
              {task.status}
            </Tag>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
              type="text"
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => onDelete(task.id)}
              danger
              type="text"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default TaskItem;