import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import AppointmentForm from '../../components/bai2/AppointmentForm';
import AppointmentList from '../../components/bai2/AppointmentList';
import EmployeeManagement from '../../components/bai2/EmployeeManagement';
import ReviewForm from '../../components/bai2/ReviewForm';

const { Content, Sider } = Layout;

const App: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState('appointments');

  const renderContent = () => {
    switch(selectedMenu) {
      case 'appointments':
        return <AppointmentForm appointmentId={''} customerId={''} employeeId={''} serviceId={''} />;
      case 'appointmentList':
        return <AppointmentList />;
      case 'employees':
        return <EmployeeManagement />;
      case 'reviews':
        return <ReviewForm appointmentId={''} customerId={''} employeeId={''} serviceId={''} />;
      default:
        return <AppointmentForm appointmentId={''} customerId={''} employeeId={''} serviceId={''} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <Menu
          mode="inline"
          defaultSelectedKeys={['appointments']}
          style={{ height: '100%', borderRight: 0 }}
          onSelect={({ key }) => setSelectedMenu(key)}
        >
          <Menu.Item key="appointments">Đặt Lịch Hẹn</Menu.Item>
          <Menu.Item key="appointmentList">Danh Sách Lịch Hẹn</Menu.Item>
          <Menu.Item key="employees">Quản Lý Nhân Viên</Menu.Item>
          <Menu.Item key="reviews">Đánh Giá</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
