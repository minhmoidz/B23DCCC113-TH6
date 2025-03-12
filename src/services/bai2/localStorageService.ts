// services/storage.ts
import { Employee, Service, Appointment, Review, Customer } from '../models/types';

const STORAGE_KEYS = {
  EMPLOYEES: 'app_employees',
  SERVICES: 'app_services',
  APPOINTMENTS: 'app_appointments',
  REVIEWS: 'app_reviews',
  CUSTOMERS: 'app_customers',
};

// Generic function to get data from localStorage
export function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Generic function to save data to localStorage
export function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Employee storage functions
export const employeeService = {
  getAll: (): Employee[] => getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES),
  save: (employees: Employee[]): void => saveToStorage(STORAGE_KEYS.EMPLOYEES, employees),
  getById: (id: string): Employee | undefined => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    return employees.find(emp => emp.id === id);
  },
  add: (employee: Employee): void => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    employees.push(employee);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  },
  update: (employee: Employee): void => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
      saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
    }
  },
  delete: (id: string): void => {
    const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, filteredEmployees);
  }
};

// Service storage functions
export const serviceService = {
  getAll: (): Service[] => getFromStorage<Service>(STORAGE_KEYS.SERVICES),
  save: (services: Service[]): void => saveToStorage(STORAGE_KEYS.SERVICES, services),
  getById: (id: string): Service | undefined => {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    return services.find(service => service.id === id);
  },
  add: (service: Service): void => {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    services.push(service);
    saveToStorage(STORAGE_KEYS.SERVICES, services);
  },
  update: (service: Service): void => {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    const index = services.findIndex(s => s.id === service.id);
    if (index !== -1) {
      services[index] = service;
      saveToStorage(STORAGE_KEYS.SERVICES, services);
    }
  },
  delete: (id: string): void => {
    const services = getFromStorage<Service>(STORAGE_KEYS.SERVICES);
    const filteredServices = services.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SERVICES, filteredServices);
  }
};

// Appointment storage functions
export const appointmentService = {
  getAll: (): Appointment[] => getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS),
  save: (appointments: Appointment[]): void => saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments),
  getById: (id: string): Appointment | undefined => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return appointments.find(app => app.id === id);
  },
  add: (appointment: Appointment): void => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    appointments.push(appointment);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  },
  update: (appointment: Appointment): void => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const index = appointments.findIndex(app => app.id === appointment.id);
    if (index !== -1) {
      appointments[index] = appointment;
      saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
    }
  },
  delete: (id: string): void => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    const filteredAppointments = appointments.filter(app => app.id !== id);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, filteredAppointments);
  },
  getByEmployeeAndDate: (employeeId: string, date: string): Appointment[] => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return appointments.filter(app => app.employeeId === employeeId && app.date === date);
  },
  getByCustomerId: (customerId: string): Appointment[] => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    return appointments.filter(app => app.customerId === customerId);
  },
  checkOverlap: (employeeId: string, date: string, startTime: string, endTime: string, excludeAppointmentId?: string): boolean => {
    const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS)
      .filter(app =>
        app.employeeId === employeeId &&
        app.date === date &&
        app.status !== 'cancelled' &&
        (excludeAppointmentId ? app.id !== excludeAppointmentId : true)
      );

    for (const app of appointments) {
      if (
        (startTime >= app.startTime && startTime < app.endTime) ||
        (endTime > app.startTime && endTime <= app.endTime) ||
        (startTime <= app.startTime && endTime >= app.endTime)
      ) {
        return true; // Có sự trùng lặp
      }
    }

    return false; // Không có sự trùng lặp
  }
};

// Review storage functions
export const reviewService = {
  getAll: (): Review[] => getFromStorage<Review>(STORAGE_KEYS.REVIEWS),
  save: (reviews: Review[]): void => saveToStorage(STORAGE_KEYS.REVIEWS, reviews),
  getById: (id: string): Review | undefined => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    return reviews.find(review => review.id === id);
  },
  add: (review: Review): void => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    reviews.push(review);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

    // Cập nhật đánh giá trung bình của nhân viên
    updateEmployeeAverageRating(review.employeeId);
  },
  update: (review: Review): void => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    const index = reviews.findIndex(r => r.id === review.id);
    if (index !== -1) {
      reviews[index] = review;
      saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

      // Cập nhật đánh giá trung bình của nhân viên
      updateEmployeeAverageRating(review.employeeId);
    }
  },
  delete: (id: string): void => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    const reviewToDelete = reviews.find(r => r.id === id);
    const filteredReviews = reviews.filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.REVIEWS, filteredReviews);

    // Cập nhật đánh giá trung bình của nhân viên
    if (reviewToDelete) {
      updateEmployeeAverageRating(reviewToDelete.employeeId);
    }
  },
  getByEmployeeId: (employeeId: string): Review[] => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    return reviews.filter(review => review.employeeId === employeeId);
  },
  getByAppointmentId: (appointmentId: string): Review | undefined => {
    const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS);
    return reviews.find(review => review.appointmentId === appointmentId);
  }
};

// Customer storage functions
export const customerService = {
  getAll: (): Customer[] => getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS),
  save: (customers: Customer[]): void => saveToStorage(STORAGE_KEYS.CUSTOMERS, customers),
  getById: (id: string): Customer | undefined => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.find(customer => customer.id === id);
  },
  add: (customer: Customer): void => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    customers.push(customer);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  },
  update: (customer: Customer): void => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const index = customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      customers[index] = customer;
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }
  },
  delete: (id: string): void => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    const filteredCustomers = customers.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
  },
  getByPhone: (phone: string): Customer | undefined => {
    const customers = getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers.find(customer => customer.phone === phone);
  }
};

// Hàm hỗ trợ cập nhật đánh giá trung bình của nhân viên
function updateEmployeeAverageRating(employeeId: string): void {
  const reviews = getFromStorage<Review>(STORAGE_KEYS.REVIEWS)
    .filter(review => review.employeeId === employeeId);

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const employees = getFromStorage<Employee>(STORAGE_KEYS.EMPLOYEES);
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);

  if (employeeIndex !== -1) {
    employees[employeeIndex].averageRating = Math.round(averageRating * 10) / 10; // Làm tròn đến 1 chữ số thập phân
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  }
}
