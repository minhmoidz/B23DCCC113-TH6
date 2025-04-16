// src/pages/ItineraryPlanner.tsx
import React, { useState, useEffect } from 'react';
import { Card, Space, Alert, Tabs, Typography, Button, Input, notification, Modal, List, Popconfirm } from 'antd';
import { DragDropContext } from 'react-beautiful-dnd';
import { SaveOutlined, FileOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchDestinations } from '../../services/bai2/api';
import { formatPrice } from '../../utils/bai2/helpers';
import type { DestinationType, ItineraryDay } from '../../types/bai2/index';
import TripInfoForm from '../../components/bai2/itinerary/TripInfoForm';
import DayItinerary from '../../components/bai2/itinerary/DayItinerary';
import ItineraryOverview from '../../components/bai2/itinerary/ItineraryOverview';
import '../../styles/bai2/ItineraryPlanner.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

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

const ItineraryPlanner: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [budget, setBudget] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [itineraryName, setItineraryName] = useState<string>('');
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);

  useEffect(() => {
    // Fetch destinations
    fetchDestinations().then(setDestinations);

    // Load saved itineraries from localStorage
    const saved = localStorage.getItem('savedItineraries');
    if (saved) {
      setSavedItineraries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Calculate total cost
    let cost = 0;
    itinerary.forEach(day => {
      day.destinations.forEach(dest => {
        cost += dest.price;
      });
    });
    setTotalCost(cost);
  }, [itinerary]);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates);

      // Create empty itinerary days
      const days = [];
      const dayCount = dates[1].diff(dates[0], 'days') + 1;

      for (let i = 0; i < dayCount; i++) {
        days.push({
          date: dates[0].clone().add(i, 'days'),
          destinations: []
        });
      }

      setItinerary(days);
      setCurrentDay(1); // Reset về ngày đầu tiên khi chọn khoảng ngày mới
    } else {
      setDateRange(null);
      setItinerary([]);
      setCurrentDay(1);
    }
  };

  const handleAddDestination = (destination: DestinationType, dayIndex: number) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].destinations.push({...destination});
    setItinerary(newItinerary);
  };

  const handleRemoveDestination = (dayIndex: number, destIndex: number) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].destinations.splice(destIndex, 1);
    setItinerary(newItinerary);
  };

  const handleCurrentDayChange = (day: number) => {
    setCurrentDay(day + 1); // Steps component trả về index bắt đầu từ 0
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceDay = parseInt(result.source.droppableId);
    const destDay = parseInt(result.destination.droppableId);

    const newItinerary = [...itinerary];
    const [removed] = newItinerary[sourceDay].destinations.splice(result.source.index, 1);
    newItinerary[destDay].destinations.splice(result.destination.index, 0, removed);

    setItinerary(newItinerary);
  };

  const handleSaveItinerary = () => {
    if (!dateRange || itinerary.length === 0) {
      notification.warning({
        message: 'Không thể lưu',
        description: 'Vui lòng chọn ngày và thêm ít nhất một điểm đến',
      });
      return;
    }

    // Tạo đối tượng lịch trình để lưu
    const itineraryToSave: SavedItinerary = {
      id: Date.now().toString(),
      name: itineraryName || `Lịch trình ${new Date().toLocaleDateString('vi-VN')}`,
      dateRange: [dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')],
      days: itinerary.map(day => ({
        date: day.date.format('YYYY-MM-DD'),
        destinations: day.destinations
      })),
      budget,
      totalCost,
      createdAt: new Date().toISOString()
    };

    // Thêm lịch trình mới vào danh sách
    const updatedItineraries = [...savedItineraries, itineraryToSave];
    setSavedItineraries(updatedItineraries);

    // Lưu lại vào localStorage
    localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));

    notification.success({
      message: 'Lưu thành công',
      description: `Đã lưu "${itineraryToSave.name}" vào danh sách lịch trình`,
    });
  };

  const handleLoadItinerary = (savedItinerary: SavedItinerary) => {
    // Chuyển đổi dữ liệu từ định dạng lưu trữ sang định dạng sử dụng trong ứng dụng
    const startDate = moment(savedItinerary.dateRange[0]);
    const endDate = moment(savedItinerary.dateRange[1]);

    // Cập nhật dateRange
    setDateRange([startDate, endDate]);

    // Chuyển đổi dữ liệu ngày
    const loadedItinerary = savedItinerary.days.map((day) => ({
      date: moment(day.date),
      destinations: day.destinations
    }));

    // Cập nhật itinerary
    setItinerary(loadedItinerary);

    // Cập nhật các thông tin khác
    setBudget(savedItinerary.budget);
    setItineraryName(savedItinerary.name);

    // Chuyển sang tab lịch trình
    setActiveTab('1');

    notification.success({
      message: 'Đã tải lịch trình',
      description: `Đã tải lịch trình "${savedItinerary.name}"`,
    });
  };

  const handleDeleteSavedItinerary = (id: string) => {
    // Lọc ra các lịch trình không phải lịch trình cần xóa
    const updatedItineraries = savedItineraries.filter(item => item.id !== id);

    // Cập nhật state và localStorage
    setSavedItineraries(updatedItineraries);
    localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));

    notification.success({
      message: 'Xóa thành công',
      description: 'Đã xóa lịch trình khỏi danh sách',
    });
  };

  const totalDays = dateRange ? dateRange[1].diff(dateRange[0], 'days') + 1 : 0;

  return (
    <div className="itinerary-planner">
      <Title level={2}>Tạo lịch trình du lịch</Title>

      <Card className="trip-info-card" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label>Tên lịch trình: </label>
            <Input
              value={itineraryName}
              onChange={e => setItineraryName(e.target.value)}
              placeholder="Nhập tên lịch trình"
              style={{ width: 300, marginLeft: 8 }}
            />
          </div>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveItinerary}
            disabled={!dateRange || itinerary.length === 0}
            style={{ marginBottom: 16 }}
          >
            Lưu lịch trình
          </Button>
        </Space>
      </Card>

      <TripInfoForm
        onDateRangeChange={handleDateRangeChange}
        onBudgetChange={setBudget}
        onCurrentDayChange={handleCurrentDayChange}
        budget={budget}
        totalCost={totalCost}
        dateRange={dateRange}
        currentDay={currentDay}
      />

      {dateRange && (
        <div className="itinerary-builder">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="Lịch trình theo ngày" key="1">
              <DragDropContext onDragEnd={onDragEnd}>
                {/* Chỉ hiển thị ngày hiện tại thay vì map qua tất cả các ngày */}
                {itinerary.length > 0 && (
                  <DayItinerary
                    key={currentDay - 1}
                    day={itinerary[currentDay - 1]}
                    dayIndex={currentDay - 1}
                    destinations={destinations}
                    onAddDestination={handleAddDestination}
                    onRemoveDestination={handleRemoveDestination}
                    totalDays={itinerary.length}
                    currentDay={currentDay}
                  />
                )}
              </DragDropContext>
            </TabPane>

            <TabPane tab="Tổng quan" key="2">
              <ItineraryOverview
                itinerary={itinerary}
                totalCost={totalCost}
                currentDay={currentDay}
              />
            </TabPane>

            <TabPane tab="Lịch trình đã lưu" key="3">
              <Card title="Lịch trình đã lưu">
                {savedItineraries.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={savedItineraries}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleLoadItinerary(item)}
                          >
                            Xem
                          </Button>,
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa lịch trình này?"
                            onConfirm={() => handleDeleteSavedItinerary(item.id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          title={item.name}
                          description={
                            <Space direction="vertical">
                              <Text>Ngày: {moment(item.dateRange[0]).format('DD/MM/YYYY')} - {moment(item.dateRange[1]).format('DD/MM/YYYY')}</Text>
                              <Text>Số ngày: {item.days.length}</Text>
                              <Text>Tổng chi phí: {formatPrice(item.totalCost)}</Text>
                              <Text>Ngân sách: {formatPrice(item.budget)}</Text>
                              <Text>Tạo lúc: {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">Chưa có lịch trình nào được lưu</Text>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ItineraryPlanner;
