import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, Spin, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import ProjectsPage from './pages/Projects';
import DatasetsPage from './pages/Datasets';
import TasksPage from './pages/Tasks';
import MyTasksPage from './pages/Tasks/MyTasks';
import AnnotationWorkspace from './pages/Annotation/Workspace';
import AIModelsPage from './pages/Annotation/AIModels';
import ReviewPage from './pages/Review';
import QualityPage from './pages/Quality';
import AuditPage from './pages/Audit';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';
import { useAppStore } from './stores/appStore';
import { authApi } from './services/api';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, currentUser } = useAppStore();
  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const { setUser, setToken, token } = useAppStore();
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          setToken(savedToken);
          const user = await authApi.getCurrentUser();
          setUser(user);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setInitLoading(false);
    };
    init();
  }, []);

  if (initLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Layout: { headerBg: '#fff', siderBg: '#001529' },
          Menu: { darkItemBg: '#001529', darkItemSelectedBg: '#1677ff' },
          Table: { headerBg: '#fafafa' },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectsPage />} />
              <Route path="datasets" element={<DatasetsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/my" element={<MyTasksPage />} />
              <Route path="annotation/workspace" element={<AnnotationWorkspace />} />
              <Route path="annotation/ai-models" element={<AIModelsPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="quality" element={<QualityPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
