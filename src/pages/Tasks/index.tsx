import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Typography, Button, Space, Progress, Modal, Form, Input, Select, Row, Col, DatePicker, message, Tabs, Descriptions } from 'antd';
import { PlusOutlined, PlayCircleOutlined, EyeOutlined, ToolOutlined, InfoCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskApi, projectApi, datasetApi } from '../../services/api';
import type { Task, Project, Dataset } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'cyan', label: '已发布' },
  in_progress: { color: 'processing', label: '进行中' },
  under_review: { color: 'warning', label: '审核中' },
  accepted: { color: 'success', label: '已完成' },
  terminated: { color: 'red', label: '已终止' },
};

const taskTypeMap: Record<string, string> = {
  normal: '普通', parallel: '并行', sequential: '序贯',
};

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<Task | null>(null);
  const [publishModal, setPublishModal] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const [taskRes, projRes] = await Promise.all([
        taskApi.list(projectIdParam ? Number(projectIdParam) : undefined, { status }),
        projectApi.list(),
      ]);
      setTasks(taskRes.items);
      setProjects(projRes.items);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await taskApi.create({
        ...values,
        projectId: Number(values.projectId),
        datasetId: Number(values.datasetId),
        deadline: values.deadline?.toISOString(),
        totalItems: Number(values.totalItems) || 0,
      });
      message.success('任务创建成功');
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handlePublish = async (task: Task) => {
    try {
      await taskApi.publish(task.id);
      message.success(`任务「${task.name}」已发布`);
      setPublishModal(null);
      loadData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleTerminate = async (task: Task) => {
    Modal.confirm({
      title: '终止任务',
      content: `确定要终止任务「${task.name}」吗？此操作不可撤销。`,
      okText: '确定终止',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await taskApi.terminate(task.id);
          message.success('任务已终止');
          loadData();
        } catch (err: any) {
          message.error(err.message);
        }
      },
    });
  };

  const handleProjectChange = async (projectId: number) => {
    try {
      const res = await datasetApi.list(projectId);
      setDatasets(res.items);
    } catch {
      setDatasets([]);
    }
  };

  const getProgress = (task: Task) => {
    const done = task.progress.approved + task.progress.submitted;
    const total = task.totalItems;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (n: string, r: Task) => <a onClick={() => setDetailModal(r)}>{n}</a>
    },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80,
      render: (t: string) => <Tag>{taskTypeMap[t] || t}</Tag> },
    { title: '数据集', dataIndex: 'datasetName', key: 'datasetName', ellipsis: true, width: 150 },
    { title: '标注员', dataIndex: 'annotatorCount', key: 'annotatorCount', width: 70 },
    { title: '总条数', dataIndex: 'totalItems', key: 'totalItems', width: 70 },
    { title: '进度', key: 'progress', width: 180,
      render: (_: any, r: Task) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={getProgress(r)} size="small" style={{ flex: 1, margin: 0 }} />
          <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            {r.progress.approved + r.progress.submitted}/{r.totalItems}
          </Text>
        </div>
      )
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => {
        const st = statusMap[s] || { color: 'default', label: s };
        return <Tag color={st.color}>{st.label}</Tag>;
      }
    },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline', width: 110,
      render: (d: string) => d ? d.split('T')[0] : '-' },
    { title: '操作', key: 'action', width: 200,
      render: (_: any, r: Task) => (
        <Space>
          {r.status === 'draft' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => setPublishModal(r)}>
              发布
            </Button>
          )}
          {r.status === 'in_progress' && (
            <Button type="link" size="small" icon={<ToolOutlined />} onClick={() => navigate('/annotation/workspace')}>
              标注
            </Button>
          )}
          {r.status === 'under_review' && (
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate('/review')}>
              审核
            </Button>
          )}
          {(r.status === 'published' || r.status === 'accepted') && (
            <Button type="link" size="small" icon={<InfoCircleOutlined />} onClick={() => setDetailModal(r)}>
              详情
            </Button>
          )}
          {(r.status === 'in_progress' || r.status === 'published') && (
            <Button type="link" size="small" danger icon={<StopOutlined />} onClick={() => handleTerminate(r)}>
              终止
            </Button>
          )}
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>标注任务管理</Title>
          <Text type="secondary">创建、分配与跟踪标注任务进度</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setDatasets([]); setModalOpen(true); }}>创建任务</Button>
      </div>

      <Card styles={{ body: { padding: 0 } }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ margin: '0 16px' }}
          items={[
            { key: 'all', label: '全部' }, { key: 'draft', label: '草稿' },
            { key: 'published', label: '已发布' }, { key: 'in_progress', label: '进行中' },
            { key: 'under_review', label: '审核中' }, { key: 'accepted', label: '已完成' },
          ]}
        />
        <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} size="middle" />
      </Card>

      {/* 创建任务弹窗 */}
      <Modal title="创建标注任务" open={modalOpen} onOk={() => form.submit()} onCancel={() => setModalOpen(false)} width={640}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="任务名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属项目" name="projectId" rules={[{ required: true }]}>
                <Select placeholder="选择项目" onChange={handleProjectChange}
                  options={projects.map(p => ({ value: p.id, label: p.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="关联数据集" name="datasetId" rules={[{ required: true }]}>
                <Select placeholder="选择数据集"
                  options={datasets.map(d => ({ value: d.id, label: d.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="任务类型" name="type" initialValue="normal">
                <Select options={[
                  { value: 'normal', label: '普通标注' },
                  { value: 'parallel', label: '并行协同' },
                  { value: 'sequential', label: '序贯审核' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止日期" name="deadline">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="总数据量" name="totalItems">
                <Input type="number" placeholder="数据条目数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="AI辅助标注" name="aiAssistEnabled" valuePropName="checked" initialValue={false}>
                <Select options={[{ value: true, label: '启用' }, { value: false, label: '不启用' }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 发布确认弹窗 */}
      <Modal title="发布任务" open={!!publishModal} onOk={() => publishModal && handlePublish(publishModal)}
        onCancel={() => setPublishModal(null)} okText="确认发布" cancelText="取消">
        {publishModal && (
          <div>
            <p>确定要发布任务 <Text strong>「{publishModal.name}」</Text> 吗？</p>
            <p>发布后，标注员将可以看到并认领该任务的标注条目。</p>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="数据集">{publishModal.datasetName}</Descriptions.Item>
              <Descriptions.Item label="总条目">{publishModal.totalItems}</Descriptions.Item>
              <Descriptions.Item label="标注员数">{publishModal.annotatorCount}</Descriptions.Item>
              <Descriptions.Item label="AI辅助">{publishModal.aiAssistEnabled ? '启用' : '不启用'}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 任务详情弹窗 */}
      <Modal title="任务详情" open={!!detailModal} onCancel={() => setDetailModal(null)} footer={[
        <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>
      ]} width={600}>
        {detailModal && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="任务名称" span={2}>{detailModal.name}</Descriptions.Item>
            <Descriptions.Item label="类型">{taskTypeMap[detailModal.type] || detailModal.type}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[detailModal.status]?.color}>{statusMap[detailModal.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="数据集">{detailModal.datasetName}</Descriptions.Item>
            <Descriptions.Item label="标注员数">{detailModal.annotatorCount}</Descriptions.Item>
            <Descriptions.Item label="总条数">{detailModal.totalItems}</Descriptions.Item>
            <Descriptions.Item label="已提交">{detailModal.progress.submitted}</Descriptions.Item>
            <Descriptions.Item label="已通过">{detailModal.progress.approved}</Descriptions.Item>
            <Descriptions.Item label="已驳回">{detailModal.progress.rejected}</Descriptions.Item>
            <Descriptions.Item label="AI辅助">{detailModal.aiAssistEnabled ? '启用' : '不启用'}</Descriptions.Item>
            <Descriptions.Item label="盲法">{detailModal.blindModeEnabled ? '启用' : '不启用'}</Descriptions.Item>
            <Descriptions.Item label="TSA时间戳">{detailModal.tsaEnabled ? '启用' : '不启用'}</Descriptions.Item>
            <Descriptions.Item label="截止日期">{detailModal.deadline?.split('T')[0] || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailModal.createdAt?.split('T')[0]}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TasksPage;
