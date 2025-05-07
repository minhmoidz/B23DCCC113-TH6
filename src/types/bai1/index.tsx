export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Completed';
  createdAt: number;
  order: number;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export interface TaskStats {
  username: string;
  count: number;
  completed: number;
}
