// pages/RegisterPage.tsx

import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Card,
  message,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { AspirationType } from '../../types/bai2/index';
import { useAppContext } from '../../context/AppContext';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const { addApplication } = useAppContext();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = (values: any) => {
    addApplication({
      fullName: values.fullName,
      email: values.email,
      aspiration: values.aspiration as AspirationType,
      reason: values.reason,
    });

    messageApi.success('Đơn đăng ký đã được gửi thành công!');
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Title level={2}>Đăng Ký Tham Gia Câu Lạc Bộ</Title>

      <Card>
        <Paragraph>
          Vui lòng điền đầy đủ thông tin để đăng ký tham gia câu lạc bộ của
          chúng tôi. Đơn đăng ký của bạn sẽ được xem xét và phản hồi trong thời
          gian sớm nhất.
        </Paragraph>

        <Divider />

        <Form
          form={form}
          name="registerForm"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark="optional"
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { min: 3, message: 'Họ tên phải có ít nhất 3 ký tự!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập địa chỉ email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Nguyện vọng"
            name="aspiration"
            rules={[{ required: true, message: 'Vui lòng chọn nguyện vọng!' }]}
          >
            <Select placeholder="Chọn nguyện vọng" size="large">
              <Option value="design">Team Design</Option>
              <Option value="dev">Team Development</Option>
              <Option value="media">Team Media</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Lý do đăng ký"
            name="reason"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do đăng ký!' },
              {
                min: 20,
                message: 'Lý do đăng ký phải có ít nhất 20 ký tự!',
              },
            ]}
          >
            <TextArea
              placeholder="Nhập lý do bạn muốn tham gia câu lạc bộ..."
              rows={5}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Đăng ký
              </Button>
              <Button
                htmlType="reset"
                size="large"
                onClick={() => form.resetFields()}
              >
                Xóa form
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default RegisterPage;
