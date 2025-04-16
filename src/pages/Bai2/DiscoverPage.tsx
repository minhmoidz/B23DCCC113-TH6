// src/pages/DiscoverPage.tsx
import React, { useState, useEffect } from 'react';
import { Card, Rate, Row, Col, Select, Slider, Input, Tag, Space, Typography, Button, Empty, Spin } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchDestinations } from '../../services/bai2/api';
import { formatPrice, getTypeColor, getTypeName } from '../../utils/bai2/helpers';
import type { DestinationType } from '../../types/bai2/index';

const { Option } = Select;
const { Meta } = Card;
const { Title } = Typography;

// Định nghĩa key lưu trữ trong localStorage (phải giống với key trong AdminPage)
const DESTINATIONS_STORAGE_KEY = 'travelAppDestinations';

const DiscoverPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<DestinationType[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    loadDestinationsFromLocalStorage();

    // Thêm event listener để lắng nghe thay đổi trong localStorage
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadDestinationsFromLocalStorage = () => {
    setLoading(true);
    // Kiểm tra xem có dữ liệu trong localStorage không
    const storedDestinations = localStorage.getItem(DESTINATIONS_STORAGE_KEY);

    if (storedDestinations) {
      // Nếu có dữ liệu trong localStorage, sử dụng nó
      const data = JSON.parse(storedDestinations);
      setDestinations(data);
      setFilteredDestinations(data);
      setLoading(false);
    } else {
      // Nếu không có dữ liệu trong localStorage, fetch từ API
      fetchDestinations().then(data => {
        setDestinations(data);
        setFilteredDestinations(data);
        // Lưu dữ liệu vào localStorage để sử dụng sau này
        localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(data));
        setLoading(false);
      });
    }
  };

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === DESTINATIONS_STORAGE_KEY) {
      loadDestinationsFromLocalStorage();
    }
  };

  const handleClearFilters = () => {
    setTypeFilter([]);
    setPriceRange([0, 10000000]);
    setRatingFilter(0);
    setSearchQuery('');
  };

  // Hàm xử lý thay đổi khoảng giá
  const handlePriceRangeChange = (value: [number, number]) => {
    console.log('Price range changed:', value); // Thêm log để debug
    setPriceRange(value);
  };

  useEffect(() => {
    // Apply filters
    let result = [...destinations]; // Tạo bản sao của mảng destinations

    console.log('Applying filters:');
    console.log('- Type filter:', typeFilter);
    console.log('- Price range:', priceRange);
    console.log('- Rating filter:', ratingFilter);
    console.log('- Search query:', searchQuery);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(dest =>
        dest.name.toLowerCase().includes(query) ||
        dest.location.toLowerCase().includes(query) ||
        (dest.description && dest.description.toLowerCase().includes(query))
      );
      console.log('After search filter:', result.length);
    }

    // Apply type filter
    if (typeFilter.length > 0) {
      result = result.filter(dest => typeFilter.includes(dest.type));
      console.log('After type filter:', result.length);
    }

    // Apply price filter - Đảm bảo so sánh chính xác
    result = result.filter(dest => {
      const inRange = dest.price >= priceRange[0] && dest.price <= priceRange[1];
      return inRange;
    });
    console.log('After price filter:', result.length);

    // Apply rating filter
    result = result.filter(dest => dest.rating >= ratingFilter);
    console.log('After rating filter:', result.length);

    setFilteredDestinations(result);
  }, [searchQuery, typeFilter, priceRange, ratingFilter, destinations]);

  return (
    <div className="discover-container">
      <div className="discover-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Khám phá điểm đến</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadDestinationsFromLocalStorage}
          title="Làm mới dữ liệu"
        >
          Làm mới
        </Button>
      </div>

      <div className="search-bar">
        <Input
          size="large"
          placeholder="Tìm kiếm điểm đến..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: 24 }}
          allowClear
        />
      </div>

      <div className="filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={6} lg={6}>
            <Select
              mode="multiple"
              placeholder="Loại hình du lịch"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
            >
              <Option value="beach">Biển</Option>
              <Option value="mountain">Núi</Option>
              <Option value="city">Thành phố</Option>
              <Option value="countryside">Nông thôn</Option>
              <Option value="cultural">Văn hóa</Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={8} lg={8}>
            <div>
              <span>Khoảng giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
              <Slider
                range
                min={0}
                max={10000000}
                step={500000}
                value={priceRange}
                onChange={handlePriceRangeChange}
                tipFormatter={value => formatPrice(value)}
              />
            </div>
          </Col>

          <Col xs={24} sm={24} md={6} lg={6}>
            <span>Đánh giá tối thiểu: </span>
            <Rate allowHalf value={ratingFilter} onChange={setRatingFilter} />
          </Col>

          <Col xs={24} sm={24} md={4} lg={4}>
            <Button
              type="primary"
              onClick={handleClearFilters}
              disabled={!typeFilter.length && priceRange[0] === 0 && priceRange[1] === 10000000 && ratingFilter === 0 && !searchQuery}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </div>

      <div className="destinations-grid" style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p>Đang tải dữ liệu điểm đến...</p>
          </div>
        ) : filteredDestinations.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredDestinations.map(destination => (
              <Col xs={24} sm={12} md={8} lg={6} key={destination.id}>
                <Card
                  hoverable
                  className="destination-card"
                  cover={<img alt={destination.name} src={destination.imageUrl} style={{ height: 200, objectFit: 'cover' }} />}
                  actions={[
                    <Rate disabled defaultValue={destination.rating} />,
                    <Tag color="blue">{formatPrice(destination.price)}</Tag>
                  ]}
                >
                  <Meta
                    title={destination.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Space>
                          <EnvironmentOutlined />
                          {destination.location}
                        </Space>
                        <Tag color={getTypeColor(destination.type)} style={{ marginTop: 8 }}>
                          {getTypeName(destination.type)}
                        </Tag>
                        {destination.description && (
                          <div className="destination-description" style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                            {destination.description.length > 50
                              ? `${destination.description.substring(0, 50)}...`
                              : destination.description}
                          </div>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description={
              <div>
                <Title level={4}>Không tìm thấy điểm đến phù hợp</Title>
                <p>Vui lòng thử lại với bộ lọc khác</p>
                <Button type="primary" onClick={handleClearFilters}>Xóa tất cả bộ lọc</Button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
