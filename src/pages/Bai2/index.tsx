// App.tsx
import React, { useEffect } from 'react';
import { Layout, Menu, Typography, Divider } from 'antd';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import {
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  CommentOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import EmployeeManagement from '../../components/bai2/EmployeeManagement';
import ServiceManagement from '../../components/bai2/ServiceManagement';
import AppointmentBooking from '../../components/bai2/AppointmentBooking';
import AppointmentManagement from '../../components/bai2/AppointmentManagement';
import ReviewManagement from '../../components/bai2/ReviewManagement';
import StatisticsReport from '../../components/bai2/StatisticsReport';
import { Employee, Service } from '../../interfaces/types';
import { employeeService, serviceService } from '../../services/bai2/localStorageService';
import { v4 as uuidv4 } from 'uuid';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  useEffect(() => {
    // Khởi tạo dữ liệu mẫu nếu chưa có dữ liệu
    initSampleData();
  }, []);

  const initSampleData = () => {
    // Kiểm tra xem đã có dữ liệu chưa
    const employees = employeeService.getAll();
    const services = serviceService.getAll();

    // Nếu chưa có dữ liệu, tạo dữ liệu mẫu
    if (employees.length === 0) {
      const sampleEmployees: Employee[] = [
        {
          id: uuidv4(),
          name: 'Nguyễn Văn A',
          services: ['service1', 'service2'],
          maxAppointmentsPerDay: 10,
          workSchedule: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' },
          ],
          averageRating: 4.5,
        },
        {
          id: uuidv4(),
          name: 'Trần Thị B',
          services: ['service1', 'service3'],
          maxAppointmentsPerDay: 8,
          workSchedule: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
            { dayOfWeek: 6, startTime: '09:00', endTime: '16:00' },
          ],
          averageRating: 4.2,
        },
      ];
      employeeService.save(sampleEmployees);
    }

    if (services.length === 0) {
      const sampleServices: Service[] = [
        {
          id: 'service1',
          name: 'Cắt tóc nam',
          price: 100000,
          durationMinutes: 30,
          description: 'Dịch vụ cắt tóc nam cơ bản',
        },
        {
          id: 'service2',
          name: 'Cắt tóc nữ',
          price: 150000,
          durationMinutes: 45,
          description: 'Dịch vụ cắt tóc nữ cơ bản',
        },
        {
          id: 'service3',
          name: 'Nhuộm tóc',
          price: 350000,
          durationMinutes: 120,
          description: 'Dịch vụ nhuộm tóc theo yêu cầu',
        },
      ];
      serviceService.save(sampleServices);
    }
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
            Hệ thống quản lý đặt lịch hẹn
          </div>
        </Header>
        <Layout>
          <Sider width={250} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="1" icon={<CalendarOutlined />}>
                <Link to="/booking">Đặt lịch hẹn</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<CalendarOutlined />}>
                <Link to="/appointments">Quản lý lịch hẹn</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<UserOutlined />}>
                <Link to="/employees">Quản lý nhân viên</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<AppstoreOutlined />}>
                <Link to="/services">Quản lý dịch vụ</Link>
              </Menu.Item>
              <Menu.Item key="5" icon={<CommentOutlined />}>
                <Link to="/reviews">Đánh giá dịch vụ</Link>
              </Menu.Item>
              <Menu.Item key="6" icon={<DashboardOutlined />}>
                <Link to="/statistics">Thống kê & Báo cáo</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Switch>
                <Route path="/booking" component={AppointmentBooking} />
                <Route path="/appointments" component={AppointmentManagement} />
                <Route path="/employees" component={EmployeeManagement} />
                <Route path="/services" component={ServiceManagement} />
                <Route path="/reviews" component={ReviewManagement} />
                <Route path="/statistics" component={StatisticsReport} />
                <Redirect from="/" to="/booking" />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
