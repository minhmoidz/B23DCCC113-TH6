// src/components/budget/BudgetSummary.tsx
import React from 'react';
import { Card, Row, Col, Statistic, InputNumber, Typography, Progress, Alert } from 'antd';
import { DollarOutlined, CalculatorOutlined } from '@ant-design/icons';
import { formatPrice } from '../../../utils/bai2/helpers';

const { Text } = Typography;

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

interface BudgetSummaryProps {
  budget: number;
  setBudget: (value: number) => void;
  totalExpenses: number;
  budgetRemaining: number;
  budgetPercentage: number;
  selectedItinerary: SavedItinerary | null;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  budget,
  setBudget,
  totalExpenses,
  budgetRemaining,
  budgetPercentage,
  selectedItinerary
}) => {
  const handleBudgetChange = (value: number | null) => {
    if (value !== null) {
      setBudget(value);
      
      // Nếu có lịch trình được chọn, cập nhật ngân sách cho lịch trình đó
      if (selectedItinerary) {
        const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
        const updatedItineraries = itineraries.map((item: SavedItinerary) => {
          if (item.id === selectedItinerary.id) {
            return { ...item, budget: value };
          }
          return item;
        });
        
        localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));
      }
    }
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card className="budget-card">
          <Statistic
            title="Tổng ngân sách"
            value={budget}
            precision={0}
            formatter={value => formatPrice(Number(value))}
            prefix={<DollarOutlined />}
          />
          <div style={{ marginTop: 16 }}>
            <Text strong>Điều chỉnh ngân sách:</Text>
            <InputNumber
              min={0}
              step={500000}
              value={budget}
              onChange={handleBudgetChange}
              formatter={value => `${value}đ`}
              parser={(value: string | undefined) => {
                if (!value) return 0;
                return Number(value.replace('đ', ''));
              }}
              style={{ width: 200, marginLeft: 8 }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="expense-card">
          <Statistic
            title="Đã chi tiêu"
            value={totalExpenses}
            precision={0}
            formatter={value => formatPrice(Number(value))}
            valueStyle={{ color: totalExpenses > budget ? '#cf1322' : '#3f8600' }}
            prefix={<CalculatorOutlined />}
          />
          <Progress
            percent={Math.min(budgetPercentage, 100)}
            status={budgetPercentage >= 100 ? 'exception' : 'normal'}
            strokeColor={
              budgetPercentage >= 90 ? '#ff4d4f' :
              budgetPercentage >= 70 ? '#faad14' : '#1890ff'
            }
            format={percent => `${percent.toFixed(1)}%`}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card className="remaining-card">
          <Statistic
            title="Còn lại"
            value={budgetRemaining}
            precision={0}
            formatter={value => formatPrice(Number(value))}
            valueStyle={{ color: budgetRemaining < 0 ? '#cf1322' : '#3f8600' }}
            prefix={<DollarOutlined />}
          />
          {budgetRemaining < 0 && (
            <Alert
              message="Vượt ngân sách"
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default BudgetSummary;
