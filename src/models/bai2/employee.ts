// src/models/employee.ts

/** Trạng thái nhân viên */
export type EmployeeStatus = 'Đã ký hợp đồng' | 'Thử việc';

/** Định nghĩa thông tin nhân viên */
export interface Employee {
  id: string;         // Mã nhân viên (tự động tạo)
  name: string;       // Họ và tên
  position: string;   // Chức vụ
  department: string; // Phòng ban
  salary: number;     // Lương
  status: EmployeeStatus; // Trạng thái hợp đồng
}

/** Kiểu dữ liệu cho nhân viên mới (không có ID, vì ID sẽ được tạo tự động) */
export type NewEmployeeData = Omit<Employee, 'id'>;

/**
 * Kiểu dữ liệu để cập nhật nhân viên
 * - `id` được truyền riêng, nên các trường còn lại có thể là tùy chọn
 */
export type UpdateEmployeeData = Partial<Omit<Employee, 'id'>>;

/**
 * Nếu cần truyền cả `id` trong object update, có thể dùng kiểu này:
 * export type UpdateEmployeeData = Partial<Employee> & { id: string };
 */

