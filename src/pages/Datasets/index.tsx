import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Typography, Button, Space, Select, Modal, Form, Input, Row, Col, message, Descriptions, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, LinkOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import { datasetApi, projectApi } from '../../services/api';
import type { Dataset, Project } from '../../types';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const modalityMap: Record<string, { color: string; label: string }> = {
  ct: { color: 'blue', label: 'CT' }, mri: { color: 'purple', label: 'MRI' },
  dr: { color: 'cyan', label: 'DR' }, us: { color: 'orange', label: '超声' },
  wsi: { color: 'magenta', label: '病理WSI' }, tongue: { color: 'red', label: '舌诊' },
  fundus: { color: 'green', label: '眼底' }, text: { color: 'geekblue', label: '文本' },
  video: { color: 'lime', label: '视频' }, endoscopy: { color: 'gold', label: '内镜' },
  pulse: { color: 'volcano', label: '脉诊' },
};

const formatSize = (bytes: number) => {
  if (bytes >= 1024 ** 4) return (bytes / 1024 ** 4).toFixed(1) + 'TB';
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + 'GB';
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + 'MB';
  return (bytes / 1024).toFixed(1) + 'KB';
};

const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [uploadModal, setUploadModal] = useState<Dataset | null>(null);
  const [previewModal, setPreviewModal] = useState<Dataset | null>(null);
  const [detailModal, setDetailModal] = useState<Dataset | null>(null);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dsRes, projRes] = await Promise.all([datasetApi.list(), projectApi.list()]);
      setDatasets(dsRes.items);
      setProjects(projRes.items);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await datasetApi.create({
        ...values,
        projectId: Number(values.projectId),
        itemCount: 0,
        totalSize: 0,
      });
      message.success('数据集创建成功');
      setCreateModal(false);
      form.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleUpload = async (dataset: Dataset) => {
    message.success(`文件上传任务已创建，开始上传到数据集「${dataset.name}」`);
    setUploadModal(null);
  };

  const columns = [
    { title: '数据集名称', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (n: string, r: Dataset) => <a onClick={() => setDetailModal(r)}>{n}</a>
    },
    { title: '模态', dataIndex: 'modality', key: 'modality', width: 100,
      render: (m: string) => { const mt = modalityMap[m] || { color: 'default', label: m }; return <Tag color={mt.color}>{mt.label}</Tag>; }
    },
    { title: '数据量', dataIndex: 'itemCount', key: 'itemCount', width: 80 },
    { title: '总大小', dataIndex: 'totalSize', key: 'totalSize', width: 100, render: (s: number) => formatSize(s) },
    { title: '格式', dataIndex: 'fileFormat', key: 'fileFormat', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80,
      render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '已激活' : '草稿'}</Tag>
    },
    { title: '更新日期', dataIndex: 'updatedAt', key: 'updatedAt', width: 110, render: (d: string) => d?.split('T')[0] },
    { title: '操作', key: 'action', width: 200,
      render: (_: any, record: Dataset) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailModal(record)}>详情</Button>
          <Button type="link" size="small" icon={<UploadOutlined />} onClick={() => setUploadModal(record)}>上传</Button>
          <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => setPreviewModal(record)}>预览</Button>
        </Space>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>数据集管理</Title>
          <Text type="secondary">管理多模态医学数据集的导入、预览与版本控制</Text>
        </div>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setUploadModal({ id: 0, name: '新上传' } as any)}>批量上传</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreateModal(true); }}>新建数据集</Button>
        </Space>
      </div>

      {/* 模态分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[{ modality: 'ct', label: 'CT影像', count: datasets.filter(d => d.modality === 'ct').length, color: 'blue' },
          { modality: 'wsi', label: '病理WSI', count: datasets.filter(d => d.modality === 'wsi').length, color: 'magenta' },
          { modality: 'tongue', label: '中医舌诊', count: datasets.filter(d => d.modality === 'tongue').length, color: 'red' },
          { modality: 'us', label: '超声', count: datasets.filter(d => d.modality === 'us').length, color: 'orange' },
          { modality: 'text', label: '文本', count: datasets.filter(d => d.modality === 'text').length, color: 'geekblue' },
        ].map(item => (
          <Col span={4} key={item.modality}>
            <Card size="small" hoverable styles={{ body: { textAlign: 'center', padding: '16px 8px' } }}>
              <Title level={3} style={{ margin: 0, color: item.color }}>{item.count}</Title>
              <Text type="secondary">{item.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card styles={{ body: { padding: 0 } }}>
        <Table dataSource={datasets} columns={columns} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} size="middle" />
      </Card>

      {/* 创建数据集 */}
      <Modal title="新建数据集" open={createModal} onOk={() => form.submit()} onCancel={() => setCreateModal(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item label="数据集名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="如：胸部CT训练集_v2" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属项目" name="projectId" rules={[{ required: true }]}>
                <Select placeholder="选择项目" options={projects.map(p => ({ value: p.id, label: p.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="数据模态" name="modality" rules={[{ required: true }]}>
                <Select placeholder="选择模态" options={Object.entries(modalityMap).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="文件格式" name="fileFormat">
            <Select placeholder="选择格式" options={[
              { value: 'dicom', label: 'DICOM' }, { value: 'nifti', label: 'NIfTI' },
              { value: 'svs', label: 'SVS' }, { value: 'png', label: 'PNG' },
              { value: 'json', label: 'JSON' }, { value: 'pdf', label: 'PDF' },
            ]} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传弹窗 */}
      <Modal title={uploadModal ? `上传文件 - ${uploadModal.name || '新数据集'}` : '上传文件'} open={!!uploadModal}
        onCancel={() => setUploadModal(null)} footer={null} width={500}>
        {uploadModal && (
          <div>
            <Dragger name="file" multiple showUploadList={{ showPreviewIcon: true }}
              beforeUpload={(file) => { message.info(`${file.name} 已添加到上传队列`); return false; }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 DICOM、NIfTI、SVS、PNG、JSON 等医学数据格式</p>
            </Dragger>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button onClick={() => setUploadModal(null)} style={{ marginRight: 8 }}>取消</Button>
              <Button type="primary" onClick={() => handleUpload(uploadModal)}>开始上传</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 预览弹窗 */}
      <Modal title={`数据预览 - ${previewModal?.name}`} open={!!previewModal} onCancel={() => setPreviewModal(null)}
        footer={null} width={600}>
        {previewModal && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }}>
              {previewModal.modality === 'ct' ? '🫁' : previewModal.modality === 'wsi' ? '🔬' : previewModal.modality === 'tongue' ? '👅' : '📄'}
            </div>
            <Title level={4}>{previewModal.name}</Title>
            <Text type="secondary">{previewModal.description}</Text>
            <div style={{ marginTop: 16, color: '#888' }}>
              <p>模态：{modalityMap[previewModal.modality]?.label || previewModal.modality}</p>
              <p>数据量：{previewModal.itemCount} 条</p>
              <p>总大小：{formatSize(previewModal.totalSize)}</p>
            </div>
            <Button type="primary" icon={<EyeOutlined />} onClick={() => { setPreviewModal(null); message.info('打开数据浏览器'); }}>
              浏览数据条目
            </Button>
          </div>
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal title="数据集详情" open={!!detailModal} onCancel={() => setDetailModal(null)} footer={[
        <Button key="close" onClick={() => setDetailModal(null)}>关闭</Button>
      ]} width={520}>
        {detailModal && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="名称" span={2}>{detailModal.name}</Descriptions.Item>
            <Descriptions.Item label="模态">{modalityMap[detailModal.modality]?.label || detailModal.modality}</Descriptions.Item>
            <Descriptions.Item label="格式">{detailModal.fileFormat}</Descriptions.Item>
            <Descriptions.Item label="数据量">{detailModal.itemCount} 条</Descriptions.Item>
            <Descriptions.Item label="总大小">{formatSize(detailModal.totalSize)}</Descriptions.Item>
            <Descriptions.Item label="状态">{detailModal.status === 'active' ? '已激活' : '草稿'}</Descriptions.Item>
            <Descriptions.Item label="更新日期">{detailModal.updatedAt?.split('T')[0]}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{detailModal.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DatasetsPage;
