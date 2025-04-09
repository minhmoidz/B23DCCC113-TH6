// pages/MembersPage.tsx

import React, { useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Typography,
  Card,
  message,
  Tooltip,
  Segmented
} from 'antd';
import type { ColumnsType } from 'antd/es/table'; // ✅ Add this at the top

import {
  DownloadOutlined,
  SearchOutlined,
  TeamOutlined,
  FilterOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Member, AspirationType } from '../../types/bai2/index';
import { useAppContext } from '../../context/AppContext';
import { formatDate, exportToExcel } from '../../utils/bai2/helpers';

const { Title } = Typography;
const { Option } = Select;

const MembersPage: React.FC = () => {
  const { members, updateMemberTeam } = useAppContext();
  const [searchText, setSearchText] = useState('');
  const [filteredTeam, setFilteredTeam] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleTeamChange = (memberId: string, newTeam: AspirationType) => {
    updateMemberTeam(memberId, newTeam);
    messageApi.success('Cập nhật nhóm thành công!');
  };

  const filteredMembers = members.filter(member => {
    const matchSearch = searchText
      ? member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchTeam = filteredTeam ? member.team === filteredTeam : true;

    return matchSearch && matchTeam;
  });

  const exportMembers = () => {
    const membersToExport = filteredMembers.map(member => ({
      'Họ tên': member.fullName,
      'Email': member.email,
      'Vai trò': member.role,
      'Nhóm': member.team === 'design' ? 'Team Design' : member.team === 'dev' ? 'Team Development' : 'Team Media',
      'Ngày tham gia': formatDate(member.joinedAt)
    }));

    exportToExcel(membersToExport, 'danh-sach-thanh-vien');
    messageApi.success('Xuất danh sách thành công!');
  };

  const columns = [
    {
      title: 'Họ Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: Member, b: Member) => a.fullName.localeCompare(b.fullName),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Nhóm',
      dataIndex: 'team',
      key: 'team',
      render: (team: AspirationType, record: Member) => (
        <Select
          value={team}
          style={{ width: 140 }}
          onChange={(value) => handleTeamChange(record.id, value as AspirationType)}
        >
          <Option value="design">Team Design</Option>
          <Option value="dev">Team Development</Option>
          <Option value="media">Team Media</Option>
        </Select>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Ngày Tham Gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (text: string) => formatDate(text),
      sorter: (a: Member, b: Member) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
      responsive: ['md', 'lg', 'xl'],
    },
  ];

  return (
    <>
      {contextHolder}
      <Title level={2}>Quản Lý Thành Viên</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input.Search
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
              prefix={<SearchOutlined />}
            />

            <Segmented
              options={[
                { label: 'Tất cả', value: '', icon: <TeamOutlined /> },
                { label: 'Team Design', value: 'design' },
                { label: 'Team Dev', value: 'dev' },
                { label: 'Team Media', value: 'media' },
              ]}
              value={filteredTeam || ''}
              onChange={(value) => setFilteredTeam(value === '' ? null : value as string)}
            />
          </Space>

          <Tooltip title="Xuất danh sách thành viên (Excel)">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportMembers}
              disabled={filteredMembers.length === 0}
            >
              Xuất Excel
            </Button>
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 800 }}
          locale={{ emptyText: 'Không có thành viên nào' }}
        />
      </Card>
    </>
  );
};

export default MembersPage;
