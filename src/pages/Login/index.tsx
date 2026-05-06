import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, Space, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAppStore } from '../../stores/appStore';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAppStore();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await authApi.login(values.username, values.password);
      setUser(result.user);
      setToken(result.token);
      message.success(`欢迎回来，${result.user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 50%, #1e40af 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        top: -200,
        right: -200,
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        bottom: -100,
        left: -100,
      }} />

      <Card
        style={{
          width: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.98)',
          zIndex: 1,
        }}
        styles={{ body: { padding: '40px 40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <MedicineBoxOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1a365d' }}>医学多模态数据标注平台</Title>
          <Text type="secondary">Medical Multi-Modal Data Annotation Platform</Text>
        </div>

        <Form
          size="large"
          onFinish={handleLogin}
          initialValues={{ username: 'admin', password: 'admin123', remember: true }}
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住登录</Checkbox>
              </Form.Item>
              <a href="#" style={{ color: '#1890ff' }}>忘记密码？</a>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 16 }}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 16,
          marginTop: 8,
        }}>
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              演示账号: admin / admin123
            </Text>
            <Text type="secondary">|</Text>
            <Link to="/register" style={{ fontSize: 12 }}>
              注册新账号
            </Link>
          </Space>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 16,
        }}>
          <Space size={16}>
            <Text type="secondary" style={{ fontSize: 12 }}>医疗器械注册审查指导原则</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>等保三级</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>FDA 21 CFR Part 11</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
