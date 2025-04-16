// src/components/itinerary/TripInfoForm.tsx
import React from 'react';
import { Card, Space, Alert, DatePicker, InputNumber, Steps, Badge, Row, Col, Statistic } from 'antd';
import { CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { formatPrice } from '../../../utils/bai2/helpers';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Step } = Steps;

interface TripInfoFormProps {
  onDateRangeChange: (dates: any) => void;
  onBudgetChange: (value: number) => void;
  onCurrentDayChange: (day: number) => void; // Thêm prop để thay đổi ngày hiện tại
  budget: number;
  totalCost: number;
  dateRange: [moment.Moment, moment.Moment] | null;
  currentDay: number; // Thêm prop ngày hiện tại
}

const TripInfoForm: React.FC<TripInfoFormProps> = ({
  onDateRangeChange,
  onBudgetChange,
  onCurrentDayChange,
  budget,
  totalCost,
  dateRange,
  currentDay
}) => {
  // Tính tổng số ngày
  const totalDays = dateRange ? dateRange[1].diff(dateRange[0], 'days') + 1 : 0;

  // Tạo mảng các ngày để hiển thị trong Steps
  const daysArray = [];
  if (dateRange) {
    for (let i = 0; i < totalDays; i++) {
      daysArray.push({
        day: i + 1,
        date: dateRange[0].clone().add(i, 'days').format('DD/MM/YYYY')
      });
    }
  }

  return (
    <Card title="Thông tin chuyến đi" className="trip-info-card">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div>
              <label>Chọn ngày đi và về: </label>
              <RangePicker
                onChange={onDateRangeChange}
                value={dateRange}
                style={{ marginLeft: 8 }}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div>
              <label>Ngân sách dự kiến: </label>
              <InputNumber
                min={0}
                step={1000000}
                formatter={value => `${value}đ`}
                parser={(value: string | undefined) => {
                  if (!value) return 0;
                  return Number(value.replace('đ', ''));
                }}
                onChange={value => onBudgetChange(Number(value))}
                value={budget}
                style={{ width: 200, marginLeft: 8 }}
              />
            </div>
          </Col>
        </Row>

        {dateRange && (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Statistic
                  title="Tổng số ngày"
                  value={totalDays}
                  prefix={<CalendarOutlined />}
                  suffix="ngày"
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Ngày hiện tại"
                  value={currentDay}
                  prefix={<Badge count={currentDay} style={{ backgroundColor: '#1890ff' }} />}
                  suffix={`/${totalDays}`}
                />
              </Col>
              <Col xs={24} md={8}>
                <Statistic
                  title="Chi phí hiện tại"
                  value={totalCost}
                  formatter={value => formatPrice(Number(value))}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: totalCost > budget ? '#cf1322' : '#3f8600' }}
                />
              </Col>
            </Row>

            <div className="day-selector">
              <h4>Chọn ngày để xem và thêm điểm đến:</h4>
              <Steps
                current={currentDay - 1}
                onChange={onCurrentDayChange}
                type="navigation"
                size="small"
                responsive
                className="day-steps"
              >
                {daysArray.map(item => (
                  <Step
                    key={item.day}
                    title={`Ngày ${item.day}`}
                    description={item.date}
                  />
                ))}
              </Steps>
            </div>
          </>
        )}

        {budget > 0 && totalCost > budget && (
          <Alert
            message="Cảnh báo vượt ngân sách"
            description={`Chi phí hiện tại (${formatPrice(totalCost)}) vượt quá ngân sách dự kiến (${formatPrice(budget)})`}
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default TripInfoForm;
