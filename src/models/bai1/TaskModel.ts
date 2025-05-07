import { Task } from '../../types/bai1/index';


export const TaskModel = {
  getAll: (): Task[] => {
    try {
      const tasks = localStorage.getItem('tasks');
      if (!tasks) return [];

      const parsedTasks = JSON.parse(tasks);
      return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
      console.error('Error retrieving tasks from localStorage:', error);
      return [];
    }
  },

  save: (tasks: Task[]): void => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },

  add: (task: Task): void => {
    const tasks = TaskModel.getAll();
    tasks.push(task);
    TaskModel.save(tasks);
  },

  update: (updatedTask: Task): void => {
    const tasks = TaskModel.getAll();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      TaskModel.save(tasks);
    }
  },

  delete: (taskId: string): void => {
    const tasks = TaskModel.getAll();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    TaskModel.save(filteredTasks);
  },

  reorder: (tasks: Task[]): void => {
    TaskModel.save(tasks);
  }
};
