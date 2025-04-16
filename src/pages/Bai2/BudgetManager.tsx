// src/pages/BudgetManager.tsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, notification } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { formatPrice } from '../../utils/bai2/helpers';
import type { BudgetItem, BudgetCategory } from '../../types/bai2/index';
import BudgetSummary from '../../components/bai2/budget/BudgetSummary';
import BudgetCharts from '../../components/bai2/budget/BudgetCharts';
import ExpenseForm from '../../components/bai2/budget/ExpenseForm';
import ExpenseList from '../../components/bai2/budget/ExpenseList';
import ItinerarySelector from '../../components/bai2/itinerary/ItinerarySelector';


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

const BudgetManager: React.FC = () => {
  const [budget, setBudget] = useState<number>(5000000);
  const [expenses, setExpenses] = useState<BudgetItem[]>([]);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

  // Calculate totals and percentages
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetRemaining = budget - totalExpenses;
  const budgetPercentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category] += item.amount;
    return acc;
  }, {} as Record<BudgetCategory, number>);

  useEffect(() => {
    // Lấy danh sách lịch trình đã lưu từ localStorage
    const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    setSavedItineraries(itineraries);

    // Lấy dữ liệu chi phí từ localStorage nếu có
    const savedExpenses = localStorage.getItem('budgetExpenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      // Sample data for initial state
      const sampleExpenses: BudgetItem[] = [
        {
          id: '1',
          name: 'Khách sạn Sài Gòn',
          category: 'accommodation',
          amount: 1200000,
          date: new Date('2025-04-10')
        },
        {
          id: '2',
          name: 'Vé máy bay khứ hồi',
          category: 'transportation',
          amount: 1800000,
          date: new Date('2025-04-05')
        },
        {
          id: '3',
          name: 'Ăn uống ngày 1',
          category: 'food',
          amount: 500000,
          date: new Date('2025-04-11')
        },
        {
          id: '4',
          name: 'Tour thuyền vịnh Hạ Long',
          category: 'activities',
          amount: 700000,
          date: new Date('2025-04-12')
        }
      ];
      setExpenses(sampleExpenses);
    }
  }, []);

  // Lưu chi phí vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem('budgetExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    // Check if over budget
    if (budget > 0 && totalExpenses > budget) {
      notification.warning({
        message: 'Cảnh báo vượt ngân sách',
        description: `Chi tiêu hiện tại (${formatPrice(totalExpenses)}) đã vượt quá ngân sách (${formatPrice(budget)})`,
        icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
        placement: 'topRight',
        duration: 4
      });
    }
  }, [totalExpenses, budget]);

  const handleAddExpense = (newExpense: Omit<BudgetItem, 'id' | 'date'>) => {
    const expenseWithId: BudgetItem = {
      ...newExpense,
      id: Date.now().toString(),
      date: new Date()
    };

    setExpenses([...expenses, expenseWithId]);

    notification.success({
      message: 'Thêm chi phí thành công',
      description: `Đã thêm "${newExpense.name}" với số tiền ${formatPrice(newExpense.amount)}`,
      placement: 'bottomRight'
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  const handleSelectItinerary = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);

    // Nếu lịch trình đã có ngân sách, sử dụng nó
    if (itinerary.budget) {
      setBudget(itinerary.budget);
    }

    // Tạo chi phí tự động từ các điểm đến trong lịch trình
    const autoExpenses: BudgetItem[] = [];

    // Thêm chi phí cho mỗi điểm đến
    itinerary.days.forEach((day, dayIndex) => {
      day.destinations.forEach((dest, destIndex) => {
        // Xác định danh mục dựa trên loại điểm đến
        let category: BudgetCategory = 'activities';
        switch(dest.type) {
          case 'beach':
          case 'mountain':
          case 'cultural':
            category = 'activities';
            break;
          case 'city':
            category = dest.name.includes('khách sạn') ? 'accommodation' : 'activities';
            break;
          default:
            category = 'activities';
        }

        // Tạo chi phí mới
        autoExpenses.push({
          id: `auto-${Date.now()}-${dayIndex}-${destIndex}`,
          name: dest.name,
          category,
          amount: dest.price,
          date: new Date(day.date)
        });
      });
    });

    // Thêm chi phí vận chuyển nếu có nhiều ngày
    if (itinerary.days.length > 1) {
      autoExpenses.push({
        id: `auto-transport-${Date.now()}`,
        name: 'Di chuyển giữa các điểm',
        category: 'transportation',
        amount: 500000 * (itinerary.days.length - 1),
        date: new Date()
      });
    }

    // Cập nhật danh sách chi phí
    setExpenses(autoExpenses);

    notification.success({
      message: 'Đã chọn lịch trình',
      description: `Đã tải ngân sách và chi phí cho lịch trình "${itinerary.name}"`,
      placement: 'bottomRight'
    });
  };

  return (
    <div className="budget-manager">
      <Title level={2}>Quản lý ngân sách</Title>

      <ItinerarySelector
        itineraries={savedItineraries}
        selectedItinerary={selectedItinerary}
        onSelectItinerary={handleSelectItinerary}
      />

      <BudgetSummary
        budget={budget}
        setBudget={setBudget}
        totalExpenses={totalExpenses}
        budgetRemaining={budgetRemaining}
        budgetPercentage={budgetPercentage}
        selectedItinerary={selectedItinerary}
      />

      <BudgetCharts
        expensesByCategory={expensesByCategory}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ExpenseForm
            onAddExpense={handleAddExpense}
            selectedItinerary={selectedItinerary}
          />
        </Col>

        <Col xs={24} lg={12}>
          <ExpenseList
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
          />
        </Col>
      </Row>
    </div>
  );
};

export default BudgetManager;
