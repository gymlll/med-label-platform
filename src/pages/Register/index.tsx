import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, Space, Select, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { authApi } from '../../services/api';
import { useAppStore } from '../../stores/appStore';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAppStore();

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const result = await authApi.register({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
        title: values.title,
        department: values.department,
      });
      setUser(result.user);
      setToken(result.token);
      message.success(`注册成功，欢迎 ${result.user.fullName}`);
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.message || '注册失败');
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
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
        top: -200, right: -200,
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
        bottom: -100, left: -100,
      }} />

      <Card
        style={{
          width: 520,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.98)',
          zIndex: 1,
        }}
        styles={{ body: { padding: '40px 40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16,
            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <MedicineBoxOutlined style={{ fontSize: 36, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1a365d' }}>注册账号</Title>
          <Text type="secondary">创建医学多模态数据标注平台账号</Text>
        </div>

        <Form
          size="large"
          onFinish={handleRegister}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '至少3个字符' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="fullName"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="真实姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '至少6个字符' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('两次密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="职称" name="title">
                <Select placeholder="选择职称" allowClear
                  options={[
                    '主任医师', '副主任医师', '主治医师', '住院医师',
                    '高级工程师', '工程师', '研究员', '教授',
                  ].map(t => ({ value: t, label: t }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="科室" name="department">
                <Select placeholder="选择科室" allowClear
                  options={[
                    '放射科', '病理科', '超声科', '中医科',
                    '内科', '外科', '信息科', '科研处',
                  ].map(d => ({ value: d, label: d }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="邮箱" name="email">
            <Input placeholder="email@hospital.cn" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 16 }}>
              注 册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Space>
            <Text type="secondary">已有账号？</Text>
            <Link to="/login" style={{ color: '#1890ff' }}>返回登录</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
