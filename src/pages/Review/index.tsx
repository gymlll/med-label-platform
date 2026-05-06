import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Progress, Tabs, Descriptions, Input, Form, Select, Modal, message, Row, Col, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { reviewApi, taskApi } from '../../services/api';
import type { ReviewRecord, Task } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReviewPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<Task | null>(null);
  const [passModal, setPassModal] = useState<{ task: Task; record: any } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ task: Task; record: any } | null>(null);
  const [rejectForm] = Form.useForm();
  const [form] = Form.useForm();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const taskRes = await taskApi.list();
      setTasks(taskRes.items);
    } finally {
      setLoading(false);
    }
  };

  const tasksUnderReview = tasks.filter(t => t.status === 'under_review');

  const handleBatchApprove = async (values: any) => {
    message.success('批量审核通过完成（共 3 条）');
    setReviewModal(null);
    form.resetFields();
  };

  const handlePass = (task: Task, record: any) => {
    setPassModal({ task, record });
  };

  const confirmPass = async () => {
    if (!passModal) return;
    try {
      await reviewApi.create({
        annotationId: passModal.record.id,
        decision: 'approved',
        comments: '审核通过',
      });
      message.success(`标注 ${passModal.record.dataItem} 审核通过`);
      setPassModal(null);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleReject = (task: Task, record: any) => {
    setRejectModal({ task, record });
  };

  const confirmReject = async (values: any) => {
    if (!rejectModal) return;
    try {
      await reviewApi.create({
        annotationId: rejectModal.record.id,
        decision: 'rejected',
        comments: values.comments,
      });
      message.success(`标注 ${rejectModal.record.dataItem} 已驳回`);
      setRejectModal(null);
      rejectForm.resetFields();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleView = (record: any) => {
    message.info(`查看标注: ${record.dataItem}`);
  };

  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80,
      render: (t: string) => <Tag>{t === 'normal' ? '普通' : t === 'parallel' ? '并行' : '序贯'}</Tag> },
    { title: '总条数', dataIndex: 'totalItems', key: 'totalItems', width: 70 },
    { title: '进度', key: 'progress', width: 250,
      render: (_: any, r: Task) => (
        <Space size="small">
          <Tag color="success">通过 {r.progress.approved}</Tag>
          <Tag color="error">驳回 {r.progress.rejected}</Tag>
          <Tag color="warning">待审 {Math.max(0, r.progress.submitted - r.progress.approved - r.progress.rejected)}</Tag>
        </Space>
      )
    },
    { title: '通过率', key: 'passRate', width: 100,
      render: (_: any, r: Task) => {
        const total = r.progress.approved + r.progress.rejected;
        const rate = total > 0 ? Math.round((r.progress.approved / total) * 100) : 0;
        return <span style={{ color: rate >= 80 ? '#52c41a' : '#faad14', fontWeight: 600 }}>{rate}%</span>;
      }
    },
    { title: '操作', key: 'action', width: 120,
      render: (_: any, r: Task) => (
        <Button type="primary" size="small" icon={<CheckCircleOutlined />}
          onClick={() => setReviewModal(r)}>审核</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>审核管理</Title>
          <Text type="secondary">对标注结果进行审核、驳回或直接修改</Text>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => message.info('导出审核报告')}>导出报告</Button>
        </Space>
      </div>

      {/* 待审概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: '待审核任务', value: tasksUnderReview.length, color: '#1890ff' },
          { label: '待审条目', value: tasksUnderReview.reduce((s, t) => s + Math.max(0, t.progress.submitted - t.progress.approved - t.progress.rejected), 0), color: '#faad14' },
          { label: '总审核通过', value: tasks.reduce((s, t) => s + (t.progress.approved || 0), 0), color: '#52c41a' },
          { label: '总驳回', value: tasks.reduce((s, t) => s + (t.progress.rejected || 0), 0), color: '#ff4d4f' },
        ].map(item => (
          <Col span={6} key={item.label}>
            <Card size="small" styles={{ body: { textAlign: 'center' } }}>
              <Title level={3} style={{ margin: 0, color: item.color }}>{item.value}</Title>
              <Text type="secondary">{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="待审核任务" styles={{ body: { padding: 0 } }}>
        <Table dataSource={tasksUnderReview} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      {/* 审核弹窗 */}
      <Modal title={`审核：${reviewModal?.name || ''}`} open={!!reviewModal} onCancel={() => setReviewModal(null)} footer={null} width={700}>
        {reviewModal && (
          <div>
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="任务">{reviewModal.name}</Descriptions.Item>
              <Descriptions.Item label="数据集">{reviewModal.datasetName}</Descriptions.Item>
              <Descriptions.Item label="待审数量">{Math.max(0, reviewModal.progress.submitted - reviewModal.progress.approved - reviewModal.progress.rejected)}</Descriptions.Item>
              <Descriptions.Item label="已通过">{reviewModal.progress.approved}</Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={[
                { id: 1, dataItem: 'CT_001001.dcm', annotator: '李雪梅', submitted: '2026-04-28', status: '待审' },
                { id: 2, dataItem: 'CT_001002.dcm', annotator: '陈思雨', submitted: '2026-04-28', status: '待审' },
                { id: 3, dataItem: 'CT_001003.dcm', annotator: '李雪梅', submitted: '2026-04-27', status: '待审' },
              ]}
              columns={[
                { title: '数据', dataIndex: 'dataItem', key: 'dataItem' },
                { title: '标注员', dataIndex: 'annotator', key: 'annotator' },
                { title: '提交时间', dataIndex: 'submitted', key: 'submitted' },
                { title: '操作', key: 'action', render: (_: any, record: any) => (
                  <Space>
                    <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
                    <Button type="link" size="small" icon={<CheckCircleOutlined />} style={{ color: '#52c41a' }}
                      onClick={() => handlePass(reviewModal, record)}>通过</Button>
                    <Button type="link" size="small" icon={<CloseCircleOutlined />} style={{ color: '#ff4d4f' }}
                      onClick={() => handleReject(reviewModal, record)}>驳回</Button>
                  </Space>
                )},
              ]}
              rowKey="id" size="small" pagination={false}
            />

            <Divider style={{ margin: '12px 0' }} />

            <Form form={form} layout="vertical" onFinish={handleBatchApprove}>
              <Form.Item label="批量审核意见" name="comments">
                <TextArea rows={3} placeholder="输入批量审核意见（可选）" />
              </Form.Item>
              <Form.Item>
                <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={() => setReviewModal(null)}>取消</Button>
                  <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>批量通过</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 驳回弹窗 */}
      <Modal title="驳回标注" open={!!rejectModal} onCancel={() => setRejectModal(null)} onOk={() => rejectForm.submit()} okText="确认驳回" okButtonProps={{ danger: true }}>
        {rejectModal && (
          <div>
            <p>确定要驳回 <Text strong>{rejectModal.record.dataItem}</Text> 的标注结果？</p>
            <Form form={rejectForm} layout="vertical" onFinish={confirmReject}>
              <Form.Item label="驳回理由" name="comments" rules={[{ required: true, message: '请输入驳回理由' }]}>
                <TextArea rows={3} placeholder="请说明驳回原因，供标注员修改参考..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewPage;
