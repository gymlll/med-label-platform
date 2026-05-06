import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Space, Typography, Input, Select, Modal, Form, Row, Col, message } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '进行中' },
  archived: { color: 'default', label: '已归档' },
  closed: { color: 'red', label: '已关闭' },
};

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.list();
      setProjects(res.items);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    await projectApi.create(values);
    message.success('项目创建成功');
    setModalOpen(false);
    form.resetFields();
    loadProjects();
  };

  const columns = [
    { title: '项目编号', dataIndex: 'code', key: 'code', width: 120 },
    { title: '项目名称', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (n: string, r: Project) => <a onClick={() => navigate(`/projects/${r.id}`)}>{n}</a>
    },
    { title: '研究类型', dataIndex: 'researchType', key: 'researchType', width: 120,
      render: (t: string) => <Tag>{t}</Tag>
    },
    { title: '成员数', dataIndex: 'memberCount', key: 'memberCount', width: 80 },
    { title: '数据集', dataIndex: 'datasetCount', key: 'datasetCount', width: 80 },
    { title: '任务数', dataIndex: 'taskCount', key: 'taskCount', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => {
        const st = statusMap[s] || { color: 'default', label: s };
        return <Tag color={st.color}>{st.label}</Tag>;
      }
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 120,
      render: (d: string) => d?.split('T')[0] },
    { title: '操作', key: 'action', width: 150,
      render: (_: any, record: Project) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/projects/${record.id}`)}>查看</Button>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => navigate(`/tasks?projectId=${record.id}`)}>任务</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>项目管理</Title>
          <Text type="secondary">管理所有医学标注项目</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建项目</Button>
      </div>
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={projects}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      <Modal title="新建项目" open={modalOpen} onOk={() => form.submit()} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="项目编号" name="code" rules={[{ required: true }]}>
                <Input placeholder="如 P2026-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="研究类型" name="researchType" rules={[{ required: true }]}>
                <Select options={[
                  { value: '影像组学', label: '影像组学' },
                  { value: '临床研究', label: '临床研究' },
                  { value: '中医证候', label: '中医证候' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="项目描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
