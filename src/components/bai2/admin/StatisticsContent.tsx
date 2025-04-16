// src/components/admin/StatisticsContent.tsx
import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Row, Col, Button, Space, Typography, Table, Divider, DatePicker, Statistic, Empty
} from 'antd';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { UserOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { StatisticsData, DestinationType } from '../../../types/bai2/index';
import moment from 'moment';

const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface StatisticsContentProps {
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

const StatisticsContent: React.FC<StatisticsContentProps> = ({ statistics }) => {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [monthlyItineraryData, setMonthlyItineraryData] = useState<{ month: string; count: number }[]>([]);
  const [popularDestinationsData, setPopularDestinationsData] = useState<{ name: string; count: number; color: string }[]>([]);
  const [destinationTypeData, setDestinationTypeData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [dateFilter, setDateFilter] = useState<[moment.Moment, moment.Moment] | null>(null);

  useEffect(() => {
    // Lấy dữ liệu lịch trình từ localStorage
    const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    setSavedItineraries(itineraries);

    // Tính toán số lượng lịch trình theo tháng
    calculateMonthlyItineraries(itineraries);

    // Tính toán điểm đến phổ biến
    calculatePopularDestinations(itineraries);

    // Tính toán loại điểm đến
    calculateDestinationTypes(itineraries);
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
  };

  const calculateDestinationTypes = (itineraries: SavedItinerary[]) => {
    // Đếm số lượng điểm đến theo loại
    const typeCounts: Record<string, number> = {
      'Biển': 0,
      'Núi': 0,
      'Thành phố': 0,
      'Nông thôn': 0,
      'Văn hóa': 0
    };

    itineraries.forEach(itinerary => {
      itinerary.days.forEach(day => {
        day.destinations.forEach(dest => {
          // Giả định: dest.type có thể là 'beach', 'mountain', 'city', 'countryside', 'cultural'
          // Chuyển đổi thành tên tiếng Việt
          let typeName = 'Khác';
          switch (dest.type) {
            case 'beach': typeName = 'Biển'; break;
            case 'mountain': typeName = 'Núi'; break;
            case 'city': typeName = 'Thành phố'; break;
            case 'countryside': typeName = 'Nông thôn'; break;
            case 'cultural': typeName = 'Văn hóa'; break;
          }

          if (typeCounts[typeName] !== undefined) {
            typeCounts[typeName] += 1;
          }
        });
      });
    });

    // Chuyển đổi thành mảng cho biểu đồ
    const colors = {
      'Biển': '#0088FE',
      'Núi': '#00C49F',
      'Thành phố': '#FFBB28',
      'Nông thôn': '#FF8042',
      'Văn hóa': '#8884d8'
    };

    const typeData = Object.entries(typeCounts)
      .filter(([_, count]) => count > 0)  // Chỉ lấy các loại có điểm đến
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name as keyof typeof colors] || '#d9d9d9'
      }));

    setDestinationTypeData(typeData);
  };

  const handleDateFilterChange = (dates: any) => {
    setDateFilter(dates);
    if (!dates) {
      // Nếu xóa filter, hiển thị tất cả dữ liệu
      const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      calculateMonthlyItineraries(itineraries);
      return;
    }

    // Lọc dữ liệu theo khoảng thời gian
    const [startDate, endDate] = dates;
    const filteredItineraries = savedItineraries.filter(itinerary => {
      const createdDate = moment(itinerary.createdAt);
      return createdDate.isBetween(startDate, endDate, null, '[]');
    });

    // Tính toán lại dữ liệu theo tháng
    calculateMonthlyItineraries(filteredItineraries);
  };

  // Tính toán một số thống kê bổ sung
  const totalUsers = 1245; // Giả định số người dùng
  const newUsersThisMonth = 87; // Giả định số người dùng mới tháng này
  const itinerariesPerUser = savedItineraries.length > 0 ? (savedItineraries.length / totalUsers).toFixed(1) : '0.0';
  const completionRate = 78.3; // Giả định tỷ lệ hoàn thành

  // Dữ liệu người dùng theo độ tuổi (giả định)
  const userAgeData = [
    { age: '18-24', count: 250 },
    { age: '25-34', count: 480 },
    { age: '35-44', count: 320 },
    { age: '45-54', count: 120 },
    { age: '55+', count: 75 }
  ];

  return (
    <div className="statistics-content">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Lịch trình theo tháng" key="1">
          <Card>
            <div className="date-filter">
              <Space>
                <Text strong>Chọn khoảng thời gian:</Text>
                <RangePicker
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                />
                <Button
                  type="primary"
                  onClick={() => handleDateFilterChange(null)}
                  disabled={!dateFilter}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </div>

            {savedItineraries.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyItineraryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Số lượt tạo lịch trình"
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
        </TabPane>

        <TabPane tab="Điểm đến phổ biến" key="2">
          <Card>
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                {popularDestinationsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={popularDestinationsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Số lượt chọn">
                        {popularDestinationsData.map((entry, index) => (
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
              </Col>

              <Col xs={24} lg={12}>
                {destinationTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={destinationTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {destinationTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} lượt`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty
                    description="Chưa có dữ liệu loại điểm đến"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '40px 0' }}
                  />
                )}
              </Col>
            </Row>

            {popularDestinationsData.length > 0 && (
              <>
                <Divider />

                <Table
                  dataSource={popularDestinationsData}
                  columns={[
                    {
                      title: 'Điểm đến',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Số lượt chọn',
                      dataIndex: 'count',
                      key: 'count',
                      sorter: (a, b) => a.count - b.count,
                      defaultSortOrder: 'descend'
                    },
                    {
                      title: 'Tỷ lệ',
                      key: 'percentage',
                      render: (_, record) => {
                        const total = popularDestinationsData.reduce((sum, item) => sum + item.count, 0);
                        const percentage = ((record.count / total) * 100).toFixed(1);
                        return `${percentage}%`;
                      }
                    }
                  ]}
                  pagination={false}
                />
              </>
            )}
          </Card>
        </TabPane>

        <TabPane tab="Phân tích người dùng" key="3">
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tổng số người dùng"
                    value={totalUsers}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Người dùng mới tháng này"
                    value={newUsersThisMonth}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Lịch trình/người dùng"
                    value={itinerariesPerUser}
                    prefix={<CalendarOutlined />}
                    precision={1}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Tỷ lệ hoàn thành lịch trình"
                    value={completionRate}
                    prefix={<CheckCircleOutlined />}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: completionRate > 50 ? '#3f8600' : '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={24}>
                <Title level={4}>Người dùng theo độ tuổi</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userAgeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Số người dùng" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StatisticsContent;
