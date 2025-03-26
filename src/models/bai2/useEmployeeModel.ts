// src/models/useEmployeeModel.ts
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
// --- Nhập các kiểu dữ liệu từ file employee.ts ---
import { Employee, NewEmployeeData, UpdateEmployeeData } from './employee';
// --- Sửa đường dẫn import cho localStorage ---
import { loadEmployeesFromStorage, saveEmployeesToStorage } from '../../services/bai2/localStorage';
import { message } from 'antd';

export const useEmployeeModel = () => {
  // State quản lý danh sách nhân viên
  const [employees, setEmployees] = useState<Employee[]>([]);
  // State quản lý trạng thái loading (tùy chọn, có thể thêm nếu cần xử lý bất đồng bộ phức tạp hơn)
  const [loading, setLoading] = useState<boolean>(true); // Bắt đầu là true khi load lần đầu

  // Load dữ liệu từ Local Storage khi component mount lần đầu
  useEffect(() => {
    setLoading(true); // Bắt đầu loading
    try {
      const loadedEmployees = loadEmployeesFromStorage();
      setEmployees(loadedEmployees);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nhân viên:", error);
      message.error('Không thể tải dữ liệu nhân viên từ bộ nhớ cục bộ.');
      setEmployees([]); // Đặt lại thành mảng rỗng nếu có lỗi
    } finally {
      setLoading(false); // Kết thúc loading dù thành công hay thất bại
    }
    // Mảng phụ thuộc rỗng [] đảm bảo effect này chỉ chạy một lần khi component mount
  }, []);

  // Lưu dữ liệu vào Local Storage mỗi khi state `employees` thay đổi
  // Sử dụng một useEffect riêng để tránh lưu trữ không cần thiết khi chỉ loading
  useEffect(() => {
    // Chỉ lưu nếu không phải lần load đầu tiên (khi loading đã xong)
    // Hoặc nếu bạn muốn lưu ngay cả khi lần đầu load (nếu có dữ liệu mặc định chẳng hạn) thì bỏ điều kiện if(!loading)
     if (!loading) { // Chỉ lưu khi đã load xong dữ liệu ban đầu
       saveEmployeesToStorage(employees);
     }
  }, [employees, loading]); // Phụ thuộc vào employees và loading

  // Hàm thêm nhân viên mới
  const addEmployee = useCallback((newEmployeeData: NewEmployeeData) => {
    const newEmployee: Employee = {
      ...newEmployeeData,
      id: uuidv4(), // Tự động sinh mã nhân viên duy nhất
    };
    // Cập nhật state employees bằng cách thêm nhân viên mới vào cuối danh sách
    setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
    message.success('Thêm nhân viên thành công!');
  }, []); // Không có phụ thuộc vì hàm này không dùng biến ngoài phạm vi (ngoại trừ setEmployees là stable)

  // Hàm cập nhật thông tin nhân viên
  const updateEmployee = useCallback((id: string, updatedData: UpdateEmployeeData) => {
    let updated = false;
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) => {
        if (emp.id === id) {
          updated = true;
          // Kết hợp dữ liệu cũ và dữ liệu mới
          // Đảm bảo salary vẫn là number nếu được cập nhật
          const salary = updatedData.salary !== undefined ? Number(updatedData.salary) : emp.salary;
          return { ...emp, ...updatedData, salary };
        }
        return emp;
      })
    );

    if (updated) {
      message.success('Cập nhật thông tin nhân viên thành công!');
    } else {
        // Trường hợp này ít khi xảy ra nếu id được lấy từ danh sách hiện có
        message.error('Không tìm thấy nhân viên để cập nhật!');
    }
  }, []); // Không có phụ thuộc vì hàm này không dùng biến ngoài phạm vi

  // Hàm xóa nhân viên
  const deleteEmployee = useCallback((id: string) => {
    // Tìm nhân viên cần xóa để kiểm tra trạng thái
    const employeeToDelete = employees.find((emp) => emp.id === id);

    if (!employeeToDelete) {
        message.error('Không tìm thấy nhân viên để xóa!');
        return; // Dừng hàm nếu không tìm thấy
    }

    // Áp dụng điều kiện xóa: chỉ xóa nhân viên 'Thử việc'
    if (employeeToDelete.status === 'Thử việc') {
      // Cập nhật state bằng cách lọc ra nhân viên có id khác với id cần xóa
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== id)
      );
      message.success(`Đã xóa nhân viên "${employeeToDelete.name}".`);
    } else {
      // Thông báo nếu không thỏa mãn điều kiện xóa
      message.warning(`Không thể xóa nhân viên "${employeeToDelete.name}" vì đã ký hợp đồng.`);
    }
    // Phụ thuộc vào `employees` để luôn lấy được danh sách mới nhất khi tìm `employeeToDelete`
  }, [employees]);

  // Trả về state và các hàm xử lý để các component khác có thể sử dụng
  return {
    employees,
    loading, // Trả về cả trạng thái loading nếu component cần hiển thị spinner/skeleton
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
