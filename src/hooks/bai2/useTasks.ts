import { useState } from 'react';
import { Task, User, TaskStats } from '../../types/bai2';
import { TaskModel } from '../../models/bai2/TaskModel';

export const useTasks = (currentUser: User, registeredUsers: string[]) => {
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

  // Get all unique usernames from tasks
  const allUsers = [...new Set([
    ...(registeredUsers || []),
    ...tasks.map(task => task.assignedTo).filter(Boolean)
  ])];

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
  const tasksByUser: TaskStats[] = allUsers.map(user => {
    const userTasks = tasks.filter(task => task.assignedTo === user);
    return {
      username: user,
      count: userTasks.length,
      completed: userTasks.filter(task => task.status === 'Completed').length
    };
  }).sort((a, b) => b.count - a.count);

  const handleAddTask = () => {
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

  return {
    tasks,
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
    setEditingTask,
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
    taskStats: {
      totalTasks,
      completedTasks,
      myTasksCount,
      myCompletedTasks,
      tasksByUser
    }
  };
};

export default useTasks;