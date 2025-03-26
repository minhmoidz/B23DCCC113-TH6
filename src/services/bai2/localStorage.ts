// src/services/localStorage.ts
import { Employee } from '../../models/bai2/employee';

const STORAGE_KEY = 'employeesData';

export const loadEmployeesFromStorage = (): Employee[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Employee[];
    }
  } catch (error) {
    console.error("Error loading employees from local storage:", error);
    // Có thể xóa dữ liệu bị lỗi nếu cần
    // localStorage.removeItem(STORAGE_KEY);
  }
  return []; // Trả về mảng rỗng nếu không có dữ liệu hoặc lỗi
};

export const saveEmployeesToStorage = (employees: Employee[]): void => {
  try {
    const data = JSON.stringify(employees);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error("Error saving employees to local storage:", error);
  }
};
