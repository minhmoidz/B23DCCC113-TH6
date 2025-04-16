// src/components/budget/ExpenseList.tsx
import React from 'react';
import { Card, Table, Button, Typography, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { formatPrice, getCategoryName, getCategoryColor } from '../../../utils/bai2/helpers';
import type { BudgetItem, BudgetCategory } from '../../../types/bai2/index';

const { Text } = Typography;

interface ExpenseListProps {
  expenses: BudgetItem[];
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  const columns = [
    {
      title: 'Tên chi phí',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: BudgetCategory) => (
        <Tag color={getCategoryColor(category)}>{getCategoryName(category)}</Tag>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatPrice(amount),
      sorter: (a: BudgetItem, b: BudgetItem) => a.amount - b.amount
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
      sorter: (a: BudgetItem, b: BudgetItem) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: BudgetItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDeleteExpense(record.id)}
        >
          Xóa
        </Button>
      )
    }
  ];

  return (
    <Card title="Danh sách chi phí" className="expense-list-card">
      <Table
        dataSource={expenses}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        summary={pageData => {
          let totalAmount = 0;
          pageData.forEach(({ amount }) => {
            totalAmount += amount;
          });

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Text strong>Tổng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{formatPrice(totalAmount)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={2} />
            </Table.Summary.Row>
          );
        }}
      />
    </Card>
  );
};

export default ExpenseList;
