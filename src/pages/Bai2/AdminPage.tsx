// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, notification, Typography, Avatar
} from 'antd';
import {
  DashboardOutlined, EnvironmentOutlined,
  BarChartOutlined, UserOutlined
} from '@ant-design/icons';
import { fetchDestinations, fetchStatistics } from '../../services/bai2/api';
import type { DestinationType, StatisticsData } from '../../types/bai2/index';
import DashboardContent from '../../components/bai2/admin/DashboardContent';
import DestinationsContent from '../../components/bai2/admin/DestinationsContent';
import StatisticsContent from '../../components/bai2/admin/StatisticsContent';


const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DESTINATIONS_STORAGE_KEY = 'travelAppDestinations';

const AdminPage: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>('destinations');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra xem có dữ liệu điểm đến trong localStorage không
    const storedDestinations = localStorage.getItem(DESTINATIONS_STORAGE_KEY);

    if (storedDestinations) {
      // Nếu có, sử dụng dữ liệu từ localStorage
      setDestinations(JSON.parse(storedDestinations));
    } else {
      // Nếu không, fetch từ API và lưu vào localStorage
      fetchDestinations().then(data => {
        setDestinations(data);
        localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(data));
      });
    }

    // Fetch statistics
    fetchStatistics().then(data => {
      setStatistics(data);
    });
  }, []);

  const handleMenuClick = (key: string) => {
    setSelectedMenu(key);
  };

  const handleAddDestination = (destination: DestinationType) => {
    const newDestinations = [...destinations, destination];
    setDestinations(newDestinations);

    // Lưu danh sách điểm đến mới vào localStorage
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(newDestinations));

    notification.success({
      message: 'Thêm thành công',
      description: `Đã thêm điểm đến "${destination.name}" và lưu vào localStorage`
    });
  };

  const handleUpdateDestination = (destination: DestinationType) => {
    const updatedDestinations = destinations.map(dest =>
      dest.id === destination.id ? destination : dest
    );
    setDestinations(updatedDestinations);

    // Cập nhật danh sách điểm đến trong localStorage
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(updatedDestinations));

    notification.success({
      message: 'Cập nhật thành công',
      description: `Đã cập nhật điểm đến "${destination.name}" và lưu vào localStorage`
    });
  };

  const handleDeleteDestination = (id: string) => {
    const updatedDestinations = destinations.filter(dest => dest.id !== id);
    setDestinations(updatedDestinations);

    // Cập nhật danh sách điểm đến trong localStorage sau khi xóa
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(updatedDestinations));

    notification.success({
      message: 'Xóa thành công',
      description: 'Đã xóa điểm đến và cập nhật localStorage'
    });
  };

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="admin-sider"
      >
        <div className="logo">
          {collapsed ? 'Admin' : 'Travel Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['destinations']}
          onClick={({ key }) => handleMenuClick(key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Tổng quan
          </Menu.Item>
          <Menu.Item key="destinations" icon={<EnvironmentOutlined />}>
            Quản lý điểm đến
          </Menu.Item>
          <Menu.Item key="statistics" icon={<BarChartOutlined />}>
            Thống kê
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="admin-header">
          <div className="admin-header-content">
            <Title level={4} style={{ margin: 0, color: 'white' }}>
              {selectedMenu === 'dashboard' && 'Tổng quan'}
              {selectedMenu === 'destinations' && 'Quản lý điểm đến'}
              {selectedMenu === 'statistics' && 'Thống kê'}
            </Title>
            <div className="admin-user">
              <span className="admin-username">Admin</span>
              <Avatar icon={<UserOutlined />} />
            </div>
          </div>
        </Header>
        <Content className="admin-content">
          {selectedMenu === 'dashboard' && (
            <DashboardContent
              destinations={destinations}
              statistics={statistics}
            />
          )}

          {selectedMenu === 'destinations' && (
            <DestinationsContent
              destinations={destinations}
              onAdd={handleAddDestination}
              onUpdate={handleUpdateDestination}
              onDelete={handleDeleteDestination}
            />
          )}

          {selectedMenu === 'statistics' && (
            <StatisticsContent statistics={statistics} />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminPage;
