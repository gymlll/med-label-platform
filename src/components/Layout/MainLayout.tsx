import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Breadcrumb, Typography, theme, App, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined, ProjectOutlined, DatabaseOutlined, NotificationOutlined,
  ToolOutlined, CheckCircleOutlined, BarChartOutlined, SafetyOutlined,
  UserOutlined, SettingOutlined, RobotOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, LogoutOutlined, BellOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../stores/appStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: any[];
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/projects', icon: <ProjectOutlined />, label: '项目管理' },
  { key: '/datasets', icon: <DatabaseOutlined />, label: '数据集管理' },
  {
    key: 'tasks', icon: <NotificationOutlined />, label: '标注任务',
    children: [
      { key: '/tasks', label: '全部任务' },
      { key: '/tasks/my', label: '我的任务' },
    ],
  },
  {
    key: 'annotation', icon: <ToolOutlined />, label: '标注工具',
    children: [
      { key: '/annotation/workspace', label: '标注工作台' },
      { key: '/annotation/ai-models', icon: <RobotOutlined />, label: 'AI 模型管理' },
    ],
  },
  { key: '/review', icon: <CheckCircleOutlined />, label: '审核管理' },
  { key: '/quality', icon: <BarChartOutlined />, label: '质量监控' },
  { key: '/audit', icon: <SafetyOutlined />, label: '审计追溯' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

interface Notif { id: number; title: string; content: string; isRead: boolean; }

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleCollapsed, currentUser, logout } = useAppStore();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const { message } = App.useApp();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const unreadCount = notifs.filter(n => !n.isRead).length;

  // 从后端获取通知
  useEffect(() => {
    if (!currentUser) return;
    setNotifLoading(true);
    const token = localStorage.getItem('token');
    fetch('https://3ee147.xhang.buaa.edu.cn:52811/api/v1/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setNotifs(data))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [currentUser]);

  // 确定当前选中的菜单项
  const selectedKey = '/' + location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
  const openKey = location.pathname.split('/')[1] ? location.pathname.split('/')[1] : undefined;

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const breadcrumbMap: Record<string, string> = {
    'dashboard': '工作台', 'projects': '项目管理', 'datasets': '数据集管理',
    'tasks': '标注任务', 'my': '我的任务', 'annotation': '标注工具',
    'workspace': '标注工作台', 'ai-models': 'AI 模型管理',
    'review': '审核管理', 'quality': '质量监控', 'audit': '审计追溯',
    'users': '用户管理', 'settings': '系统设置',
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, index) => ({
    key: part,
    title: breadcrumbMap[part] || part,
  }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <ExperimentOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: collapsed ? 0 : 8 }} />
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>
              医学数据标注平台
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={[openKey || '']}
          items={menuItems as any}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* 主区域 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        {/* 顶部导航 */}
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              style={{ fontSize: 16, width: 40, height: 40 }}
            />
            <Breadcrumb items={[{ title: '首页' }, ...breadcrumbItems]} style={{ marginLeft: 16 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 通知 */}
            <Dropdown menu={{
              items: [
                ...(notifLoading ? [] : notifs.slice(0, 5).map(n => ({
                  key: String(n.id),
                  label: (
                    <div style={{
                      padding: '4px 0',
                      background: n.isRead ? 'transparent' : '#e6f7ff',
                      borderRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 8,
                      maxWidth: 280,
                    }}>
                      {!n.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1890ff', flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 13 }}>{n.title}</Text>
                      </div>
                    </div>
                  ),
                }))),
                ...(notifs.length === 0 && !notifLoading ? [{ key: 'empty', label: <span style={{ color: '#999' }}>暂无通知</span>, disabled: true }] : []),
                { type: 'divider' },
                { key: 'all', label: <span style={{ color: '#1890ff', display: 'block', textAlign: 'center' }}>查看全部通知</span> },
              ],
              onClick: ({ key }) => {
                if (key === 'all') {
                  message.info('跳转至通知中心');
                } else {
                  // 标记已读 - 调用后端API持久化
                  fetch(`https://3ee147.xhang.buaa.edu.cn:52811/api/v1/notifications/${key}/read`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                  }).then(() => {
                    setNotifs(prev => prev.map(n =>
                      n.id === Number(key) ? { ...n, isRead: true } : n
                    ));
                  }).catch(() => {});
                  message.info('已标记为已读');
                }
              },
            }} placement="bottomRight" trigger={['click']}>
              <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'flex-start', position: 'relative' }}>
                <BellOutlined style={{ fontSize: 20 }} />
                {unreadCount > 0 && (
                  <span style={{
                    background: '#ff4d4f', borderRadius: 9,
                    minWidth: 18, height: 18, lineHeight: '18px',
                    fontSize: 11, color: '#fff', textAlign: 'center',
                    padding: '0 4px', boxSizing: 'border-box',
                    marginLeft: -7, marginTop: -4,
                    boxShadow: '0 2px 4px rgba(255,77,79,0.4)',
                    pointerEvents: 'none',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            </Dropdown>

            {/* 用户信息 */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenu }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  style={{ backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.fullName || '用户'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content style={{ margin: '16px 16px 0', minHeight: 'calc(100vh - 160px)' }}>
          <div style={{
            padding: 24,
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}>
            <Outlet />
          </div>
        </Content>
        {/* 页脚版权 */}
        <div style={{
          height: 60, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: '#FFFFFF', padding: '8px 0',
        }}>
          <div style={{ height: 1, width: '80%', maxWidth: 1300, backgroundColor: '#D9D9D9', marginBottom: 8 }} />
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <img src="/buaa_logo.png" alt="" style={{ width: 24, height: 24 }} />
            <span style={{ fontSize: 13, color: '#555' }}>版权所有 © 北京航空航天大学</span>
          </div>
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
