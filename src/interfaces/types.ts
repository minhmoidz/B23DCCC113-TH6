// types.ts - định nghĩa các kiểu dữ liệu
export interface Employee {
  id: string;
  name: string;
  services: string[];
  maxAppointmentsPerDay: number;
  workingHours: {
    day: string; // "Monday", "Tuesday", etc.
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    isWorking: boolean;
  }[];
  averageRating: number;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  employeeId: string;
  serviceId: string;
  date: string; // ISO format
  startTime: string; // "09:00"
  endTime: string; // Calculated based on service duration
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  customerId: string;
  employeeId: string;
  serviceId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  reply?: {
    text: string;
    createdAt: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'employee' | 'customer';
  employeeId?: string;
  customerId?: string;
}
