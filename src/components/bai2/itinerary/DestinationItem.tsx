// src/components/itinerary/DestinationItem.tsx
import React from 'react';
import { Card, Button, Avatar, Space, Timeline, Badge, Tooltip } from 'antd';
import { DeleteOutlined, CarOutlined, DollarOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import type { DestinationType } from '../../../types/bai2/index';
import { formatPrice, calculateDistance, calculateTravelTime } from '../../../utils/bai2/helpers';

interface DestinationItemProps {
  destination: DestinationType;
  destIndex: number;
  dayIndex: number;
  dayDestinations: DestinationType[];
  onRemove: (dayIndex: number, destIndex: number) => void;
  totalDays: number; // Thêm prop tổng số ngày
  currentDay: number; // Thêm prop ngày hiện tại
}

const DestinationItem: React.FC<DestinationItemProps> = ({
  destination,
  destIndex,
  dayIndex,
  dayDestinations,
  onRemove,
  totalDays,
  currentDay
}) => {
  // Hiển thị badge chỉ khi đang ở ngày hiện tại
  const showBadge = dayIndex === currentDay - 1;

  return (
    <Timeline.Item>
      <Card
        size="small"
        className="destination-card"
        extra={
          <Tooltip title={`Ngày ${dayIndex + 1}/${totalDays}`}>
            <Badge
              count={dayIndex + 1}
              style={{
                backgroundColor: showBadge ? '#1890ff' : '#999',
                marginRight: 8
              }}
            />
          </Tooltip>
        }
      >
        <Space align="start">
          <Avatar src={destination.imageUrl} size={64} shape="square" />
          <div>
            <h4>{destination.name}</h4>
            <p>{destination.location}</p>
            <Space>
              <span><DollarOutlined /> {formatPrice(destination.price)}</span>
              {destIndex > 0 && (
                <>
                  <span><CarOutlined /> {calculateDistance(dayDestinations[destIndex-1], destination)} km</span>
                  <span><ClockCircleOutlined /> {calculateTravelTime(dayDestinations[destIndex-1], destination)}</span>
                </>
              )}
              <span><CalendarOutlined /> Ngày {dayIndex + 1}</span>
            </Space>
          </div>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onRemove(dayIndex, destIndex)}
          />
        </Space>
      </Card>
    </Timeline.Item>
  );
};

export default DestinationItem;
