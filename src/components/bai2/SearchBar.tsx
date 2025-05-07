import React from 'react';
import { Input, DatePicker, Form, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface SearchBarProps {
  onSearch: (text: string) => void;
  onDateRangeChange: (dates: [Date | null, Date | null] | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onDateRangeChange }) => {
  const handleDateChange = (dates: any) => {
    if (dates) {
      const startDate = dates[0]?.toDate() || null;
      const endDate = dates[1]?.toDate() || null;
      onDateRangeChange([startDate, endDate]);
    } else {
      onDateRangeChange(null);
    }
  };

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Tìm kiếm ghi chú">
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tiêu đề hoặc nội dung"
              onChange={e => onSearch(e.target.value)}
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Lọc theo ngày tạo">
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchBar;
