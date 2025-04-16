// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  HomeOutlined, CompassOutlined, CalendarOutlined,
  WalletOutlined, UserOutlined, SettingOutlined,
  LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined
} from '@ant-design/icons';
import DiscoverPage from "./DiscoverPage";
import ItineraryPlanner from './ItineraryPlanner';
import BudgetManager from './BudgetManager';
import AdminPage from './AdminPage';


const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
          className="app-sider"
        >
          <div className="logo">
            {!collapsed && "Travel Planner"}
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<CompassOutlined />}>
              <Link to="/">Khám phá</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<CalendarOutlined />}>
              <Link to="/itinerary">Lịch trình</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<WalletOutlined />}>
              <Link to="/budget">Ngân sách</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<SettingOutlined />}>
              <Link to="/admin">Quản trị</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-header">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-button"
            />

          </Header>
          <Content className="site-content">
            <Switch>
            <Route path="/" exact component={DiscoverPage} />
            <Route path="/itinerary" component={ItineraryPlanner} />
            <Route path="/budget" component={BudgetManager} />
            <Route path="/admin" component={AdminPage} />
                      </Switch>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
