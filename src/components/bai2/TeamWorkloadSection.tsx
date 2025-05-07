import React from 'react';
import { Card, Row, Col, Avatar, Typography, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { TaskStats } from '../../types/bai2';

const { Text } = Typography;

interface TeamWorkloadSectionProps {
  tasksByUser: TaskStats[];
}

const TeamWorkloadSection: React.FC<TeamWorkloadSectionProps> = ({
  tasksByUser
}) => {
  return (
    <Card
      title="Team Workload"
      style={{ marginBottom: 24 }}
    >
      <Row gutter={16}>
        {tasksByUser.map(user => (
          <Col span={8} key={user.username} style={{ marginBottom: 16 }}>
            <Card size="small">
              <Row justify="space-between" align="middle">
                <Col>
                  <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  <Text strong>{user.username}</Text>
                </Col>
                <Col>
                  <Tag>{user.completed} / {user.count} completed</Tag>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default TeamWorkloadSection;