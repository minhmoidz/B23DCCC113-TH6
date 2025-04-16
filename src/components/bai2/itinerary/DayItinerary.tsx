// src/components/itinerary/DayItinerary.tsx
import React, { useState } from 'react';
import { Card, Timeline, Divider, List, Badge, Collapse, Space, Button } from 'antd';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { CaretRightOutlined, PlusOutlined } from '@ant-design/icons';
import type { DestinationType, ItineraryDay } from '../../../types/bai2/index';
import { formatPrice } from '../../../utils/bai2/helpers';
import DestinationItem from './DestinationItem';

const { Panel } = Collapse;

interface DayItineraryProps {
  day: ItineraryDay;
  dayIndex: number;
  destinations: DestinationType[];
  onAddDestination: (destination: DestinationType, dayIndex: number) => void;
  onRemoveDestination: (dayIndex: number, destIndex: number) => void;
  totalDays: number;
  currentDay: number;
}

const DayItinerary: React.FC<DayItineraryProps> = ({
  day,
  dayIndex,
  destinations,
  onAddDestination,
  onRemoveDestination,
  totalDays,
  currentDay
}) => {
  const isCurrentDay = dayIndex === currentDay - 1;
  const [activeKey, setActiveKey] = useState<string | string[]>(isCurrentDay ? ['destinations', 'addNew'] : []);

  const dayTitle = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Badge
        count={dayIndex + 1}
        style={{
          backgroundColor: isCurrentDay ? '#1890ff' : '#999',
          marginRight: 8
        }}
      />
      <span>Ngày {dayIndex + 1} - {day.date.format('DD/MM/YYYY')}</span>
      {isCurrentDay && <span style={{ marginLeft: 8, color: '#1890ff' }}>(Hiện tại)</span>}
    </div>
  );

  return (
    <Card
      title={dayTitle}
      className={`day-itinerary-card ${isCurrentDay ? 'current-day' : ''}`}
      style={{
        marginBottom: 16,
        borderLeft: isCurrentDay ? '4px solid #1890ff' : 'none'
      }}
    >
      <Collapse
        activeKey={activeKey}
        onChange={setActiveKey}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      >
        <Panel
          header={
            <Space>
              <span>Điểm đến đã chọn</span>
              <Badge count={day.destinations.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          key="destinations"
        >
          <Droppable droppableId={dayIndex.toString()}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="droppable-area"
              >
                {day.destinations.length === 0 ? (
                  <div className="empty-day">Chưa có điểm đến nào cho ngày này</div>
                ) : (
                  <Timeline>
                    {day.destinations.map((dest, destIndex) => (
                      <Draggable
                        key={`${dest.id}-${destIndex}`}
                        draggableId={`${dest.id}-${destIndex}`}
                        index={destIndex}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <DestinationItem
                              destination={dest}
                              destIndex={destIndex}
                              dayIndex={dayIndex}
                              dayDestinations={day.destinations}
                              onRemove={onRemoveDestination}
                              totalDays={totalDays}
                              currentDay={currentDay}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </Timeline>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Panel>

        <Panel
          header={
            <Space>
              <span>Thêm điểm đến mới</span>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!activeKey.includes('addNew')) {
                    setActiveKey([...Array.isArray(activeKey) ? activeKey : [activeKey], 'addNew']);
                  }
                }}
              >
                Thêm
              </Button>
            </Space>
          }
          key="addNew"
        >
          <div className="add-destination">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={destinations}
              renderItem={dest => (
                <List.Item>
                  <Card
                    hoverable
                    size="small"
                    cover={<img alt={dest.name} src={dest.imageUrl} style={{ height: 100, objectFit: 'cover' }} />}
                    onClick={() => {
                      onAddDestination(dest, dayIndex);
                      // Mở panel điểm đến sau khi thêm
                      if (!activeKey.includes('destinations')) {
                        setActiveKey([...Array.isArray(activeKey) ? activeKey : [activeKey], 'destinations']);
                      }
                    }}
                  >
                    <Card.Meta
                      title={dest.name}
                      description={formatPrice(dest.price)}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default DayItinerary;
