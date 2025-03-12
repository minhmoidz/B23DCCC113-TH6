// components/StatisticsReport.tsx
import React, { useState, useEffect } from 'react';
import { Card, Tabs, DatePicker, Row, Col, Statistic, Table, Select, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Appointment, Service, Employee } from '../../interfaces/types';
import { appointmentService, serviceService, employeeService } from '../../services/bai2/localStorageService';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const StatisticsReport: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [viewType, setViewType] = useState<'daily' | 'monthly'>('daily');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [serviceStats, setServiceStats] = useState<any[]>([]);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (appointments.length > 0 && services.length > 0 && employees.length > 0) {
      filterAppointments();
    }
  }, [appointments, dateRange, viewType]);

  useEffect(() => {
    if (filteredAppointments.length > 0) {
      calculateStats();
    }
  }, [filteredAppointments]);

  const loadData = () => {
    const appointmentsData = appointmentService.getAll().filter(app =>
      app.status === 'completed' || app.status === 'confirmed'
    );
    const servicesData = serviceService.getAll();
    const employeesData = employeeService.getAll();

    setAppointments(appointmentsData);
    setServices(servicesData);
    setEmployees(employeesData);
  };

  const filterAppointments = () => {
    const [startDate, endDate] = dateRange;

    const filtered = appointments.filter(app => {
      const appDate = dayjs(app.date);
      return appDate.isAfter(startDate.startOf('day')) && appDate.isBefore(endDate.endOf('day'));
    });

    setFilteredAppointments(filtered);
  };

  const calculateStats = () => {
    // Thống kê theo dịch vụ
    const serviceMap = new Map<string, { count: number, revenue: number }>();

    filteredAppointments.forEach(app => {
      const service = services.find(s => s.id === app.serviceId);
      if (service) {
        const serviceData = serviceMap.get(service.id) || { count: 0, revenue: 0 };
        serviceMap.set(service.id, {
          count: serviceData.count + 1,
          revenue: serviceData.revenue + service.price
        });
      }
    });

    const serviceStatsData = Array.from(serviceMap.entries()).map(([id, data]) => {
      const service = services.find(s => s.id === id);
      return {
        name: service?.name || 'Unknown',
        count: data.count,
        revenue: data.revenue
      };
    });

    setServiceStats(serviceStatsData);

    // Thống kê theo nhân viên
    const employeeMap = new Map<string, { count: number, revenue: number }>();

    filteredAppointments.forEach(app => {
      const service = services.find(s => s.id === app.serviceId);
      if (service) {
        const employeeData = employeeMap.get(app.employeeId) || { count: 0, revenue: 0 };
        employeeMap.set(app.employeeId, {
          count: employeeData.count + 1,
          revenue: employeeData.revenue + service.price
        });
      }
    });

    const employeeStatsData = Array.from(employeeMap.entries()).map(([id, data]) => {
      const employee = employees.find(e => e.id === id);
      return {
        name: employee?.name || 'Unknown',
        count: data.count,
        revenue: data.revenue
      };
    });

    setEmployeeStats(employeeStatsData);

    // Thống kê theo ngày/tháng
    if (viewType === 'daily') {
      const dailyMap = new Map<string, { count: number, revenue: number }>();

      filteredAppointments.forEach(app => {
        const service = services.find(s => s.id === app.serviceId);
        if (service) {
          const dailyData = dailyMap.get(app.date) || { count: 0, revenue: 0 };
          dailyMap.set(app.date, {
            count: dailyData.count + 1,
            revenue: dailyData.revenue + service.price
          });
        }
      });

      const dailyStatsData = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          displayDate: dayjs(date).format('DD/MM'),
          count: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

      setDailyStats(dailyStatsData);
    } else {
      const monthlyMap = new Map<string, { count: number, revenue: number }>();

      filteredAppointments.forEach(app => {
        const service = services.find(s => s.id === app.serviceId);
        if (service) {
          const month = dayjs(app.date).format('MM/YYYY');
          const monthlyData = monthlyMap.get(month) || { count: 0, revenue: 0 };
          monthlyMap.set(month, {
            count: monthlyData.count + 1,
            revenue: monthlyData.revenue + service.price
          });
        }
      });

      const monthlyStatsData = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month,
          count: data.count,
          revenue: data.revenue
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/').map(Number);
          const [bMonth, bYear] = b.month.split('/').map(Number);
          return aYear === bYear ? aMonth - bMonth : aYear - bYear;
        });

      setDailyStats(monthlyStatsData);
    }
  };

  const getTotalRevenue = () => {
    return filteredAppointments.reduce((total, app) => {
      const service = services.find(s => s.id === app.serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getTotalAppointments = () => {
    return filteredAppointments.length;
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const serviceColumns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: any, b: any) => a.revenue - b.revenue,
      render: (revenue: number) => revenue.toLocaleString('vi-VN') + ' VNĐ',
    },
  ];

  const employeeColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng khách',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: any, b: any) => a.revenue - b.revenue,
      render: (revenue: number) => revenue.toLocaleString('vi-VN') + ' VNĐ',
    },
  ];

  const dailyColumns = [
    {
      title: viewType === 'daily' ? 'Ngày' : 'Tháng',
      dataIndex: viewType === 'daily' ? 'displayDate' : 'month',
      key: 'date',
    },
    {
      title: 'Số lượng lịch hẹn',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: any, b: any) => a.revenue - b.revenue,
      // components/StatisticsReport.tsx (tiếp theo)
      render: (revenue: number) => revenue.toLocaleString('vi-VN') + ' VNĐ',
    },
  ];

  return (
    <Card title="Thống kê & Báo cáo">
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>Thời gian:</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ marginRight: 16 }}
            />
          </Col>
          <Col>
            <span style={{ marginRight: 8 }}>Xem theo:</span>
            <Select
              value={viewType}
              onChange={(value) => setViewType(value)}
              style={{ width: 120, marginRight: 16 }}
            >
              <Option value="daily">Ngày</Option>
              <Option value="monthly">Tháng</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={() => loadData()}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={getTotalRevenue()}
              suffix="VNĐ"
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng số lịch hẹn"
              value={getTotalAppointments()}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Thống kê theo thời gian" key="1">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              onClick={() => exportToCSV(dailyStats, `thong_ke_theo_${viewType === 'daily' ? 'ngay' : 'thang'}.csv`)}
            >
              Xuất CSV
            </Button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailyStats}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewType === 'daily' ? 'displayDate' : 'month'} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value: any) => typeof value === 'number' && value.toLocaleString('vi-VN')} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="Số lượng lịch hẹn" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="revenue" name="Doanh thu (VNĐ)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <Table
            columns={dailyColumns}
            dataSource={dailyStats}
            rowKey={viewType === 'daily' ? 'date' : 'month'}
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 16 }}
          />
        </TabPane>

        <TabPane tab="Thống kê theo dịch vụ" key="2">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              onClick={() => exportToCSV(serviceStats, 'thong_ke_theo_dich_vu.csv')}
            >
              Xuất CSV
            </Button>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => entry.name}
                  >
                    {serviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => typeof value === 'number' && value.toLocaleString('vi-VN')} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceStats}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#82ca9d"
                    label={(entry) => entry.name}
                  >
                    {serviceStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => typeof value === 'number' && value.toLocaleString('vi-VN') + ' VNĐ'} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Table
            columns={serviceColumns}
            dataSource={serviceStats}
            rowKey="name"
            pagination={false}
            style={{ marginTop: 16 }}
          />
        </TabPane>

        <TabPane tab="Thống kê theo nhân viên" key="3">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              onClick={() => exportToCSV(employeeStats, 'thong_ke_theo_nhan_vien.csv')}
            >
              Xuất CSV
            </Button>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={employeeStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: any) => typeof value === 'number' && value.toLocaleString('vi-VN')} />
                  <Legend />
                  <Bar dataKey="count" name="Số lượng khách" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={employeeStats}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value: any) => typeof value === 'number' && value.toLocaleString('vi-VN') + ' VNĐ'} />
                  <Legend />
                  <Bar dataKey="revenue" name="Doanh thu (VNĐ)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Table
            columns={employeeColumns}
            dataSource={employeeStats}
            rowKey="name"
            pagination={false}
            style={{ marginTop: 16 }}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StatisticsReport;

