import React from 'react';
import { Button, Typography, Row, Col, Badge, Avatar, Divider, Select } from 'antd';
import { PlusOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { User } from '../../types/bai1';
import TaskForm from './TaskForm';
import MyTasksSection from './MyTasksSection';
import TeamWorkloadSection from './TeamWorkloadSection';
import TaskStatistics from './TaskStatistics';
import AllTasksTable from './AllTasksTable';
import useTasks from '../../hooks/bai1/useTasks';

const { Title } = Typography;
const { Option } = Select;

interface TaskListProps {
  currentUser: User;
  onLogout: () => void;
  registeredUsers: string[];
}

const TaskList: React.FC<TaskListProps> = ({ currentUser, onLogout, registeredUsers }) => {
  const {
    myTasks,
    filteredTasks,
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    isModalVisible,
    setIsModalVisible,
    editingTask,
    reassignMode,
    setReassignMode,
    selectedTaskIds,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleSaveTask,
    handleDragEnd,
    toggleTaskSelection,
    reassignTasks,
    allUsers,
    taskStats
  } = useTasks(currentUser, registeredUsers);

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Team Task Management</Title>
        </Col>
        <Col>
          <Row gutter={8} align="middle">
            <Col>
              <Button type="primary" onClick={handleAddTask} icon={<PlusOutlined />}>
                Add New Task
              </Button>
            </Col>
            <Col>
              <Button
                type={reassignMode ? "primary" : "default"}
                onClick={() => setReassignMode(!reassignMode)}
                icon={<SwapOutlined />}
                danger={reassignMode}
              >
                {reassignMode ? 'Cancel Reassign' : 'Batch Reassign'}
              </Button>
            </Col>
            {reassignMode && selectedTaskIds.length > 0 && (
              <Col>
                <Select
                  placeholder="Reassign to..."
                  style={{ width: 150 }}
                  onChange={reassignTasks}
                >
                  {allUsers.map(user => (
                    <Option key={user} value={user}>{user}</Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col>
              <Divider type="vertical" />
            </Col>
            <Col>
              <Badge count={taskStats.myTasksCount} style={{ backgroundColor: '#52c41a' }}>
                <Avatar icon={<UserOutlined />} />
              </Badge>
            </Col>
            <Col>
              <span style={{ fontWeight: 'bold', marginLeft: 8 }}>
                {currentUser.username}
              </span>
            </Col>
            <Col>
              <Button onClick={onLogout}>Logout</Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Statistics Section */}
      <TaskStatistics
        totalTasks={taskStats.totalTasks}
        completedTasks={taskStats.completedTasks}
        myTasksCount={taskStats.myTasksCount}
        myCompletedTasks={taskStats.myCompletedTasks}
      />

      {/* My Tasks Section */}
      <MyTasksSection
        tasks={myTasks}
        onDragEnd={handleDragEnd}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Team Workload Section */}
      <TeamWorkloadSection tasksByUser={taskStats.tasksByUser} />

      {/* All Tasks Section */}
      <AllTasksTable
        tasks={filteredTasks}
        searchText={searchText}
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        usernames={allUsers}
        onSearchChange={setSearchText}
        onStatusFilterChange={setStatusFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        reassignMode={reassignMode}
        selectedTaskIds={selectedTaskIds}
        onToggleSelection={toggleTaskSelection}
      />

      {/* Task Form Modal */}
      <TaskForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        usernames={allUsers}
        currentUser={currentUser}
      />
    </div>
  );
};

export default TaskList;