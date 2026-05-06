// ==================== 基础类型 ====================
export interface User {
  id: number;
  orgId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  title: string; // 职称
  department: string; // 科室
  avatar?: string;
  status: 'active' | 'inactive';
  roles: Role[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface Permission {
  id: number;
  code: string;
  description: string;
}

// ==================== 项目 ====================
export interface Project {
  id: number;
  orgId: number;
  code: string;
  name: string;
  description: string;
  researchType: string; // 临床研究/影像组学/中医证候
  status: 'active' | 'archived' | 'closed';
  memberCount: number;
  datasetCount: number;
  taskCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== 数据集 ====================
export interface Dataset {
  id: number;
  projectId: number;
  name: string;
  description: string;
  modality: ModalityType;
  status: 'draft' | 'active' | 'archived';
  itemCount: number;
  totalSize: number;
  fileFormat: string;
  createdAt: string;
  updatedAt: string;
}

export type ModalityType =
  | 'ct' | 'mri' | 'dr' | 'us' | 'endoscopy' | 'fundus'
  | 'wsi' | 'tongue' | 'face' | 'pulse' | 'meridian'
  | 'ecg' | 'eeg' | 'text' | 'video';

export interface DataItem {
  id: number;
  datasetId: number;
  externalId: string;
  storageKey: string;
  fileSize: number;
  fileFormat: string;
  metadata: Record<string, any>;
  checksumSha256: string;
  createdAt: string;
}

// ==================== 标签体系 ====================
export interface LabelSchema {
  id: number;
  projectId: number;
  name: string;
  description: string;
  currentVersion: string;
  createdAt: string;
}

export interface LabelSchemaVersion {
  id: number;
  schemaId: number;
  version: string;
  schemaDef: LabelDef;
  isActive: boolean;
  publishedAt: string;
}

export interface LabelDef {
  categories: LabelCategory[];
}

export interface LabelCategory {
  id: number;
  name: string;
  color: string;
  description?: string;
  parentId?: number;
  children?: LabelCategory[];
  attributes?: LabelAttribute[];
}

export interface LabelAttribute {
  id: number;
  name: string;
  type: 'select' | 'multi_select' | 'number' | 'text';
  options?: { value: string; label: string }[];
}

// ==================== 标注任务 ====================
export interface Task {
  id: number;
  projectId: number;
  name: string;
  type: 'normal' | 'parallel' | 'sequential';
  datasetId: number;
  datasetName: string;
  labelSchemaId: number;
  labelSchemaName: string;
  status: TaskStatus;
  progress: TaskProgress;
  annotatorCount: number;
  totalItems: number;
  deadline?: string;
  aiAssistEnabled: boolean;
  blindModeEnabled: boolean;
  tsaEnabled: boolean;
  createdBy: number;
  createdAt: string;
  publishedAt?: string;
  completedAt?: string;
}

export type TaskStatus = 'draft' | 'published' | 'in_progress' | 'under_review' | 'accepted' | 'terminated';

export interface TaskProgress {
  pending: number;
  inProgress: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface TaskAssignment {
  id: number;
  taskId: number;
  dataItemId: number;
  annotatorId: number;
  annotatorName: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'arbitration';
  assignedAt: string;
  startedAt?: string;
  submittedAt?: string;
}

// ==================== 标注记录 ====================
export interface AnnotationRecord {
  id: number;
  assignmentId: number;
  dataItemId: number;
  taskId: number;
  annotatorId: number;
  payloadType: AnnotationType;
  payload: Record<string, any>;
  aiOrigin?: Record<string, any>;
  aiModelId?: number;
  aiConfidence?: number;
  editDistance?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  isArbitrated: boolean;
  sourceRecordIds: number[];
  version: number;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
}

export type AnnotationType =
  | 'bbox' | 'polygon' | 'mask' | 'keypoint'
  | 'classification' | 'ner' | 'relation' | 'waveform';

// ==================== 审核 ====================
export interface ReviewRecord {
  id: number;
  annotationId: number;
  reviewerId: number;
  reviewerName: string;
  decision: 'approved' | 'rejected' | 'modified';
  comments: string;
  modifiedPayload?: Record<string, any>;
  reviewLevel: number;
  createdAt: string;
}

export interface AcceptanceRecord {
  id: number;
  taskId: number;
  acceptorId: number;
  decision: 'accepted' | 'rejected';
  sampleSize: number;
  samplePassRate: number;
  comments: string;
  lockedAt?: string;
  createdAt: string;
}

// ==================== 质量指标 ====================
export interface QualityMetric {
  id: number;
  projectId: number;
  taskId?: number;
  metricType: string;
  metricValue: Record<string, any>;
  scope: string;
  scopeId: string;
  computedAt: string;
}

// ==================== 审计日志 ====================
export interface AuditLog {
  logId: number;
  timestamp: string;
  orgId: number;
  projectId?: number;
  userId: number;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  payloadBefore?: Record<string, any>;
  payloadAfter?: Record<string, any>;
  payloadDiff?: Record<string, any>;
  prevLogHash: string;
  currentHash: string;
  clientIp: string;
}

// ==================== AI 模型 ====================
export interface AIModel {
  id: number;
  name: string;
  modality: string;
  taskType: string;
  version: string;
  status: 'draft' | 'shadow' | 'production' | 'deprecated';
  confidenceDefault: number;
  perfMetrics: Record<string, number>;
  createdAt: string;
}

// ==================== API 通用 ====================
export interface PageParams {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}
