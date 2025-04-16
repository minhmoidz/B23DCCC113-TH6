// src/components/budget/ExpenseForm.tsx
import React from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BudgetItem, BudgetCategory } from '../../../types/bai2/index';

const { Option } = Select;
const { Title } = Typography;

interface SavedItinerary {
  id: string;
  name: string;
  dateRange: [string, string];
  days: {
    date: string;
    destinations: any[];
  }[];
  budget: number;
  totalCost: number;
  createdAt: string;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<BudgetItem, 'id' | 'date'>) => void;
  selectedItinerary: SavedItinerary | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, selectedItinerary }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onAddExpense({
      name: values.name,
      category: values.category,
      amount: values.amount
    });
    
    form.resetFields();
  };

  return (
    <Card title={
      <div>
        <Title level={4}>Thêm chi phí</Title>
        {selectedItinerary && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Cho lịch trình: {selectedItinerary.name}
          </div>
        )}
      </div>
    } className="add-expense-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Tên chi phí"
          rules={[{ required: true, message: 'Vui lòng nhập tên chi phí' }]}
        >
          <Input placeholder="Nhập tên chi phí" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select placeholder="Chọn danh mục">
            <Option value="accommodation">Lưu trú</Option>
            <Option value="food">Ăn uống</Option>
            <Option value="transportation">Di chuyển</Option>
            <Option value="activities">Hoạt động</Option>
            <Option value="shopping">Mua sắm</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="Số tiền"
          rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            formatter={value => `${value}đ`}
            parser={(value: string | undefined) => {
              if (!value) return 0;
              return Number(value.replace('đ', ''));
            }}
            placeholder="Nhập số tiền"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
          >
            Thêm chi phí
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ExpenseForm;
