// pages/StatisticsPage.tsx

import React, { useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Divider,
  Space,
  Progress,
  Table,
  Tag
} from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  FileOutlined
} from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { AspirationType } from '../../types/bai2/index';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { Title, Paragraph } = Typography;

// Màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF'];
const ASPIRATION_COLORS = {
  design: '#A28AFF',
  dev: '#0088FE',
  media: '#FFBB28'
};

const STATUS_COLORS = {
  pending: '#FFBB28',
  approved: '#00C49F',
  rejected: '#FF8042'
};

const StatisticsPage: React.FC = () => {
  const { applications, members, statistics, calculateStatistics } = useAppContext();

  useEffect(() => {
    calculateStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dữ liệu cho biểu đồ phân bố nguyện vọng
  const aspirationData = [
    { name: 'Design', value: statistics.aspirations.design },
    { name: 'Development', value: statistics.aspirations.dev },
    { name: 'Media', value: statistics.aspirations.media }
  ];

  // Dữ liệu cho biểu đồ trạng thái đơn đăng ký
  const statusData = [
    { name: 'Chờ duyệt', value: statistics.status.pending },
    { name: 'Đã duyệt', value: statistics.status.approved },
    { name: 'Đã từ chối', value: statistics.status.rejected }
  ];

  // Dữ liệu cho biểu đồ cột phân bố thành viên theo nhóm
  const teamData = [
    { name: 'Design', value: statistics.teams.design },
    { name: 'Development', value: statistics.teams.dev },
    { name: 'Media', value: statistics.teams.media }
  ];

  // Dữ liệu cho bảng tổng hợp
  const summaryData = [
    {
      key: 'design',
      team: 'Team Design',
      applications: statistics.aspirations.design,
      approved: members.filter(m => m.team === 'design').length,
      approvalRate: statistics.aspirations.design > 0
        ? ((members.filter(m => m.team === 'design').length / statistics.aspirations.design) * 100).toFixed(2) + '%'
        : '0%'
    },
    {
      key: 'dev',
      team: 'Team Development',
      applications: statistics.aspirations.dev,
      approved: members.filter(m => m.team === 'dev').length,
      approvalRate: statistics.aspirations.dev > 0
        ? ((members.filter(m => m.team === 'dev').length / statistics.aspirations.dev) * 100).toFixed(2) + '%'
        : '0%'
    },
    {
      key: 'media',
      team: 'Team Media',
      applications: statistics.aspirations.media,
      approved: members.filter(m => m.team === 'media').length,
      approvalRate: statistics.aspirations.media > 0
        ? ((members.filter(m => m.team === 'media').length / statistics.aspirations.media) * 100).toFixed(2) + '%'
        : '0%'
    }
  ];

  const summaryColumns = [
    {
      title: 'Nhóm',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Số lượng đơn',
      dataIndex: 'applications',
      key: 'applications',
      sorter: (a: any, b: any) => a.applications - b.applications,
    },
    {
      title: 'Thành viên',
      dataIndex: 'approved',
      key: 'approved',
      sorter: (a: any, b: any) => a.approved - b.approved,
    },
    {
      title: 'Tỷ lệ duyệt',
      dataIndex: 'approvalRate',
      key: 'approvalRate',
      render: (text: string, record: any) => (
        <Progress
          percent={parseFloat(text)}
          size="small"
          format={(percent) => `${percent?.toFixed(2)}%`}
        />
      ),
      sorter: (a: any, b: any) => parseFloat(a.approvalRate) - parseFloat(b.approvalRate),
    },
  ];

  const calculateStatusPercentage = (status: string) => {
    const total = statistics.status.total;
    if (total === 0) return 0;

    switch (status) {
      case 'pending': return (statistics.status.pending / total) * 100;
      case 'approved': return (statistics.status.approved / total) * 100;
      case 'rejected': return (statistics.status.rejected / total) * 100;
      default: return 0;
    }
  };

  return (
    <>
      <Title level={2}>Báo Cáo & Thống Kê</Title>

      <Paragraph>
        Tổng quan về các đơn đăng ký và thành viên câu lạc bộ.
      </Paragraph>

      {/* Overview Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <Statistic
              title="Tổng số đơn đăng ký"
              value={applications.length}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <Statistic
              title="Tổng số thành viên"
              value={members.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Card>
            <Statistic
              title="Tỷ lệ duyệt"
              value={applications.length > 0 ? (members.length / applications.length) * 100 : 0}
              precision={2}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Status Stats */}
      <Title level={3}>Trạng thái đơn đăng ký</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Đơn chờ duyệt"
                value={statistics.status.pending}
                suffix={`/ ${statistics.status.total}`}
                valueStyle={{ color: '#faad14' }}
              />
              <Progress
                percent={calculateStatusPercentage('pending')}
                status="active"
                strokeColor="#faad14"
              />

              <Statistic
                title="Đơn đã duyệt"
                value={statistics.status.approved}
                suffix={`/ ${statistics.status.total}`}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={calculateStatusPercentage('approved')}
                status="active"
                strokeColor="#52c41a"
              />

              <Statistic
                title="Đơn bị từ chối"
                value={statistics.status.rejected}
                suffix={`/ ${statistics.status.total}`}
                valueStyle={{ color: '#ff4d4f' }}
              />
              <Progress
                percent={calculateStatusPercentage('rejected')}
                status="active"
                strokeColor="#ff4d4f"
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Chờ duyệt' ? STATUS_COLORS.pending :
                        entry.name === 'Đã duyệt' ? STATUS_COLORS.approved :
                        STATUS_COLORS.rejected
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Aspiration Stats */}
      <Title level={3}>Phân bố nguyện vọng</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aspirationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {aspirationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Design' ? ASPIRATION_COLORS.design :
                        entry.name === 'Development' ? ASPIRATION_COLORS.dev :
                        ASPIRATION_COLORS.media
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <Table
              dataSource={summaryData}
              columns={summaryColumns}
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Team Stats */}
      <Title level={3}>Phân bố thành viên theo nhóm</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={teamData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Số lượng thành viên" fill="#8884d8">
                  {teamData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === 'Design' ? ASPIRATION_COLORS.design :
                        entry.name === 'Development' ? ASPIRATION_COLORS.dev :
                        ASPIRATION_COLORS.media
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default StatisticsPage;
