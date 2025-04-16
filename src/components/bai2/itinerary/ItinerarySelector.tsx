// src/components/budget/ItinerarySelector.tsx
import React from 'react';
import { Card, Select, Empty, Typography, Space, Tag } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { formatPrice } from '../../../utils/bai2/helpers';
import moment from 'moment';

const { Text, Title } = Typography;
const { Option } = Select;

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

interface ItinerarySelectorProps {
  itineraries: SavedItinerary[];
  selectedItinerary: SavedItinerary | null;
  onSelectItinerary: (itinerary: SavedItinerary) => void;
}

const ItinerarySelector: React.FC<ItinerarySelectorProps> = ({
  itineraries,
  selectedItinerary,
  onSelectItinerary
}) => {
  const handleChange = (itineraryId: string) => {
    const selected = itineraries.find(item => item.id === itineraryId);
    if (selected) {
      onSelectItinerary(selected);
    }
  };

  return (
    <Card className="itinerary-selector-card" style={{ marginBottom: 16 }}>
      <Title level={4}>Chọn lịch trình</Title>
      
      {itineraries.length > 0 ? (
        <div>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn lịch trình để quản lý ngân sách"
            value={selectedItinerary?.id}
            onChange={handleChange}
            optionLabelProp="label"
          >
            {itineraries.map(itinerary => (
              <Option 
                key={itinerary.id} 
                value={itinerary.id}
                label={itinerary.name}
              >
                <div className="itinerary-option">
                  <div className="itinerary-name">{itinerary.name}</div>
                  <Space>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {moment(itinerary.dateRange[0]).format('DD/MM/YYYY')} - {moment(itinerary.dateRange[1]).format('DD/MM/YYYY')}
                    </Tag>
                    <Tag icon={<DollarOutlined />} color="green">
                      {formatPrice(itinerary.totalCost)}
                    </Tag>
                  </Space>
                </div>
              </Option>
            ))}
          </Select>
          
          {selectedItinerary && (
            <div className="selected-itinerary-info" style={{ marginTop: 16 }}>
              <Text strong>Lịch trình đã chọn: </Text>
              <Text>{selectedItinerary.name}</Text>
              <br />
              <Text>Ngày: {moment(selectedItinerary.dateRange[0]).format('DD/MM/YYYY')} - {moment(selectedItinerary.dateRange[1]).format('DD/MM/YYYY')}</Text>
              <br />
              <Text>Số ngày: {selectedItinerary.days.length}</Text>
              <br />
              <Text>Tổng chi phí dự kiến: {formatPrice(selectedItinerary.totalCost)}</Text>
            </div>
          )}
        </div>
      ) : (
        <Empty 
          description="Chưa có lịch trình nào được lưu. Vui lòng tạo lịch trình trước khi quản lý ngân sách."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default ItinerarySelector;
