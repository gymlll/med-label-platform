import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, message, Modal, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../../services/api';
import { useAppStore } from '../../stores/appStore';
import type { Task, TaskAssignment } from '../../types';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'default', label: '待领取' },
  in_progress: { color: 'processing', label: '标注中' },
  submitted: { color: 'warning', label: '已提交' },
  approved: { color: 'success', label: '已通过' },
  rejected: { color: 'red', label: '已驳回' },
  arbitration: { color: 'purple', label: '仲裁中' },
};

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [detailModal, setDetailModal] = useState<TaskAssignment | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        const [assigns, taskRes] = await Promise.all([
          taskApi.getMyAssignments(),
          taskApi.list(),
        ]);
        setAssignments(assigns);
        setTasks(taskRes.items);
      } catch (err: any) {
        message.error('加载任务失败: ' + err.message);
      }
    };
    load();
  }, [currentUser]);

  const getTaskName = (taskId: number) => tasks.find(t => t.id === taskId)?.name || `任务#${taskId}`;

  const handleClaim = async (assignment: TaskAssignment) => {
    try {
      await taskApi.claimAssignment(assignment.id);
      message.success('任务已认领，请开始标注');
      // 刷新状态
      const assigns = await taskApi.getMyAssignments();
      setAssignments(assigns);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleView = (assignment: TaskAssignment) => {
    setDetailModal(assignment);
  };

  const columns = [
    { title: '任务名称', key: 'taskName', render: (_: any, r: TaskAssignment) => getTaskName(r.taskId), ellipsis: true },
    { title: '数据条目', dataIndex: 'dataItemId', key: 'dataItemId', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s: string) => {
        const st = statusMap[s] || { color: 'default', label: s };
        return <Tag color={st.color}>{st.label}</Tag>;
      }
    },
    { title: '分配时间', dataIndex: 'assignedAt', key: 'assignedAt', width: 120,
      render: (d: string) => d?.split('T')[0] },
    { title: '操作', key: 'action', width: 200,
      render: (_: any, r: TaskAssignment) => (
        <Space>
          {r.status === 'pending' && (
            <Button type="primary" size="small" onClick={() => handleClaim(r)}>认领</Button>
          )}
          {r.status === 'in_progress' && (
            <Button type="primary" size="small" onClick={() => navigate('/annotation/workspace')}>开始标注</Button>
          )}
          {r.status === 'rejected' && (
            <Button size="small" onClick={() => navigate('/annotation/workspace')}>修改</Button>
          )}
          {(r.status === 'submitted' || r.status === 'approved') && (
            <Button size="small" onClick={() => handleView(r)}>查看</Button>
          )}
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>我的任务</Title>
        <Text type="secondary">查看和管理分配给我的标注任务</Text>
      </div>

      {/* 统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size={24}>
          <div><Text type="secondary">待领取</Text><br /><Text strong style={{ fontSize: 20 }}>{assignments.filter(a => a.status === 'pending').length}</Text></div>
          <div><Text type="secondary">标注中</Text><br /><Text strong style={{ fontSize: 20, color: '#1890ff' }}>{assignments.filter(a => a.status === 'in_progress').length}</Text></div>
          <div><Text type="secondary">已提交</Text><br /><Text strong style={{ fontSize: 20, color: '#faad14' }}>{assignments.filter(a => a.status === 'submitted').length}</Text></div>
          <div><Text type="secondary">已通过</Text><br /><Text strong style={{ fontSize: 20, color: '#52c41a' }}>{assignments.filter(a => a.status === 'approved').length}</Text></div>
          <div><Text type="secondary">已驳回</Text><br /><Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>{assignments.filter(a => a.status === 'rejected').length}</Text></div>
        </Space>
      </Card>

      <Card title="任务列表" styles={{ body: { padding: 0 } }}>
        <Table dataSource={assignments} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      {/* 查看详情弹窗 */}
      <Modal title="标注详情" open={!!detailModal} onCancel={() => setDetailModal(null)} footer={[
        <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>
      ]}>
        {detailModal && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="任务名称">{getTaskName(detailModal.taskId)}</Descriptions.Item>
            <Descriptions.Item label="数据条目ID">{detailModal.dataItemId}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[detailModal.status]?.color}>{statusMap[detailModal.status]?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="分配时间">{detailModal.assignedAt}</Descriptions.Item>
            <Descriptions.Item label="开始时间">{detailModal.startedAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{detailModal.submittedAt || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MyTasksPage;
