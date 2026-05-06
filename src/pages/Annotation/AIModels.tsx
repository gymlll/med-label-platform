import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Row, Col, Divider, Descriptions, Modal } from 'antd';
import { PlusOutlined, ExperimentOutlined, ReloadOutlined } from '@ant-design/icons';
import { aiApi } from '../../services/api';
import ReactECharts from 'echarts-for-react';
import type { AIModel } from '../../types';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  shadow: { color: 'cyan', label: '灰度' },
  production: { color: 'green', label: '生产' },
  deprecated: { color: 'red', label: '已弃用' },
};

const AIModelsPage: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<AIModel | null>(null);

  useEffect(() => { loadModels(); }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await aiApi.listModels();
      setModels(res);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '模型名称', dataIndex: 'name', key: 'name' },
    { title: '模态', dataIndex: 'modality', key: 'modality', width: 100,
      render: (m: string) => <Tag>{m}</Tag> },
    { title: '任务类型', dataIndex: 'taskType', key: 'taskType', width: 120,
      render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => {
        const st = statusMap[s] || { color: 'default', label: s };
        return <Tag color={st.color}>{st.label}</Tag>;
      }
    },
    { title: '默认置信度', dataIndex: 'confidenceDefault', key: 'confidenceDefault', width: 100,
      render: (v: number) => <span>{Math.round(v * 100)}%</span> },
    { title: '性能指标', key: 'perf', width: 200,
      render: (_: any, r: AIModel) => (
        <Space size={12}>
          {Object.entries(r.perfMetrics).map(([k, v]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{(v * 100).toFixed(1)}%</div>
              <div style={{ fontSize: 10, color: '#999' }}>{k}</div>
            </div>
          ))}
        </Space>
      )
    },
    { title: '操作', key: 'action', width: 120,
      render: (_: any, r: AIModel) => (
        <Space>
          <Button type="link" size="small" onClick={() => setDetailModal(r)}>详情</Button>
          <Button type="link" size="small">{r.status === 'shadow' ? '上线' : '配置'}</Button>
        </Space>
      )
    },
  ];

  const perfOption = (m: AIModel) => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 10, top: 20, bottom: 20 },
    xAxis: { type: 'category', data: Object.keys(m.perfMetrics) },
    yAxis: { type: 'value', min: 0, max: 1 },
    series: [{ type: 'bar', data: Object.values(m.perfMetrics), itemStyle: { color: '#1890ff' } }],
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>AI 模型管理</Title>
          <Text type="secondary">管理AI辅助标注模型，配置预标注服务</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadModels}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />}>注册模型</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="已注册模型" styles={{ body: { padding: 0 } }}>
            <Table dataSource={models} columns={columns} rowKey="id" loading={loading} pagination={false} size="middle" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="AI 标注效果">
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>76.5%</Title>
              <Text type="secondary">AI 预标注接受率</Text>
            </div>
            <Divider />
            <div style={{ padding: '0 8px' }}>
              {[
                { label: '平均编辑距离', value: 0.12, suffix: '' },
                { label: '预标注响应时间 P95', value: 2.3, suffix: 's' },
                { label: '净效率提升', value: 35, suffix: '%' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">{item.label}</Text>
                  <Text strong>{item.value}{item.suffix}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title={detailModal?.name} open={!!detailModal} onCancel={() => setDetailModal(null)} footer={null} width={600}>
        {detailModal && (
          <div>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="模型名称">{detailModal.name}</Descriptions.Item>
              <Descriptions.Item label="版本">{detailModal.version}</Descriptions.Item>
              <Descriptions.Item label="模态">{detailModal.modality}</Descriptions.Item>
              <Descriptions.Item label="任务类型">{detailModal.taskType}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[detailModal.status]?.color}>{statusMap[detailModal.status]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="默认置信度">{Math.round(detailModal.confidenceDefault * 100)}%</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <Text strong>性能指标</Text>
              <ReactECharts option={perfOption(detailModal)} style={{ height: 200 }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIModelsPage;
