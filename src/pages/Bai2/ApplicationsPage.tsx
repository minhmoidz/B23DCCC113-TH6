// pages/ApplicationsPage.tsx

import React, { useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Modal,
  Form,
  Typography,
  Tooltip,
  Badge,
  Card,
  Divider,
  Collapse,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Application, ApplicationStatus } from '../../types/bai2';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/bai2/helpers';

const { Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

type BadgeStatus = 'success' | 'processing' | 'error';

const statusColors: Record<ApplicationStatus, BadgeStatus> = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
};

const ApplicationsPage: React.FC = () => {
  const { applications, updateApplicationStatus, searchApplications } = useAppContext();
  const [searchText, setSearchText] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleLogModal, setVisibleLogModal] = useState(false);
  const [currentApp, setCurrentApp] = useState<Application | null>(null);
  const [logApplication, setLogApplication] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [note, setNote] = useState('');
  const [form] = Form.useForm();

  const filteredApplications = searchText
    ? searchApplications(searchText)
    : applications;

  const handleOpenModal = (record: Application, type: 'approve' | 'reject') => {
    setCurrentApp(record);
    setActionType(type);
    setNote('');
    form.resetFields();
    setVisibleModal(true);
  };

  const handleConfirmAction = () => {
    if (currentApp) {
      updateApplicationStatus(
        currentApp.id,
        actionType === 'approve' ? 'approved' : 'rejected',
        note
      );
      setVisibleModal(false);
      setCurrentApp(null);
      setNote('');
    }
  };

  const showLogs = (record: Application) => {
    setLogApplication(record);
    setVisibleLogModal(true);
  };

  const columns: ColumnsType<Application> = [
    {
      title: 'Họ Tên',
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Nguyện Vọng',
      dataIndex: 'aspiration',
      render: (text) => {
        const label =
          text === 'design' ? 'Design' : text === 'dev' ? 'Development' : 'Media';
        const color = text === 'design' ? 'purple' : text === 'dev' ? 'blue' : 'orange';
        return <Tag color={color}>{label}</Tag>;
      },
      filters: [
        { text: 'Design', value: 'design' },
        { text: 'Development', value: 'dev' },
        { text: 'Media', value: 'media' },
      ],
      onFilter: (value, record) => record.aspiration === value,
    },
    {
      title: 'Lý Do',
      dataIndex: 'reason',
      ellipsis: true,
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'createdAt',
      render: formatDate,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      render: (status) => (
        <Badge
          status={statusColors[status]}
          text={statusLabels[status]}
        />
      ),
      filters: [
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Đã duyệt', value: 'approved' },
        { text: 'Đã từ chối', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao Tác',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => handleOpenModal(record, 'approve')}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => handleOpenModal(record, 'reject')}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Xem lịch sử">
            <Button
              icon={<HistoryOutlined />}
              size="small"
              onClick={() => showLogs(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Quản Lý Đơn Đăng Ký</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên, email, nguyện vọng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined />}
          />
          <Space wrap>
            <Tooltip title="Thống kê đơn đăng ký">
              <Badge count={applications.filter(app => app.status === 'pending').length} showZero>
                <Button icon={<InfoCircleOutlined />}>Đơn chờ duyệt</Button>
              </Badge>
            </Tooltip>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredApplications}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal duyệt/từ chối */}
      <Modal
        title={actionType === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
        visible={visibleModal}
        onOk={handleConfirmAction}
        onCancel={() => setVisibleModal(false)}
        okText={actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={{ danger: actionType === 'reject' }}
      >
        <p>
          Bạn chắc chắn muốn {actionType === 'approve' ? 'duyệt' : 'từ chối'} đơn của{' '}
          <strong>{currentApp?.fullName}</strong>?
        </p>

        <Form form={form} layout="vertical">
          <Form.Item
            label={actionType === 'approve' ? 'Ghi chú (không bắt buộc)' : 'Lý do từ chối'}
            name="note"
            rules={actionType === 'reject' ? [{ required: true, message: 'Vui lòng nhập lý do từ chối' }] : []}
          >
            <TextArea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                actionType === 'approve'
                  ? 'Thêm ghi chú (nếu có)'
                  : 'Vui lòng nhập lý do từ chối đơn đăng ký'
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal lịch sử thao tác */}
      <Modal
        title="Lịch sử thao tác"
        visible={visibleLogModal}
        onCancel={() => setVisibleLogModal(false)}
        footer={[
          <Button key="close" onClick={() => setVisibleLogModal(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {logApplication && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Họ tên:</strong> {logApplication.fullName}</p>
              <p><strong>Email:</strong> {logApplication.email}</p>
              <p><strong>Nguyện vọng:</strong> {logApplication.aspiration}</p>
              <p><strong>Ngày đăng ký:</strong> {formatDate(logApplication.createdAt)}</p>
              <p>
                <strong>Trạng thái hiện tại:</strong>{' '}
                <Tag color={statusColors[logApplication.status]}>
                  {statusLabels[logApplication.status]}
                </Tag>
              </p>
            </div>

            <Divider orientation="left">Lịch sử hoạt động</Divider>

            <Collapse>
              {logApplication.logs.length > 0 ? (
                logApplication.logs.map((log, index) => (
                  <Panel
                    key={index}
                    header={
                      <span>
                        <Tag color={statusColors[log.action]}>
                          {statusLabels[log.action]}
                        </Tag>{' '}
                        {formatDate(log.timestamp)} - {log.admin}
                      </span>
                    }
                  >
                    <p><strong>Ghi chú:</strong> {log.note || 'Không có ghi chú'}</p>
                  </Panel>
                ))
              ) : (
                <Panel key="no-logs" header="Không có lịch sử thao tác">
                  <p>Đơn này chưa có hoạt động nào.</p>
                </Panel>
              )}
            </Collapse>
          </>
        )}
      </Modal>
    </>
  );
};

export default ApplicationsPage;
