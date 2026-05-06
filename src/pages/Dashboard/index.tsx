import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Typography, Spin } from 'antd';
import {
  ProjectOutlined, TagsOutlined, CheckCircleOutlined,
  RiseOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '../../services/api';

const { Title, Text } = Typography;

interface Stats {
  activeProjects: number; totalTasks: number; activeTasks: number;
  totalAnnotators: number; totalAnnotations: number;
  passRate: number; avgKappa: number;
}

interface Activity {
  id: number; userId: number; userName: string; action: string;
  target: string; time: string; project: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [taskDist, setTaskDist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, t] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivities(),
          dashboardApi.getTaskDistribution(),
        ]);
        setStats(s);
        setActivities(a);
        setTaskDist(t);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <Spin size="large" />
    </div>
  );

  const taskOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['已完成', '未完成'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: { type: 'category' as const, data: taskDist.map(t => t.name), axisLabel: { rotate: 20, fontSize: 11 } },
    yAxis: { type: 'value' as const },
    series: [
      { name: '已完成', type: 'bar', stack: 'total', barWidth: '60%', data: taskDist.map(t => t.completed), itemStyle: { color: '#52c41a' } },
      { name: '未完成', type: 'bar', stack: 'total', data: taskDist.map(t => t.total - t.completed), itemStyle: { color: '#e8e8e8' } },
    ],
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>工作台</Title>
        <Text type="secondary">欢迎使用医学多模态数据标注平台，以下是项目概览</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card hoverable onClick={() => navigate('/projects')} styles={{ body: { cursor: 'pointer' } }}>
            <Statistic title="进行中项目" value={stats?.activeProjects} prefix={<ProjectOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="总任务数" value={stats?.totalTasks} prefix={<TagsOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="进行中任务" value={stats?.activeTasks} prefix={<RiseOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="标注员" value={stats?.totalAnnotators} prefix={<TeamOutlined style={{ color: '#13c2c2' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="标注记录" value={stats?.totalAnnotations} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card>
            <Statistic title="审核通过率" value={`${Math.round((stats?.passRate || 0) * 100)}%`} prefix={<RiseOutlined style={{ color: '#eb2f96' }} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="各项目标注进度">
            <ReactECharts option={taskOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="质量概览">
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" styles={{ body: { textAlign: 'center' } }}>
                  <Title level={2} style={{ color: '#52c41a', margin: 0 }}>{Math.round((stats?.passRate || 0) * 100)}%</Title>
                  <Text type="secondary">审核通过率</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" styles={{ body: { textAlign: 'center' } }}>
                  <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{stats?.avgKappa}</Title>
                  <Text type="secondary">平均 Kappa 系数</Text>
                </Card>
              </Col>
              <Col span={24} style={{ marginTop: 12 }}>
                <ReactECharts option={{
                  tooltip: { formatter: '{b}: {c}%' },
                  series: [{
                    type: 'gauge', center: ['50%', '60%'], radius: '70%',
                    startAngle: 200, endAngle: -20,
                    min: 0, max: 100,
                    axisLine: { lineStyle: { width: 12, color: [[0.85, '#52c41a'], [1, '#ff4d4f']] } },
                    axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
                    detail: { formatter: '{value}%', fontSize: 24, color: '#52c41a', offsetCenter: [0, '60%'] },
                    data: [{ value: Math.round((stats?.passRate || 0) * 100), name: '通过率' }],
                  }]
                }} style={{ height: 200 }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="最近动态" styles={{ body: { padding: 0 } }}>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {activities.map((item) => (
                <div key={item.id} style={{
                  padding: '10px 16px', borderBottom: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {item.userName[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>
                      <Text strong>{item.userName}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>{item.action}</Text>
                      <Tag style={{ marginLeft: 8 }} color="blue">{item.target}</Tag>
                    </div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>{item.project} · {item.time}</Text></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="快捷操作">
            <Row gutter={[12, 12]}>
              {[
                { title: '创建标注任务', desc: '发布新的标注任务', key: '/tasks', icon: '📋' },
                { title: '数据集上传', desc: '上传医学影像数据', key: '/datasets', icon: '📤' },
                { title: '质量监控面板', desc: '查看标注质量指标', key: '/quality', icon: '📊' },
                { title: 'AI 模型配置', desc: '管理AI辅助标注', key: '/annotation/ai-models', icon: '🤖' },
              ].map((item) => (
                <Col span={12} key={item.key}>
                  <Card size="small" hoverable onClick={() => navigate(item.key)} styles={{ body: { padding: 12, cursor: 'pointer' } }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                    <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
