import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserModel } from '../../models/bai1/UserModel';

const { Title } = Typography;

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (!username.trim()) {
      message.error('Please enter a username');
      return;
    }

    UserModel.login(username);
    message.success(`Welcome, ${username}!`);
    onLoginSuccess();
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Team Task Management
        </Title>

        <Form layout="vertical">
          <Form.Item
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onPressEnter={handleLogin}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={handleLogin}
              style={{ width: '100%' }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
