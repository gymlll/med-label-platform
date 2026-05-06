import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Row, Col, Select, Progress, Tooltip } from 'antd';
import { DownloadOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { qualityApi } from '../../services/api';
import ReactECharts from 'echarts-for-react';
import { message } from 'antd';

const { Title, Text } = Typography;

const QualityPage: React.FC = () => {
  const [kappaData, setKappaData] = useState<any>(null);

  useEffect(() => {
    qualityApi.getKappaMatrix(1).then(setKappaData);
  }, []);

  // Kappa 矩阵热力图
  const kappaOption = kappaData ? {
    tooltip: { position: 'top' },
    grid: { left: 80, bottom: 60, top: 10 },
    xAxis: { type: 'category', data: kappaData.annotators, axisLabel: { rotate: 20 } },
    yAxis: { type: 'category', data: [...kappaData.annotators].reverse() },
    visualMap: { min: 0, max: 1, calculable: true, inRange: { color: ['#f0f5ff', '#1890ff', '#0050b3'] } },
    series: [{
      type: 'heatmap',
      data: kappaData.matrix.flatMap((row: number[], i: number) =>
        row.map((v: number, j: number) => [j, kappaData.annotators.length - 1 - i, +v.toFixed(2)])
      ),
      label: { show: true, formatter: (p: any) => p.value[2].toFixed(2) },
      emphasis: { itemStyle: { shadowBlur: 10 } },
    }],
  } : {};

  // IoU 分布
  const iouOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['0-0.5', '0.5-0.6', '0.6-0.7', '0.7-0.8', '0.8-0.9', '0.9-1.0'] },
    yAxis: { type: 'value', name: '样本数' },
    series: [{
      type: 'bar', data: [15, 28, 65, 120, 85, 37],
      itemStyle: { color: '#1890ff' },
    }],
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>质量监控</Title>
          <Text type="secondary">实时监控标注质量，快速定位偏差</Text>
        </div>
        <Space>
          <Select defaultValue={1} style={{ width: 200 }}
            options={[{ value: 1, label: '肺结节CT影像标注项目' }, { value: 2, label: '病理WSI肿瘤分级标注' }, { value: 3, label: '中医舌诊图像数据集构建' }]} />
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>刷新</Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.success('质量报告已生成，正在下载')}>导出报告</Button>
        </Space>
      </div>

      {/* 概览卡片 */}
      <Row gutter={[16, 16]}>
        {[
          { label: '平均Kappa', value: '0.78', color: '#1890ff' },
          { label: '平均IoU', value: '0.76', color: '#722ed1' },
          { label: '审核通过率', value: '85%', color: '#52c41a' },
          { label: '平均标注耗时', value: '185s/条', color: '#fa8c16' },
          { label: '仲裁率', value: '12%', color: '#eb2f96' },
          { label: '活跃标注员', value: '12', color: '#13c2c2' },
        ].map(item => (
          <Col span={4} key={item.label}>
            <Card size="small" styles={{ body: { textAlign: 'center' } }}>
              <Title level={4} style={{ margin: 0, color: item.color }}>{item.value}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="标注员Kappa一致性矩阵" styles={{ body: { padding: '12px' } }}>
            {kappaData && <ReactECharts option={kappaOption} style={{ height: 320 }} />}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="IoU 分布" styles={{ body: { padding: '12px' } }}>
            <ReactECharts option={iouOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="标注员质量排行" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={[
                { rank: 1, name: '李雪梅', department: '病理科', completed: 320, passRate: 94.2, avgKappa: 0.85, avgTime: 145, disputes: 3 },
                { rank: 2, name: '陈思雨', department: '放射科', completed: 280, passRate: 91.5, avgKappa: 0.82, avgTime: 162, disputes: 5 },
                { rank: 3, name: '刘博文', department: '病理科', completed: 195, passRate: 88.7, avgKappa: 0.79, avgTime: 178, disputes: 7 },
                { rank: 4, name: '孙明华', department: '中医科', completed: 150, passRate: 85.3, avgKappa: 0.75, avgTime: 195, disputes: 9 },
              ]}
              columns={[
                { title: '排名', dataIndex: 'rank', key: 'rank', width: 60,
                  render: (v: number) => <span style={{ color: ['#f50', '#fa0', '#1890ff', '#888'][v - 1] || '#888', fontWeight: 600 }}>#{v}</span> },
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '科室', dataIndex: 'department', key: 'department' },
                { title: '完成量', dataIndex: 'completed', key: 'completed' },
                { title: '通过率', dataIndex: 'passRate', key: 'passRate', render: (v: number) => <Progress percent={v} size="small" status={v >= 90 ? 'success' : v >= 80 ? 'active' : 'exception'} /> },
                { title: 'Kappa', dataIndex: 'avgKappa', key: 'avgKappa', render: (v: number) => <Tag color={v >= 0.8 ? 'green' : v >= 0.7 ? 'orange' : 'red'}>{v.toFixed(2)}</Tag> },
                { title: '平均耗时(s)', dataIndex: 'avgTime', key: 'avgTime' },
                { title: '争议数', dataIndex: 'disputes', key: 'disputes', render: (v: number) => v > 5 ? <span><WarningOutlined style={{ color: '#faad14' }} /> {v}</span> : v },
              ]}
              rowKey="rank" size="middle" pagination={false} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="高频分歧标签">
            {[
              { label: '磨玻璃结节', count: 23, percent: 18 },
              { label: '部分实性结节', count: 18, percent: 14 },
              { label: '胸膜增厚', count: 12, percent: 9 },
              { label: '淋巴结转移', count: 8, percent: 6 },
              { label: '良性钙化', count: 6, percent: 5 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: '#999' }}>{item.count}次 ({item.percent}%)</span>
                </div>
                <Progress percent={item.percent * 5} size="small" showInfo={false} strokeColor="#ff4d4f" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default QualityPage;
