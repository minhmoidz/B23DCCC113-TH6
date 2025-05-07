
import React, { useState } from 'react';
import { Table, Space, Button, Tag, Input, Select, Card, Typography, Row, Col, Statistic, Tooltip, Badge, Avatar, Empty, Divider, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { Task, User } from '../../types/bai2/index';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskForm from '../../components/bai2/TaskForm';
import { TaskModel } from '../../models/bai2/TaskModel';

const { Title, Text } = Typography;
const { Option } = Select;

interface TaskListProps {
  currentUser: User;
  onLogout: () => void;
  registeredUsers: string[];
}

const TaskList: React.FC<TaskListProps> = ({ currentUser, onLogout, registeredUsers }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = TaskModel.getAll();
      return Array.isArray(savedTasks) ? savedTasks : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Get all unique usernames from tasks - with null checking
  const allUsers = [...new Set([
    ...(registeredUsers || []),
    ...tasks.map(task => task.assignedTo).filter(Boolean)
  ])];

  const handleAddTask = () => {
    // Reset editing task to null and show modal
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    TaskModel.delete(taskId);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // Update existing task
        const updatedTask = { ...editingTask, ...taskData };
        const updatedTasks = tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
        setTasks(updatedTasks);
        TaskModel.update(updatedTask);
      } else {
        // Add new task
        const newTask: Task = {
          id: Date.now().toString(),
          title: taskData.title || '',
          assignedTo: taskData.assignedTo || '',
          priority: taskData.priority as Task['priority'] || 'Medium',
          status: taskData.status as Task['status'] || 'Todo',
          createdAt: Date.now(),
          order: tasks.length
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        TaskModel.add(newTask);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !Array.isArray(tasks)) return;

    try {
      // Filter to get only user's tasks for correct reordering
      const userTasks = tasks.filter(task => task.assignedTo === currentUser.username);
      const allOtherTasks = tasks.filter(task => task.assignedTo !== currentUser.username);

      const items = Array.from(userTasks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update order property for user tasks
      const updatedUserTasks = items.map((task, index) => ({
        ...task,
        order: index
      }));

      // Combine with other tasks and update state
      const updatedTasks = [...updatedUserTasks, ...allOtherTasks];
      setTasks(updatedTasks);
      TaskModel.reorder(updatedTasks);
    } catch (error) {
      console.error('Error during drag and drop:', error);
    }
  };

  // Toggle task selection for batch reassignment
  const toggleTaskSelection = (taskId: string) => {
    if (selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
  };

  // Batch reassign selected tasks to a user
  const reassignTasks = (assigneeUsername: string) => {
    const updatedTasks = tasks.map(task => {
      if (selectedTaskIds.includes(task.id)) {
        return { ...task, assignedTo: assigneeUsername };
      }
      return task;
    });

    setTasks(updatedTasks);
    selectedTaskIds.forEach(id => {
      const task = updatedTasks.find(t => t.id === id);
      if (task) TaskModel.update(task);
    });

    // Reset selection
    setSelectedTaskIds([]);
    setReassignMode(false);
  };

  // Filter and search tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = searchText ?
        task.title.toLowerCase().includes(searchText.toLowerCase()) :
        true;

      const matchesStatus = statusFilter ?
        task.status === statusFilter :
        true;

      const matchesAssignee = assigneeFilter ?
        task.assignedTo === assigneeFilter :
        true;

      return matchesSearch && matchesStatus && matchesAssignee;
    })
    .sort((a, b) => a.order - b.order);

  // Get current user tasks
  const myTasks = tasks
    .filter(task => task.assignedTo === currentUser.username)
    .sort((a, b) => a.order - b.order);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const myTasksCount = myTasks.length;
  const myCompletedTasks = myTasks.filter(task => task.status === 'Completed').length;

  // Task stats by user
  const tasksByUser = allUsers.map(user => {
    const userTasks = tasks.filter(task => task.assignedTo === user);
    return {
      username: user,
      count: userTasks.length,
      completed: userTasks.filter(task => task.status === 'Completed').length
    };
  }).sort((a, b) => b.count - a.count);

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
              onChange={() => toggleTaskSelection(record.id)}
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
        <Tooltip title={`Assigned to ${assignee}`}>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          {assignee}
        </Tooltip>
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
            onClick={() => handleEditTask(record)}
            type="text"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTask(record.id)}
            danger
            type="text"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Team Task Management</Title>
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={handleAddTask} icon={<PlusOutlined />}>
              Add New Task
            </Button>
            <Button
              type={reassignMode ? "primary" : "default"}
              onClick={() => setReassignMode(!reassignMode)}
              icon={<SwapOutlined />}
              danger={reassignMode}
            >
              {reassignMode ? 'Cancel Reassign' : 'Batch Reassign'}
            </Button>
            {reassignMode && selectedTaskIds.length > 0 && (
              <Select
                placeholder="Reassign to..."
                style={{ width: 150 }}
                onChange={reassignTasks}
              >
                {allUsers.map(user => (
                  <Option key={user} value={user}>{user}</Option>
                ))}
              </Select>
            )}
            <Divider type="vertical" />
            <Badge count={myTasksCount} style={{ backgroundColor: '#52c41a' }}>
              <Avatar icon={<UserOutlined />} />
            </Badge>
            <span style={{ fontWeight: 'bold' }}>
              {currentUser.username}
            </span>
            <Button onClick={onLogout}>Logout</Button>
          </Space>
        </Col>
      </Row>

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

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>My Tasks (Drag to reorder)</span>
            <Button
              type="primary"
              size="small"
              onClick={handleAddTask}
              icon={<PlusOutlined />}
            >
              Add Task
            </Button>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {myTasks.length > 0 ? (
                  myTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            padding: 16,
                            marginBottom: 8,
                            border: '1px solid #f0f0f0',
                            borderRadius: 4,
                            backgroundColor: 'white',
                            cursor: 'grab'
                          }}
                        >
                          <Row justify="space-between" align="middle">
                            <Col>
                              <div>
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
                                  onClick={() => handleEditTask(task)}
                                  type="text"
                                />
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteTask(task.id)}
                                  danger
                                  type="text"
                                />
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <Empty description="No tasks assigned to you yet" />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>

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

      <Card title="All Tasks">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Search by task name"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setStatusFilter(value)}
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
              onChange={(value) => setAssigneeFilter(value)}
            >
              {allUsers.map(user => (
                <Option key={user} value={user}>{user}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={filteredTasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

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
