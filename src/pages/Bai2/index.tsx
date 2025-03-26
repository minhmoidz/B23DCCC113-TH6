// src/pages/EmployeeManagement/EmployeeManagement.tsx
import React, { useState, useMemo } from 'react';
import { Button, Modal, Input, Select, Row, Col, Card, Space, Typography } from 'antd';
import { PlusOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import EmployeeTable from '../../components/bai2/EmployeeTable';
import EmployeeForm from '../../components/bai2/EmployeeForm';
import { NewEmployeeData, UpdateEmployeeData } from '../../models/bai2/employee';
import  { useEmployeeModel } from '../../models/bai2/useEmployeeModel';
import { Employee } from '../../models/bai2/employee';
import { POSITIONS, DEPARTMENTS } from '../../constants/options';


const { Title } = Typography;
const { Option } = Select;

const EmployeeManagement: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeModel();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // State cho bộ lọc và tìm kiếm
  const [filterPosition, setFilterPosition] = useState<string | undefined>(undefined);
  const [filterDepartment, setFilterDepartment] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const showAddModal = () => {
    setEditingEmployee(null); // Đảm bảo không có dữ liệu cũ khi thêm mới
    setIsModalVisible(true);
  };

  const showEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEmployee(null); // Reset employee đang sửa khi đóng modal
  };

  const handleFormSubmit = (values: NewEmployeeData | UpdateEmployeeData) => {
    if (editingEmployee) {
      // Chế độ chỉnh sửa
      updateEmployee(editingEmployee.id, values as UpdateEmployeeData);
    } else {
      // Chế độ thêm mới
      addEmployee(values as NewEmployeeData);
    }
    setIsModalVisible(false); // Đóng modal sau khi submit thành công
    setEditingEmployee(null);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
  };

  // Lọc và tìm kiếm dữ liệu
  const filteredAndSearchedEmployees = useMemo(() => {
    let result = employees;

    // Lọc theo chức vụ
    if (filterPosition) {
      result = result.filter(emp => emp.position === filterPosition);
    }

    // Lọc theo phòng ban
    if (filterDepartment) {
      result = result.filter(emp => emp.department === filterDepartment);
    }

    // Tìm kiếm theo tên hoặc mã NV (không phân biệt hoa thường)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(emp =>
        emp.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        emp.id.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sắp xếp theo lương giảm dần (AntD Table đã có sorter, nhưng nếu muốn mặc định thì làm ở đây)
    // result.sort((a, b) => b.salary - a.salary); // Mặc định sắp xếp ở đây nếu cần

    return result;
  }, [employees, filterPosition, filterDepartment, searchTerm]);

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={3} style={{ marginBottom: '20px' }}>Quản lý nhân viên</Title>

        {/* Khu vực Lọc và Tìm kiếm */}
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo tên hoặc mã NV..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear // Cho phép xóa nhanh nội dung tìm kiếm
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo chức vụ"
              style={{ width: '100%' }}
              allowClear // Cho phép bỏ chọn
              value={filterPosition}
              onChange={(value) => setFilterPosition(value)}
            >
              {POSITIONS.map(pos => <Option key={pos} value={pos}>{pos}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Lọc theo phòng ban"
              style={{ width: '100%' }}
              allowClear
              value={filterDepartment}
              onChange={(value) => setFilterDepartment(value)}
            >
              {DEPARTMENTS.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
            </Select>
          </Col>
           <Col xs={24} sm={12} md={6} style={{ textAlign: 'right' }}>
             <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
              >
                Thêm nhân viên
              </Button>
          </Col>
        </Row>


        {/* Bảng hiển thị danh sách nhân viên */}
        <EmployeeTable
          employees={filteredAndSearchedEmployees}
          onEdit={showEditModal}
          onDelete={handleDelete}
          // loading={/* Có thể thêm state loading ở đây nếu cần */}
        />
      </Card>

      {/* Modal thêm/sửa nhân viên */}
      <Modal
        title={editingEmployee ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Tắt footer mặc định vì đã có nút trong EmployeeForm
        destroyOnClose // Hủy component trong modal khi đóng để reset state nội bộ (nếu có)
        width={700} // Tăng chiều rộng modal
      >
        <EmployeeForm
          initialValues={editingEmployee}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isEditMode={!!editingEmployee} // Chuyển editingEmployee thành boolean
        />
      </Modal>
    </div>
  );
};

export default EmployeeManagement;

// Tạo file src/pages/EmployeeManagement/EmployeeManagement.css nếu cần style thêm
// ví dụ:
// .ant-card-body { padding: 15px !important; }
