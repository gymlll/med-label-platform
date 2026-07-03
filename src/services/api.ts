/**
 * 前端 API 服务层 - 连接真实 Flask 后端
 */
import type {
  User, Project, Dataset, Task, TaskAssignment,
  AnnotationRecord, ReviewRecord, AcceptanceRecord,
  AIModel, QualityMetric, AuditLog, PageResult, PageParams,
} from '../types';

const BASE_URL = 'https://3ee147.xhang.buaa.edu.cn:52811/api/v1';

// ==================== 工具函数 ====================
function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeout = 30000,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `请求失败 (${response.status})`);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('请求超时，请检查后端服务是否运行');
    }
    throw err;
  }
}

// ==================== Auth ====================
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  register: async (userData: {
    username: string; password: string; fullName: string;
    email?: string; title?: string; department?: string;
  }) => {
    const data = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: async () => {
    try { await request('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    return request<User>('/auth/me');
  },
};

// ==================== Users ====================
export const userApi = {
  list: async (params?: PageParams & { department?: string }) => {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.page) query.set('page', String(params.page));
    const qs = query.toString();
    return request<PageResult<User>>(`/users${qs ? '?' + qs : ''}`);
  },
  create: async (data: any) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: number, data: any) => request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ==================== Projects ====================
export const projectApi = {
  list: async (params?: PageParams & { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<PageResult<Project>>(`/projects${qs ? '?' + qs : ''}`);
  },
  getById: async (id: number) => request<Project>(`/projects/${id}`),
  create: async (data: any) => request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: number, data: any) => request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ==================== Datasets ====================
export const datasetApi = {
  list: async (projectId?: number, params?: PageParams) => {
    const query = new URLSearchParams();
    if (projectId) query.set('projectId', String(projectId));
    const qs = query.toString();
    return request<PageResult<Dataset>>(`/datasets${qs ? '?' + qs : ''}`);
  },
  getById: async (id: number) => request<Dataset>(`/datasets/${id}`),
  create: async (data: any) => request<Dataset>('/datasets', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== Tasks ====================
export const taskApi = {
  list: async (projectId?: number, params?: Partial<PageParams> & { status?: string }) => {
    const query = new URLSearchParams();
    if (projectId) query.set('projectId', String(projectId));
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return request<PageResult<Task>>(`/tasks${qs ? '?' + qs : ''}`);
  },
  getById: async (id: number) => request<Task>(`/tasks/${id}`),
  create: async (data: any) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  publish: async (id: number) => request<Task>(`/tasks/${id}/publish`, { method: 'POST' }),
  terminate: async (id: number) => request<Task>(`/tasks/${id}/terminate`, { method: 'POST' }),
  assign: async (taskId: number, data: any) => request(`/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  getAssignments: async (taskId: number) => request<TaskAssignment[]>(`/tasks/${taskId}/assignments`),
  getMyAssignments: async () => request<TaskAssignment[]>('/tasks/assignments/me'),
  claimAssignment: async (id: number) => request(`/tasks/assignments/${id}/claim`, { method: 'POST' }),
};

// ==================== Annotations ====================
export const annotationApi = {
  list: async (dataItemId?: number, taskId?: number) => {
    const query = new URLSearchParams();
    if (dataItemId) query.set('dataItemId', String(dataItemId));
    if (taskId) query.set('taskId', String(taskId));
    const qs = query.toString();
    return request<AnnotationRecord[]>(`/annotations${qs ? '?' + qs : ''}`);
  },
  create: async (data: any) => request<AnnotationRecord>('/annotations', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: number, data: any) => request<AnnotationRecord>(`/annotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submit: async (id: number) => request<AnnotationRecord>(`/annotations/${id}/submit`, { method: 'POST' }),
  delete: async (id: number) => request(`/annotations/${id}`, { method: 'DELETE' }),
};

// ==================== Reviews ====================
export const reviewApi = {
  list: async (params?: { reviewerId?: number }) => {
    const query = new URLSearchParams();
    if (params?.reviewerId) query.set('reviewerId', String(params.reviewerId));
    const qs = query.toString();
    return request<ReviewRecord[]>(`/reviews${qs ? '?' + qs : ''}`);
  },
  create: async (data: any) => request<ReviewRecord>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== Acceptance ====================
export const acceptanceApi = {
  getByTask: async (taskId: number) => request<AcceptanceRecord>(`/acceptance/${taskId}`),
  create: async (data: any) => request<AcceptanceRecord>('/acceptance', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== Quality ====================
export const qualityApi = {
  getMetrics: async (projectId?: number, taskId?: number) => {
    const query = new URLSearchParams();
    if (projectId) query.set('projectId', String(projectId));
    if (taskId) query.set('taskId', String(taskId));
    return request<QualityMetric[]>(`/quality/metrics?${query.toString()}`);
  },
  getKappaMatrix: async (projectId: number) => {
    return request<{ annotators: string[]; matrix: number[][] }>(`/quality/kappa-matrix?projectId=${projectId}`);
  },
  getDisagreements: async (projectId: number) => {
    return request<{ label: string; count: number; percent: number }[]>(`/quality/disagreements?projectId=${projectId}`);
  },
};

// ==================== AI Models ====================
export const aiApi = {
  listModels: async (modality?: string) => {
    const query = modality ? `?modality=${modality}` : '';
    return request<AIModel[]>(`/ai/models${query}`);
  },
  predict: async (modelId: number, data: any) => {
    return request('/ai/predict', { method: 'POST', body: JSON.stringify({ modelId, ...data }) });
  },
};

// ==================== Audit ====================
export const auditApi = {
  listLogs: async (params?: PageParams & { projectId?: number; action?: string }) => {
    const query = new URLSearchParams();
    if (params?.projectId) query.set('projectId', String(params.projectId));
    if (params?.action) query.set('action', params.action);
    return request<PageResult<AuditLog>>(`/audit/logs?${query.toString()}`);
  },
  generateReport: async (projectId: number) => {
    return request<{ reportUrl: string }>('/audit/reports', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  },
};

// ==================== Dashboard ====================
export const dashboardApi = {
  getStats: async () => {
    return request<{
      activeProjects: number; totalTasks: number; activeTasks: number;
      totalAnnotators: number; totalAnnotations: number;
      passRate: number; avgKappa: number;
    }>('/dashboard/stats');
  },
  getRecentActivities: async () => {
    return request<{
      id: number; userId: number; userName: string; action: string;
      target: string; time: string; project: string;
    }[]>('/dashboard/activities');
  },
  getTaskDistribution: async () => {
    return request<{ name: string; completed: number; total: number }[]>('/dashboard/task-distribution');
  },
};
