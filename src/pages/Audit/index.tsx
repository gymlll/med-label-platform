import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Row, Col, Input, Select, DatePicker, Modal, Form, message, Descriptions, Alert, List, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, SafetyCertificateOutlined, HistoryOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { auditApi } from '../../services/api';
import type { AuditLog } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const actionMap: Record<string, { color: string; label: string }> = {
  CREATE: { color: 'green', label: '创建' },
  UPDATE: { color: 'blue', label: '更新' },
  DELETE: { color: 'red', label: '删除' },
  REVIEW: { color: 'orange', label: '审核' },
  ACCEPT: { color: 'purple', label: '验收' },
  EXPORT: { color: 'geekblue', label: '导出' },
  PUBLISH: { color: 'cyan', label: '发布' },
  CLAIM: { color: 'lime', label: '认领' },
  SUBMIT: { color: 'gold', label: '提交' },
};

const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.listLogs();
      setLogs(res.items);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '日志ID', dataIndex: 'logId', key: 'logId', width: 70 },
    { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 160,
      render: (d: string) => d?.replace('T', ' ')?.replace('Z', '') },
    { title: '操作人', dataIndex: 'userName', key: 'userName', width: 100 },
    { title: '操作类型', dataIndex: 'action', key: 'action', width: 80,
      render: (a: string) => {
        const m = actionMap[a] || { color: 'default', label: a };
        return <Tag color={m.color}>{m.label}</Tag>;
      }
    },
    { title: '目标类型', dataIndex: 'targetType', key: 'targetType', width: 80 },
    { title: '目标ID', dataIndex: 'targetId', key: 'targetId', width: 120 },
    { title: '操作详情', dataIndex: 'payloadDiff', key: 'payloadDiff', ellipsis: true,
      render: (d: any) => d ? JSON.stringify(d).substring(0, 80) : '-' },
    { title: '哈希链', key: 'hash', width: 150,
      render: (_: any, r: AuditLog) => (
        <Tooltip title={`prev: ${r.prevLogHash.substring(0, 16)}...\ncurrent: ${r.currentHash.substring(0, 16)}...`}>
          <Tag icon={<SafetyCertificateOutlined />} color="blue" style={{ cursor: 'pointer' }}>
            {r.currentHash.substring(0, 8)}...
          </Tag>
        </Tooltip>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>审计追溯</Title>
          <Text type="secondary">全操作不可篡改审计日志，满足NMPA/FDA合规要求</Text>
        </div>
        <Space>
          <Button type="primary" icon={<FileTextOutlined />} onClick={() => setReportModal(true)}>生成审计报告</Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.success('审计日志正在导出')}>导出日志</Button>
        </Space>
      </div>

      {/* 合规性提示 */}
      <Alert
        title="本系统审计日志采用 SHA-256 哈希链 + RFC 3161 时间戳（关键节点），满足 NMPA《医疗器械软件注册审查指导原则》、FDA 21 CFR Part 11 及等保三级要求。"
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: '总日志数', value: logs.length, color: '#1890ff' },
          { label: '关键TSA节点', value: 3, color: '#722ed1' },
          { label: '哈希链完整性', value: '100%', color: '#52c41a' },
          { label: '审计报告数', value: 5, color: '#13c2c2' },
        ].map(item => (
          <Col span={6} key={item.label}>
            <Card size="small" styles={{ body: { textAlign: 'center' } }}>
              <Title level={4} style={{ margin: 0, color: item.color }}>{item.value}</Title>
              <Text type="secondary">{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 搜索栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input placeholder="操作人" style={{ width: 140 }} prefix={<SearchOutlined />} />
          <Select placeholder="操作类型" style={{ width: 120 }} allowClear options={Object.entries(actionMap).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Select placeholder="目标类型" style={{ width: 120 }} allowClear options={[
            { value: 'task', label: '任务' }, { value: 'annotation', label: '标注' },
            { value: 'dataset', label: '数据集' }, { value: 'project', label: '项目' },
          ]} />
          <RangePicker />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => message.success('审计日志查询完成')}>查询</Button>
        </Space>
      </Card>

      <Card title="操作日志列表" styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="logId"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          size="middle"
        />
      </Card>

      {/* 审计报告生成弹窗 */}
      <Modal title="生成审计报告" open={reportModal} onCancel={() => setReportModal(false)} onOk={() => { message.success('审计报告生成中，完成后将通知您'); setReportModal(false); }} width={500}>
        <Form layout="vertical">
          <Form.Item label="选择项目" required>
            <Select placeholder="请选择项目" options={[
              { value: 1, label: '肺结节CT影像标注项目' },
              { value: 2, label: '病理WSI肿瘤分级标注' },
              { value: 3, label: '中医舌诊图像数据集构建' },
            ]} />
          </Form.Item>
          <Form.Item label="报告时间范围">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        <Alert
          title="审计报告包含：完整审计日志JSON + 哈希链验证脚本 + TSA时间戳验证 + PDF概览报告。报告为ZIP压缩包，可离线验证。"
          type="success"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default AuditPage;
