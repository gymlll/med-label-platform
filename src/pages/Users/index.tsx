import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Modal, Form, Input, Select, Row, Col, message, Avatar, Tabs } from 'antd';
import { PlusOutlined, UserOutlined, LockOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userApi } from '../../services/api';
import type { User } from '../../types';

const { Title, Text } = Typography;

const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师', '高级工程师', '工程师', '研究员', '教授'];
const deptOptions = ['放射科', '病理科', '超声科', '中医科', '内科', '外科', '信息科', '科研处'];

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.list();
      setUsers(res.items);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    message.success(editingUser ? '用户信息已更新' : '用户创建成功');
    setModalOpen(false);
    form.resetFields();
    setEditingUser(null);
    loadUsers();
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const roleColors: Record<string, string> = {
    admin: 'red', pm: 'blue', annotator: 'green', reviewer: 'orange',
  };

  const roleMap: Record<string, string> = {
    admin: '系统管理员', pm: '项目经理', annotator: '标注员', reviewer: '审核员',
  };

  const columns = [
    { title: '姓名', key: 'name',
      render: (_: any, r: User) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
          <span>{r.fullName}</span>
        </Space>
      )
    },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 100 },
    { title: '职称', dataIndex: 'title', key: 'title', width: 100 },
    { title: '科室', dataIndex: 'department', key: 'department', width: 100 },
    { title: '角色', key: 'roles', width: 160,
      render: (_: any, r: User) => (
        <Space size={4}>
          {(r.roles || []).map(role => (
            <Tag key={role.code} color={roleColors[role.code] || 'default'}>{roleMap[role.code] || role.name}</Tag>
          ))}
        </Space>
      )
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '正常' : '禁用'}</Tag>
    },
    { title: '最后登录', dataIndex: 'lastLoginAt', key: 'lastLoginAt', width: 120,
      render: (d: string) => d ? d.split('T')[0] + ' ' + d.split('T')[1]?.substring(0, 5) : '-' },
    { title: '操作', key: 'action', width: 140,
      render: (_: any, r: User) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Button type="link" size="small" icon={<LockOutlined />} onClick={() => {
            Modal.confirm({
              title: '重置密码',
              content: `确定要重置用户「${r.fullName}」的密码为 123456 吗？`,
              onOk: () => message.success(`用户「${r.fullName}」密码已重置为 123456`),
            });
          }}>重置密码</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>用户管理</Title>
          <Text type="secondary">管理机构和项目成员，配置角色权限</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); form.resetFields(); setModalOpen(true); }}>添加用户</Button>
      </div>

      {/* 按角色统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: '系统管理员', count: users.filter(u => u.roles?.some(r => r.code === 'admin')).length, color: 'red' },
          { label: '项目经理', count: users.filter(u => u.roles?.some(r => r.code === 'pm')).length, color: 'blue' },
          { label: '标注员', count: users.filter(u => u.roles?.some(r => r.code === 'annotator')).length, color: 'green' },
          { label: '审核员', count: users.filter(u => u.roles?.some(r => r.code === 'reviewer')).length, color: 'orange' },
        ].map(item => (
          <Col span={6} key={item.label}>
            <Card size="small" styles={{ body: { textAlign: 'center' } }}>
              <Tag color={item.color} style={{ fontSize: 16, padding: '2px 12px' }}>{item.count}</Tag>
              <br /><Text type="secondary">{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Modal title={editingUser ? '编辑用户' : '添加用户'} open={modalOpen} onOk={() => form.submit()} onCancel={() => { setModalOpen(false); setEditingUser(null); }} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="姓名" name="fullName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="职称" name="title">
                <Select options={titleOptions.map(t => ({ value: t, label: t }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="科室" name="department">
                <Select options={deptOptions.map(d => ({ value: d, label: d }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="邮箱" name="email">
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="角色">
            <Select mode="multiple" placeholder="选择角色" defaultValue={(editingUser?.roles || []).map(r => r.code)} options={[
              { value: 'admin', label: '系统管理员' },
              { value: 'pm', label: '项目经理' },
              { value: 'annotator', label: '标注员' },
              { value: 'reviewer', label: '审核员' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
