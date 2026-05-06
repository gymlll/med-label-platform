import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Tabs, Select, Slider, Divider, Tooltip, message, Modal } from 'antd';
import {
  SaveOutlined, SendOutlined, UndoOutlined, RedoOutlined,
  ZoomInOutlined, ZoomOutOutlined, BgColorsOutlined,
  BorderOutlined, HighlightOutlined, MinusOutlined,
  FontSizeOutlined, AimOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined,
  LeftOutlined, RightOutlined, DownloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// 标注工具按钮组件
const ToolButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <Tooltip title={label}>
    <Button
      type={active ? 'primary' : 'text'}
      icon={icon}
      size="small"
      onClick={onClick}
      style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    />
  </Tooltip>
);

const AnnotationWorkspace: React.FC = () => {
  const [activeTool, setActiveTool] = useState('rect');
  const [currentSlice, setCurrentSlice] = useState(128);
  const totalSlices = 256;

  const tools = [
    { key: 'select', icon: <AimOutlined />, label: '选择' },
    { key: 'rect', icon: <BorderOutlined />, label: '矩形' },
    { key: 'polygon', icon: <HighlightOutlined />, label: '多边形' },
    { key: 'brush', icon: <BgColorsOutlined />, label: '画笔' },
    { key: 'keypoint', icon: <FontSizeOutlined />, label: '关键点' },
    { key: 'measure', icon: <MinusOutlined />, label: '测量' },
    { key: 'pan', icon: <EditOutlined />, label: '平移' },
    { key: 'zoom', icon: <ZoomInOutlined />, label: '缩放' },
  ];

  return (
    <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', marginBottom: 8,
      }}>
        <div>
          <Title level={5} style={{ margin: 0 }}>标注工作台</Title>
          <Text type="secondary">
            任务：肺结节检出_第一批 | 当前：CT_001234.dcm (5/500)
          </Text>
        </div>
        <Space>
          <Tag color="blue">AI 预标注已启用</Tag>
          <Tag>肺结节标注规范 v1.1</Tag>
        </Space>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        {/* 左侧工具栏 */}
        <Card size="small" style={{ width: 56, display: 'flex', flexDirection: 'column', alignItems: 'center' }} styles={{ body: { padding: '8px 4px' } }}>
          <Space direction="vertical" size={2}>
            {tools.map(t => (
              <ToolButton key={t.key} icon={t.icon} label={t.label} active={activeTool === t.key} onClick={() => setActiveTool(t.key)} />
            ))}
          </Space>
          <Divider style={{ margin: '8px 0' }} />
          <Space direction="vertical" size={2}>
            <ToolButton icon={<UndoOutlined />} label="撤销" />
            <ToolButton icon={<RedoOutlined />} label="重做" />
          </Space>
        </Card>

        {/* 主标注区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 图像显示区 */}
          <Card size="small" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }} styles={{ body: { padding: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              {/* 模拟CT标注画布 */}
              <div style={{
                width: 480, height: 480, background: '#0a0a1a',
                borderRadius: 8, position: 'relative',
                margin: '0 auto', overflow: 'hidden',
                border: '1px solid #333',
              }}>
                {/* 模拟肺部分割 */}
                <div style={{
                  position: 'absolute', left: '25%', top: '20%',
                  width: '50%', height: '60%',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.15)',
                }} />
                <div style={{
                  position: 'absolute', left: '15%', top: '25%',
                  width: '30%', height: '50%',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                }} />
                <div style={{
                  position: 'absolute', right: '15%', top: '25%',
                  width: '30%', height: '50%',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                }} />

                {/* AI 预标注框 */}
                <div style={{
                  position: 'absolute', left: '35%', top: '35%',
                  width: '12%', height: '10%',
                  border: '2px dashed #ff4d4f',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    position: 'absolute', top: -18, left: 0,
                    background: '#ff4d4f', color: '#fff',
                    fontSize: 10, padding: '0 4px', borderRadius: 2,
                    whiteSpace: 'nowrap',
                  }}>
                    肺结节 0.92
                  </div>
                </div>

                {/* 已标注框 */}
                <div style={{
                  position: 'absolute', left: '50%', top: '40%',
                  width: '8%', height: '8%',
                  border: '2px solid #52c41a',
                  borderRadius: 4,
                }}>
                  <div style={{
                    position: 'absolute', top: -18, left: 0,
                    background: '#52c41a', color: '#fff',
                    fontSize: 10, padding: '0 4px', borderRadius: 2,
                  }}>
                    实性结节 5-10mm
                  </div>
                </div>

                {/* 中心十字 */}
                <div style={{ position: 'absolute', left: '50%', top: '50%', width: 20, height: 1, background: 'rgba(255,255,255,0.2)', transform: 'translate(-50%, -50%)' }} />
                <div style={{ position: 'absolute', left: '50%', top: '50%', width: 1, height: 20, background: 'rgba(255,255,255,0.2)', transform: 'translate(-50%, -50%)' }} />

                {/* 标签信息 */}
                <div style={{
                  position: 'absolute', bottom: 8, left: 8,
                  color: '#888', fontSize: 11, fontFamily: 'monospace',
                }}>
                  CT_001234.dcm | 层厚: 1.25mm | WW: 1500 WC: -600
                </div>
              </div>
            </div>
          </Card>

          {/* 底部控制栏 */}
          <Card size="small" styles={{ body: { padding: '8px 16px' } }}>
            <Row align="middle" gutter={16}>
              <Col>
                <Space>
                  <Button icon={<LeftOutlined />} size="small" onClick={() => message.info('切换到上一张影像')}>上一张</Button>
                  <Button icon={<RightOutlined />} size="small" onClick={() => message.info('切换到下一张影像')}>下一张</Button>
                </Space>
              </Col>
              <Col flex="auto">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>序列: {currentSlice}/{totalSlices}</Text>
                  <Slider
                    min={0} max={totalSlices}
                    value={currentSlice}
                    onChange={setCurrentSlice}
                    style={{ flex: 1, margin: '0 8px' }}
                  />
                </div>
              </Col>
              <Col>
                <Select size="small" defaultValue="lung" style={{ width: 100 }}>
                  <Select.Option value="lung">肺窗 (1500/-600)</Select.Option>
                  <Select.Option value="mediastinum">纵隔窗 (350/50)</Select.Option>
                  <Select.Option value="bone">骨窗 (1800/400)</Select.Option>
                  <Select.Option value="brain">脑窗 (80/40)</Select.Option>
                </Select>
              </Col>
              <Col>
                <Space>
                  <Button icon={<SaveOutlined />} size="small" onClick={() => message.success('标注已保存为草稿')}>保存草稿</Button>
                  <Button type="primary" icon={<SendOutlined />} size="small" onClick={() => {
                    Modal.confirm({
                      title: '提交标注',
                      content: '确定要提交当前标注结果吗？提交后将进入审核流程。',
                      onOk: () => message.success('标注已提交，等待审核'),
                    });
                  }}>提交</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </div>

        {/* 右侧标注信息面板 */}
        <div style={{ width: 280 }}>
          <Tabs
            size="small"
            items={[
              {
                key: 'labels', label: '标签',
                children: (
                  <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {[
                      { name: '实性结节', color: '#f50', count: 2 },
                      { name: '部分实性结节', color: '#fa0', count: 0 },
                      { name: '磨玻璃结节', color: '#ff0', count: 1 },
                      { name: '胸膜增厚', color: '#0af', count: 0 },
                      { name: '淋巴结', color: '#0a8', count: 0 },
                    ].map(l => (
                      <div
                        key={l.name}
                        style={{
                          padding: '6px 8px', cursor: 'pointer', borderRadius: 4,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginBottom: 2,
                          background: l.count > 0 ? '#f5f5f5' : 'transparent',
                        }}
                        onClick={() => {}}
                      >
                        <Space>
                          <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                          <span style={{ fontSize: 13 }}>{l.name}</span>
                        </Space>
                        <Tag style={{ marginRight: 0 }}>{l.count}</Tag>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'annotations', label: '标注列表',
                children: (
                  <div>
                    {[
                      { id: 1, label: '实性结节', size: '8mm', confidence: 0.92, source: 'AI' },
                      { id: 2, label: '实性结节', size: '12mm', confidence: 0.88, source: '人工' },
                      { id: 3, label: '磨玻璃结节', size: '6mm', confidence: 0.75, source: 'AI' },
                    ].map(a => (
                      <div key={a.id} style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Space>
                            <Tag color={a.source === 'AI' ? 'blue' : 'green'} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>{a.source}</Tag>
                            <span>{a.label}</span>
                          </Space>
                          <Space>
                            <a onClick={() => message.info('编辑标注')}><EditOutlined /></a>
                            <a onClick={() => message.warning('删除标注')}><DeleteOutlined style={{ color: '#ff4d4f' }} /></a>
                          </Space>
                        </div>
                        <div><Text type="secondary" style={{ fontSize: 12 }}>{a.size} | 置信度: {a.confidence}</Text></div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'info', label: '属性',
                children: (
                  <div style={{ fontSize: 13 }}>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">文件</Text><span>CT_001234.dcm</span>
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">模态</Text><span>CT</span>
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">层厚</Text><span>1.25mm</span>
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">系列</Text><span>256层</span>
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">标注员</Text><span>李雪梅</span>
                    </div>
                    <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">状态</Text><Tag color="processing" style={{ margin: 0 }}>标注中</Tag>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default AnnotationWorkspace;
