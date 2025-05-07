import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';

interface TaskStatisticsProps {
  totalTasks: number;
  completedTasks: number;
  myTasksCount: number;
  myCompletedTasks: number;
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({
  totalTasks,
  completedTasks,
  myTasksCount,
  myCompletedTasks
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="Total Tasks" value={totalTasks} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Completed Tasks"
            value={completedTasks}
            suffix={`/ ${totalTasks}`}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="My Tasks"
            value={myTasksCount}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="My Completed Tasks"
            value={myCompletedTasks}
            suffix={`/ ${myTasksCount}`}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TaskStatistics;