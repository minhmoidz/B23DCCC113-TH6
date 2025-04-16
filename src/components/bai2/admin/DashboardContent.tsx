// src/components/admin/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Empty } from 'antd';
import {
  EnvironmentOutlined, BarChartOutlined, PieChartOutlined, CalendarOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import type { DestinationType, StatisticsData } from '../../../types/bai2/index';
import moment from 'moment';

interface DashboardContentProps {
  destinations: DestinationType[];
  statistics: StatisticsData | null;
}

interface SavedItinerary {
  id: string;
  name: string;
  dateRange: [string, string];
  days: {
    date: string;
    destinations: DestinationType[];
  }[];
  budget: number;
  totalCost: number;
  createdAt: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ destinations, statistics }) => {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [monthlyItineraryData, setMonthlyItineraryData] = useState<{ month: string; count: number }[]>([]);
  const [popularDestinationsData, setPopularDestinationsData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [currentMonthItineraries, setCurrentMonthItineraries] = useState<number>(0);
  const [mostPopularDestination, setMostPopularDestination] = useState<string>('');
  const [totalUsedDestinations, setTotalUsedDestinations] = useState<number>(0);

  useEffect(() => {
    // Lấy dữ liệu lịch trình từ localStorage
    const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    setSavedItineraries(itineraries);

    // Tính toán số lượng lịch trình theo tháng
    calculateMonthlyItineraries(itineraries);

    // Tính toán điểm đến phổ biến
    calculatePopularDestinations(itineraries);

    // Tính tổng số điểm đến đã sử dụng
    calculateTotalUsedDestinations(itineraries);
  }, []);

  const calculateMonthlyItineraries = (itineraries: SavedItinerary[]) => {
    // Khởi tạo dữ liệu cho 12 tháng
    const monthData = Array.from({ length: 12 }, (_, i) => ({
      month: `T${i + 1}`,
      count: 0
    }));

    // Đếm số lượng lịch trình cho mỗi tháng
    itineraries.forEach(itinerary => {
      const createdDate = moment(itinerary.createdAt);
      const monthIndex = createdDate.month();
      monthData[monthIndex].count += 1;
    });

    setMonthlyItineraryData(monthData);

    // Tính số lượng lịch trình trong tháng hiện tại
    const currentMonth = moment().month();
    setCurrentMonthItineraries(monthData[currentMonth].count);
  };

  const calculatePopularDestinations = (itineraries: SavedItinerary[]) => {
    // Đếm số lần mỗi điểm đến xuất hiện trong các lịch trình
    const destinationCounts: Record<string, number> = {};

    itineraries.forEach(itinerary => {
      itinerary.days.forEach(day => {
        day.destinations.forEach(dest => {
          if (!destinationCounts[dest.name]) {
            destinationCounts[dest.name] = 0;
          }
          destinationCounts[dest.name] += 1;
        });
      });
    });

    // Chuyển đổi thành mảng và sắp xếp theo số lượt chọn
    const colors = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28', '#8884d8'];
    const popularDests = Object.entries(destinationCounts)
      .map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);  // Lấy 5 điểm đến phổ biến nhất

    setPopularDestinationsData(popularDests);

    // Lấy điểm đến phổ biến nhất
    if (popularDests.length > 0) {
      setMostPopularDestination(popularDests[0].name);
    }
  };

  const calculateTotalUsedDestinations = (itineraries: SavedItinerary[]) => {
    // Tạo Set để lưu trữ các điểm đến duy nhất đã được sử dụng
    const uniqueDestinations = new Set<string>();

    itineraries.forEach(itinerary => {
      itinerary.days.forEach(day => {
        day.destinations.forEach(dest => {
          uniqueDestinations.add(dest.name);
        });
      });
    });

    // Số lượng điểm đến duy nhất đã được sử dụng
    setTotalUsedDestinations(uniqueDestinations.size);
  };

  // Sử dụng dữ liệu thực tế hoặc dữ liệu mẫu nếu không có
  const currentDate = moment();
  const currentMonthIndex = currentDate.month();
  const currentMonthName = `T${currentMonthIndex + 1}`;

  // Nếu không có dữ liệu thực tế, sử dụng dữ liệu mẫu
  const displayMonthlyData = monthlyItineraryData.length > 0 ? monthlyItineraryData : [
    { month: 'T1', count: 0 },
    { month: 'T2', count: 0 },
    { month: 'T3', count: 0 },
    { month: 'T4', count: 0 },
    { month: 'T5', count: 0 },
    { month: 'T6', count: 0 },
    { month: 'T7', count: 0 },
    { month: 'T8', count: 0 },
    { month: 'T9', count: 0 },
    { month: 'T10', count: 0 },
    { month: 'T11', count: 0 },
    { month: 'T12', count: 0 }
  ];

  const displayPopularData = popularDestinationsData.length > 0 ? popularDestinationsData : [
    { name: 'Chưa có dữ liệu', count: 0, color: '#d9d9d9' }
  ];

  return (
    <div className="dashboard-content">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng số điểm đến đã sử dụng"
              value={totalUsedDestinations}
              prefix={<EnvironmentOutlined />}
              suffix={`/${destinations.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={`Lịch trình được tạo tháng ${currentMonthName}`}
              value={currentMonthItineraries}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Điểm đến phổ biến nhất"
              value={mostPopularDestination || "Chưa có dữ liệu"}
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Lịch trình được tạo theo tháng">
            {savedItineraries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={displayMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Số lượt tạo"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="Chưa có dữ liệu lịch trình"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '40px 0' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Điểm đến phổ biến">
            {popularDestinationsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={displayPopularData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Số lượt chọn">
                    {displayPopularData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="Chưa có dữ liệu điểm đến phổ biến"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '40px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardContent;
