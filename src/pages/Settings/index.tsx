import React, { useState } from 'react';
import { Card, Form, Input, Select, Switch, Button, Typography, Space, Divider, message, Tabs, InputNumber, Tag, Alert } from 'antd';
import { SaveOutlined, SafetyCertificateOutlined, ExperimentOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      message.success('设置已保存');
    }, 500);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>系统设置</Title>
        <Text type="secondary">配置系统参数、安全策略与集成服务</Text>
      </div>

      <Tabs
        items={[
          {
            key: 'basic',
            label: <span><ExperimentOutlined /> 基本设置</span>,
            children: (
              <Card>
                <Form layout="vertical" style={{ maxWidth: 600 }}>
                  <Form.Item label="平台名称">
                    <Input defaultValue="医学多模态数据标注平台" />
                  </Form.Item>
                  <Form.Item label="默认语言">
                    <Select defaultValue="zh-CN" options={[{ value: 'zh-CN', label: '简体中文' }, { value: 'en', label: 'English' }]} />
                  </Form.Item>
                  <Form.Item label="数据存储路径">
                    <Input defaultValue="/data/med-label" />
                  </Form.Item>
                  <Form.Item label="标注文件临时保留天数">
                    <InputNumber defaultValue={30} min={1} max={365} />
                  </Form.Item>
                  <Form.Item label="允许同时标注数量上限">
                    <InputNumber defaultValue={50} min={1} max={1000} />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>保存设置</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'security',
            label: <span><SafetyCertificateOutlined /> 安全策略</span>,
            children: (
              <Card>
                <Form layout="vertical" style={{ maxWidth: 600 }}>
                  <Form.Item label="密码策略" extra="至少包含大小写字母和数字，长度不少于8位">
                    <Select defaultValue="strong" options={[
                      { value: 'weak', label: '基本（仅长度≥6）' },
                      { value: 'medium', label: '中等（长度≥8，字母+数字）' },
                      { value: 'strong', label: '强（大小写+数字+特殊字符，长度≥10）' },
                    ]} />
                  </Form.Item>
                  <Form.Item label="会话超时时间（分钟）">
                    <InputNumber defaultValue={120} min={5} max={1440} />
                  </Form.Item>
                  <Form.Item label="登录失败锁定阈值">
                    <InputNumber defaultValue={5} min={3} max={20} addonAfter="次" />
                  </Form.Item>
                  <Form.Item label="数据脱敏" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item label="启用审计日志哈希链" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item label="TSA 时间戳服务" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>保存设置</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'integration',
            label: <span><ApiOutlined /> 集成配置</span>,
            children: (
              <Card>
                <Form layout="vertical" style={{ maxWidth: 600 }}>
                  <Form.Item label="Triton 推理服务地址">
                    <Input defaultValue="http://triton-inference:8001" placeholder="http://triton-inference:8001" />
                  </Form.Item>
                  <Form.Item label="MinIO 对象存储端点">
                    <Input defaultValue="https://minio.hospital.cn:9000" />
                  </Form.Item>
                  <Form.Item label="ClickHouse 审计库地址">
                    <Input defaultValue="clickhouse://audit:8123/audit_logs" />
                  </Form.Item>
                  <Form.Item label="Redis 缓存地址">
                    <Input defaultValue="redis://localhost:6379/0" />
                  </Form.Item>
                  <Form.Item label="DICOM 服务地址">
                    <Input defaultValue="dicom://pacs.hospital.cn:11112" />
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>保存设置</Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'compliance',
            label: <span><SafetyCertificateOutlined /> 合规配置</span>,
            children: (
              <Card>
                <Alert
                  title="合规配置直接影响医疗器械注册审查结果"
                  description="以下配置项请根据实际认证需求设置，修改后建议由合规负责人确认。"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Form layout="vertical" style={{ maxWidth: 600 }}>
                  <Form.Item label="合规标准">
                    <Select defaultValue="nmpa" mode="multiple" options={[
                      { value: 'nmpa', label: 'NMPA 医疗器械软件注册审查' },
                      { value: 'fda', label: 'FDA 21 CFR Part 11' },
                      { value: 'dengbao', label: '等保三级' },
                      { value: 'hipaa', label: 'HIPAA' },
                    ]} />
                  </Form.Item>
                  <Form.Item label="审计日志保留期限（天）">
                    <InputNumber defaultValue={3650} min={180} max={36500} addonAfter="天" />
                  </Form.Item>
                  <Form.Item label="关键节点TSA签名" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item label="导出审计报告包含验证脚本" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Divider />
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>当前合规状态</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>哈希链完整性</span><Tag color="success">已启用</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TSA 时间戳</span><Tag color="success">已配置</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>数据脱敏</span><Tag color="success">已启用</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>操作追溯</span><Tag color="success">100% 覆盖</Tag>
                    </div>
                  </Space>
                  <Divider />
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>保存配置</Button>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
