// src/components/EmployeeForm/EmployeeForm.tsx
import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Radio, Button, Row, Col } from 'antd';
import { Employee, NewEmployeeData, UpdateEmployeeData } from '../../models/bai2/employee';
import { POSITIONS, DEPARTMENTS, STATUS_OPTIONS, NO_SPECIAL_CHARS_REGEX } from '../../constants/options';

const { Option } = Select;

interface EmployeeFormProps {
  initialValues?: Employee | null; // Dữ liệu nhân viên để chỉnh sửa
  onSubmit: (values: NewEmployeeData | UpdateEmployeeData) => void;
  onCancel: () => void;
  isEditMode: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialValues, onSubmit, onCancel, isEditMode }) => {
  const [form] = Form.useForm();

  // Set giá trị cho form khi mở ở chế độ chỉnh sửa
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields(); // Reset form khi mở để thêm mới
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    // Chuyển đổi salary sang number nếu nó là string từ InputNumber
    const processedValues = {
      ...values,
      salary: Number(values.salary),
    };
    onSubmit(processedValues as NewEmployeeData | UpdateEmployeeData); // Type assertion
    form.resetFields(); // Reset form sau khi submit thành công
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ status: 'Thử việc' }} // Giá trị mặc định cho trạng thái
    >
      {/* Không hiển thị trường ID */}
      {/* {isEditMode && initialValues?.id && (
        <Form.Item label="Mã nhân viên" name="id">
          <Input disabled />
        </Form.Item>
      )} */}

      <Form.Item
        label="Họ tên"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập họ tên!' },
          { max: 50, message: 'Họ tên không được vượt quá 50 ký tự!' },
          {
            pattern: NO_SPECIAL_CHARS_REGEX,
            message: 'Họ tên không được chứa ký tự đặc biệt!',
          },
        ]}
      >
        <Input placeholder="Nhập họ tên nhân viên" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Chức vụ"
            name="position"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select placeholder="Chọn chức vụ">
              {POSITIONS.map((pos) => (
                <Option key={pos} value={pos}>
                  {pos}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Phòng ban"
            name="department"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
          >
            <Select placeholder="Chọn phòng ban">
              {DEPARTMENTS.map((dep) => (
                <Option key={dep} value={dep}>
                  {dep}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Lương"
            name="salary"
            rules={[
                { required: true, message: 'Vui lòng nhập lương!' },
                { type: 'number', min: 0, message: 'Lương phải là số không âm!' }
            ]}
          >
            {/* Sử dụng InputNumber để đảm bảo nhập số */}
            <InputNumber<number> // Đảm bảo InputNumber nhận giá trị kiểu number
              style={{ width: '100%' }}
              placeholder="Nhập mức lương"
              formatter={(value) =>
                value !== undefined && value !== null
                  ? value.toLocaleString('vi-VN') // Hiển thị số với dấu phân cách theo ngôn ngữ Việt Nam
                  : ''
              }
              parser={(value) => {
                if (!value) return 0; // Trả về số 0 nếu không có giá trị nhập vào
                const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
                return isNaN(parsed) ? 0 : parsed; // Đảm bảo parser trả về số hợp lệ
              }}
              min={0} // Không cho nhập số âm
            />
          </Form.Item>
        </Col>
        <Col span={12}>
           <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Radio.Group disabled={isEditMode && initialValues?.status === 'Đã ký hợp đồng'}>
              {/* Chỉ cho phép sửa status khi là Thử việc hoặc khi thêm mới */}
              {STATUS_OPTIONS.map((status) => (
                <Radio key={status} value={status}>
                  {status}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>


      <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>
        <Button type="primary" htmlType="submit">
          {isEditMode ? 'Lưu thay đổi' : 'Thêm mới'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;
