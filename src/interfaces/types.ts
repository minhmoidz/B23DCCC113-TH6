// models/types.ts
export interface Employee {
  id: string;
  name: string;
  services: string[];
  maxAppointmentsPerDay: number;
  workSchedule: {
    dayOfWeek: number; // 0-6 (Chủ nhật - Thứ 7)
    startTime: string; // Format: "HH:mm"
    endTime: string; // Format: "HH:mm"
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
  serviceId: string;
  employeeId: string;
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  customerId: string;
  employeeId: string;
  serviceId: string;
  rating: number; // 1-5
  comment: string;
  employeeResponse?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}
