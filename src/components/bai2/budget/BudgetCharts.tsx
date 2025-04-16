// src/components/budget/BudgetCharts.tsx
import React from 'react';
import { Card, Row, Col, Empty } from 'antd';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { formatPrice, getCategoryName, getCategoryColor } from '../../../utils/bai2/helpers';
import type { BudgetCategory } from '../../../types/bai2/index';

interface BudgetChartsProps {
  expensesByCategory: Record<BudgetCategory, number>;
}

const BudgetCharts: React.FC<BudgetChartsProps> = ({ expensesByCategory }) => {
  // Prepare data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: getCategoryName(category as BudgetCategory),
    value: amount,
    color: getCategoryColor(category as BudgetCategory)
  }));

  // Prepare data for bar chart
  const barChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: getCategoryName(category as BudgetCategory),
    amount: amount,
    color: getCategoryColor(category as BudgetCategory)
  }));

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      <Col xs={24} lg={12}>
        <Card title="Phân bổ chi phí" className="chart-card">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Chưa có dữ liệu chi tiêu" />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Chi tiêu theo danh mục" className="chart-card">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value/1000000}M`} />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Legend />
                <Bar dataKey="amount" name="Chi phí" fill="#8884d8">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Chưa có dữ liệu chi tiêu" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default BudgetCharts;
