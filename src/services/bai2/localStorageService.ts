
// storage.ts - quản lý dữ liệu trong LocalStorage
import { Employee, Service, Appointment, Review, Customer, User } from '../../interfaces/types';

const KEYS = {
  EMPLOYEES: 'appointment_app_employees',
  SERVICES: 'appointment_app_services',
  APPOINTMENTS: 'appointment_app_appointments',
  REVIEWS: 'appointment_app_reviews',
  CUSTOMERS: 'appointment_app_customers',
  USERS: 'appointment_app_users',
  CURRENT_USER: 'appointment_app_current_user',
};

// Helpers
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Services CRUD
export const getServices = (): Service[] => {
  return getItem<Service[]>(KEYS.SERVICES, []);
};

export const addService = (service: Omit<Service, 'id'>): Service => {
  const services = getServices();
  const newService = { ...service, id: Date.now().toString() };
  setItem(KEYS.SERVICES, [...services, newService]);
  return newService;
};

export const updateService = (service: Service): void => {
  const services = getServices();
  const index = services.findIndex(s => s.id === service.id);
  if (index !== -1) {
    services[index] = service;
    setItem(KEYS.SERVICES, services);
  }
};

export const deleteService = (id: string): void => {
  const services = getServices();
  setItem(KEYS.SERVICES, services.filter(s => s.id !== id));
};

// Employees CRUD
export const getEmployees = (): Employee[] => {
  return getItem<Employee[]>(KEYS.EMPLOYEES, []);
};

export const addEmployee = (employee: Omit<Employee, 'id' | 'averageRating'>): Employee => {
  const employees = getEmployees();
  // Thêm workingHours vào đối tượng nhân viên
  const newEmployee: Employee = {
    ...employee,
    id: Date.now().toString(),
    averageRating: 0,
    workingHours: employee.workingHours || [] // Đảm bảo có workingHours
  };
  setItem(KEYS.EMPLOYEES, [...employees, newEmployee]);
  return newEmployee;
};

export const updateEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index !== -1) {
    // Cập nhật toàn bộ thông tin, bao gồm workingHours
    employees[index] = { ...employee };
    setItem(KEYS.EMPLOYEES, employees);
  }
};


export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  setItem(KEYS.EMPLOYEES, employees.filter(e => e.id !== id));
};

// Appointments CRUD
export const getAppointments = (): Appointment[] => {
  return getItem<Appointment[]>(KEYS.APPOINTMENTS, []);
};

export const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
  const appointments = getAppointments();
  const newAppointment = {
    ...appointment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  setItem(KEYS.APPOINTMENTS, [...appointments, newAppointment]);
  return newAppointment;
};

export const updateAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === appointment.id);
  if (index !== -1) {
    appointments[index] = appointment;
    setItem(KEYS.APPOINTMENTS, appointments);
  }
};

export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments();
  setItem(KEYS.APPOINTMENTS, appointments.filter(a => a.id !== id));
};

// Reviews CRUD
export const getReviews = (): Review[] => {
  return getItem<Review[]>(KEYS.REVIEWS, []);
};

export const addReview = (review: Omit<Review, 'id' | 'createdAt'>): Review => {
  const reviews = getReviews();
  const newReview = {
    ...review,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  setItem(KEYS.REVIEWS, [...reviews, newReview]);

  // Update employee average rating
  updateEmployeeRating(review.employeeId);

  return newReview;
};

export const updateReview = (review: Review): void => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === review.id);
  if (index !== -1) {
    reviews[index] = review;
    setItem(KEYS.REVIEWS, reviews);

    // Update employee average rating
    updateEmployeeRating(review.employeeId);
  }
};

export const deleteReview = (id: string): void => {
  const reviews = getReviews();
  const review = reviews.find(r => r.id === id);
  if (review) {
    setItem(KEYS.REVIEWS, reviews.filter(r => r.id !== id));

    // Update employee average rating
    updateEmployeeRating(review.employeeId);
  }
};

// Helper to update employee rating
const updateEmployeeRating = (employeeId: string): void => {
  const reviews = getReviews().filter(r => r.employeeId === employeeId);
  const employees = getEmployees();
  const employee = employees.find(e => e.id === employeeId);

  if (employee && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    employee.averageRating = Number((totalRating / reviews.length).toFixed(1));
    updateEmployee(employee);
  }
};

// Customers CRUD
export const getCustomers = (): Customer[] => {
  return getItem<Customer[]>(KEYS.CUSTOMERS, []);
};

export const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const customers = getCustomers();
  const newCustomer = { ...customer, id: Date.now().toString() };
  setItem(KEYS.CUSTOMERS, [...customers, newCustomer]);
  return newCustomer;
};

export const updateCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    customers[index] = customer;
    setItem(KEYS.CUSTOMERS, customers);
  }
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers();
  setItem(KEYS.CUSTOMERS, customers.filter(c => c.id !== id));
};



// Khởi tạo dữ liệu mẫu
export const initializeDemoData = (): void => {
  if (getServices().length === 0) {
    const services: Omit<Service, 'id'>[] = [
      { name: 'Cắt tóc nam', price: 100000, durationMinutes: 30, description: 'Cắt tóc theo yêu cầu' },
      { name: 'Cắt tóc nữ', price: 150000, durationMinutes: 45, description: 'Cắt tóc theo yêu cầu' },
      { name: 'Massage', price: 300000, durationMinutes: 60, description: 'Massage thư giãn toàn thân' },
      { name: 'Spa facial', price: 350000, durationMinutes: 90, description: 'Chăm sóc da mặt' },
      { name: 'Sửa máy tính', price: 200000, durationMinutes: 120, description: 'Kiểm tra và sửa chữa lỗi' },
    ];
    // Thêm từng dịch vụ vào hệ thống
    services.forEach(service => addService(service));
  }
};

export const saveServices = (services: Service[]) => {
  localStorage.setItem('services', JSON.stringify(services));
};
