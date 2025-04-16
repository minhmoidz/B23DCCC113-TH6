// src/components/itinerary/SavedItineraries.tsx
import React, { useState, useEffect } from 'react';
import { List, Card, Button, Popconfirm, Empty, Typography, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { formatPrice } from '../../../utils/bai2/helpers';

const { Title, Text } = Typography;

interface SavedItineraryProps {
  onLoadItinerary: (itinerary: any) => void;
}

const SavedItineraries: React.FC<SavedItineraryProps> = ({ onLoadItinerary }) => {
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);

  useEffect(() => {
    // Lấy danh sách lịch trình từ localStorage khi component được mount
    const itineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    setSavedItineraries(itineraries);
  }, []);

  const handleDeleteItinerary = (id: string) => {
    // Lọc ra các lịch trình không phải lịch trình cần xóa
    const updatedItineraries = savedItineraries.filter(item => item.id !== id);

    // Cập nhật state và localStorage
    setSavedItineraries(updatedItineraries);
    localStorage.setItem('savedItineraries', JSON.stringify(updatedItineraries));
  };

  const handleLoadItinerary = (itinerary: any) => {
    onLoadItinerary(itinerary);
  };

  return (
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
                  onConfirm={() => handleDeleteItinerary(item.id)}
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
                    <Text>Ngày: {new Date(item.dateRange[0]).toLocaleDateString('vi-VN')} - {new Date(item.dateRange[1]).toLocaleDateString('vi-VN')}</Text>
                    <Text>Số ngày: {item.days.length}</Text>
                    <Text>Tổng chi phí: {formatPrice(item.totalCost)}</Text>
                    <Text>Ngân sách: {formatPrice(item.budget)}</Text>
                    <Text>Tạo lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Chưa có lịch trình nào được lưu" />
      )}
    </Card>
  );
};

export default SavedItineraries;
