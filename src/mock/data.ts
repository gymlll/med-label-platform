import type {
  User, Project, Dataset, DataItem, Task, TaskAssignment,
  LabelSchema, LabelSchemaVersion, AnnotationRecord, ReviewRecord,
  AcceptanceRecord, AIModel, QualityMetric, AuditLog,
} from '../types';

export const mockUsers: User[] = [
  { id: 1, orgId: 1, username: 'admin', fullName: '系统管理员', email: 'admin@hospital.cn', phone: '13800138001', title: '高级工程师', department: '信息科', status: 'active', roles: [{ id: 1, code: 'admin', name: '系统管理员' }], lastLoginAt: '2026-04-29T08:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { id: 2, orgId: 1, username: 'zhang', fullName: '张明远', email: 'zhang@hospital.cn', phone: '13800138002', title: '主任医师', department: '放射科', status: 'active', roles: [{ id: 2, code: 'pm', name: '项目经理' }], lastLoginAt: '2026-04-28T09:30:00Z', createdAt: '2025-01-15T00:00:00Z' },
  { id: 3, orgId: 1, username: 'li', fullName: '李雪梅', email: 'li@hospital.cn', phone: '13800138003', title: '主治医师', department: '病理科', status: 'active', roles: [{ id: 3, code: 'annotator', name: '标注员' }], lastLoginAt: '2026-04-29T07:45:00Z', createdAt: '2025-02-01T00:00:00Z' },
  { id: 4, orgId: 1, username: 'wang', fullName: '王建国', email: 'wang@hospital.cn', phone: '13800138004', title: '副主任医师', department: '放射科', status: 'active', roles: [{ id: 4, code: 'reviewer', name: '审核员' }], lastLoginAt: '2026-04-28T14:20:00Z', createdAt: '2025-01-20T00:00:00Z' },
  { id: 5, orgId: 1, username: 'chen', fullName: '陈思雨', email: 'chen@hospital.cn', phone: '13800138005', title: '住院医师', department: '放射科', status: 'active', roles: [{ id: 3, code: 'annotator', name: '标注员' }], lastLoginAt: '2026-04-29T08:15:00Z', createdAt: '2025-03-01T00:00:00Z' },
  { id: 6, orgId: 1, username: 'liu', fullName: '刘博文', email: 'liu@hospital.cn', phone: '13800138006', title: '住院医师', department: '病理科', status: 'active', roles: [{ id: 3, code: 'annotator', name: '标注员' }], lastLoginAt: '2026-04-28T16:00:00Z', createdAt: '2025-03-15T00:00:00Z' },
  { id: 7, orgId: 1, username: 'zhao', fullName: '赵雅琴', email: 'zhao@hospital.cn', phone: '13800138007', title: '主任医师', department: '超声科', status: 'active', roles: [{ id: 2, code: 'pm', name: '项目经理' }, { id: 4, code: 'reviewer', name: '审核员' }], lastLoginAt: '2026-04-27T10:00:00Z', createdAt: '2025-01-10T00:00:00Z' },
  { id: 8, orgId: 1, username: 'sun', fullName: '孙明华', email: 'sun@hospital.cn', phone: '13800138008', title: '住院医师', department: '中医科', status: 'active', roles: [{ id: 3, code: 'annotator', name: '标注员' }], lastLoginAt: '2026-04-29T06:30:00Z', createdAt: '2025-04-01T00:00:00Z' },
];

export const mockProjects: Project[] = [
  { id: 1, orgId: 1, code: 'P2026-001', name: '肺结节CT影像标注项目', description: '基于多中心CT影像的肺结节检测与分类标注，支持后续AI辅助诊断模型训练', researchType: '影像组学', status: 'active', memberCount: 12, datasetCount: 3, taskCount: 8, createdBy: 2, createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-04-28T10:00:00Z' },
  { id: 2, orgId: 1, code: 'P2026-002', name: '病理WSI肿瘤分级标注', description: '乳腺癌HE染色全切片病理图像的肿瘤分级标注，用于AI辅助病理诊断系统开发', researchType: '临床研究', status: 'active', memberCount: 8, datasetCount: 2, taskCount: 5, createdBy: 2, createdAt: '2026-03-15T00:00:00Z', updatedAt: '2026-04-27T14:00:00Z' },
  { id: 3, orgId: 1, code: 'P2026-003', name: '中医舌诊图像数据集构建', description: '采集并标注中医舌象图像，涵盖常见证候类型的舌色、苔质等特征标注', researchType: '中医证候', status: 'active', memberCount: 6, datasetCount: 1, taskCount: 3, createdBy: 7, createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-26T09:00:00Z' },
  { id: 4, orgId: 1, code: 'P2026-004', name: '乳腺超声BI-RADS标注', description: '乳腺超声图像按照BI-RADS标准进行分类与特征标注', researchType: '临床研究', status: 'active', memberCount: 5, datasetCount: 1, taskCount: 2, createdBy: 7, createdAt: '2026-04-10T00:00:00Z', updatedAt: '2026-04-25T16:00:00Z' },
  { id: 5, orgId: 1, code: 'P2026-005', name: '中医病历NER标注', description: '中医电子病历的命名实体识别标注，包括症状、证候、方剂、药物等实体', researchType: '中医证候', status: 'active', memberCount: 4, datasetCount: 1, taskCount: 1, createdBy: 2, createdAt: '2026-04-20T00:00:00Z', updatedAt: '2026-04-24T11:00:00Z' },
];

export const mockDatasets: Dataset[] = [
  { id: 1, projectId: 1, name: '胸部CT训练集_v1', description: '500例胸部CT平扫数据，含肺结节标注', modality: 'ct', status: 'active', itemCount: 500, totalSize: 256000000000, fileFormat: 'dicom', createdAt: '2026-03-05T00:00:00Z', updatedAt: '2026-04-20T00:00:00Z' },
  { id: 2, projectId: 1, name: '胸部CT验证集_v1', description: '100例胸部CT平扫数据，含肺结节标注', modality: 'ct', status: 'active', itemCount: 100, totalSize: 51200000000, fileFormat: 'dicom', createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-04-15T00:00:00Z' },
  { id: 3, projectId: 1, name: '低剂量CT筛查集', description: '200例低剂量胸部CT肺癌筛查数据', modality: 'ct', status: 'active', itemCount: 200, totalSize: 80000000000, fileFormat: 'dicom', createdAt: '2026-03-20T00:00:00Z', updatedAt: '2026-04-10T00:00:00Z' },
  { id: 4, projectId: 2, name: '乳腺癌WSI数据集', description: '300例乳腺癌HE染色全切片图像', modality: 'wsi', status: 'active', itemCount: 300, totalSize: 600000000000, fileFormat: 'svs', createdAt: '2026-03-18T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
  { id: 5, projectId: 2, name: '乳腺良性病变WSI', description: '100例乳腺良性病变全切片图像', modality: 'wsi', status: 'active', itemCount: 100, totalSize: 200000000000, fileFormat: 'svs', createdAt: '2026-03-25T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
  { id: 6, projectId: 3, name: '中医舌象图像库_v1', description: '500例舌象图像，涵盖淡白、淡红、红、绛、紫青五类舌色', modality: 'tongue', status: 'active', itemCount: 500, totalSize: 25000000000, fileFormat: 'png', createdAt: '2026-04-05T00:00:00Z', updatedAt: '2026-04-25T00:00:00Z' },
  { id: 7, projectId: 4, name: '乳腺超声图像集', description: '200例乳腺超声图像，含BI-RADS分级标注', modality: 'us', status: 'active', itemCount: 200, totalSize: 40000000000, fileFormat: 'dicom', createdAt: '2026-04-12T00:00:00Z', updatedAt: '2026-04-22T00:00:00Z' },
  { id: 8, projectId: 5, name: '中医病历文本集', description: '2000份脱敏中医电子病历', modality: 'text', status: 'active', itemCount: 2000, totalSize: 50000000, fileFormat: 'json', createdAt: '2026-04-22T00:00:00Z', updatedAt: '2026-04-24T00:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 1, projectId: 1, name: '肺结节检出_第一批', type: 'normal', datasetId: 1, datasetName: '胸部CT训练集_v1', labelSchemaId: 1, labelSchemaName: '肺结节标注规范', status: 'in_progress', progress: { pending: 120, inProgress: 80, submitted: 200, approved: 80, rejected: 20 }, annotatorCount: 5, totalItems: 500, deadline: '2026-05-30T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: false, tsaEnabled: true, createdBy: 2, createdAt: '2026-03-20T00:00:00Z', publishedAt: '2026-03-21T00:00:00Z' },
  { id: 2, projectId: 1, name: '肺结节检出_双盲质控', type: 'parallel', datasetId: 2, datasetName: '胸部CT验证集_v1', labelSchemaId: 1, labelSchemaName: '肺结节标注规范', status: 'in_progress', progress: { pending: 10, inProgress: 20, submitted: 40, approved: 20, rejected: 10 }, annotatorCount: 4, totalItems: 100, deadline: '2026-05-15T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: true, tsaEnabled: true, createdBy: 2, createdAt: '2026-03-25T00:00:00Z', publishedAt: '2026-03-26T00:00:00Z' },
  { id: 3, projectId: 1, name: '低剂量CT筛查标注', type: 'normal', datasetId: 3, datasetName: '低剂量CT筛查集', labelSchemaId: 1, labelSchemaName: '肺结节标注规范', status: 'draft', progress: { pending: 200, inProgress: 0, submitted: 0, approved: 0, rejected: 0 }, annotatorCount: 3, totalItems: 200, deadline: '2026-06-01T00:00:00Z', aiAssistEnabled: false, blindModeEnabled: false, tsaEnabled: false, createdBy: 2, createdAt: '2026-04-01T00:00:00Z' },
  { id: 4, projectId: 2, name: '乳腺癌分级_第一轮', type: 'sequential', datasetId: 4, datasetName: '乳腺癌WSI数据集', labelSchemaId: 2, labelSchemaName: '乳腺癌分级规范', status: 'under_review', progress: { pending: 0, inProgress: 0, submitted: 250, approved: 200, rejected: 50 }, annotatorCount: 4, totalItems: 300, deadline: '2026-05-20T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: false, tsaEnabled: true, createdBy: 2, createdAt: '2026-04-01T00:00:00Z', publishedAt: '2026-04-02T00:00:00Z' },
  { id: 5, projectId: 2, name: '良恶性鉴别_验证集', type: 'normal', datasetId: 5, datasetName: '乳腺良性病变WSI', labelSchemaId: 2, labelSchemaName: '乳腺癌分级规范', status: 'published', progress: { pending: 100, inProgress: 0, submitted: 0, approved: 0, rejected: 0 }, annotatorCount: 3, totalItems: 100, deadline: '2026-05-25T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: true, tsaEnabled: false, createdBy: 2, createdAt: '2026-04-10T00:00:00Z', publishedAt: '2026-04-11T00:00:00Z' },
  { id: 6, projectId: 3, name: '舌色分类标注', type: 'normal', datasetId: 6, datasetName: '中医舌象图像库_v1', labelSchemaId: 3, labelSchemaName: '舌诊标注规范', status: 'in_progress', progress: { pending: 200, inProgress: 100, submitted: 150, approved: 40, rejected: 10 }, annotatorCount: 3, totalItems: 500, deadline: '2026-06-15T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: false, tsaEnabled: false, createdBy: 7, createdAt: '2026-04-10T00:00:00Z', publishedAt: '2026-04-11T00:00:00Z' },
  { id: 7, projectId: 4, name: 'BI-RADS分类标注', type: 'parallel', datasetId: 7, datasetName: '乳腺超声图像集', labelSchemaId: 4, labelSchemaName: 'BI-RADS标注规范', status: 'published', progress: { pending: 200, inProgress: 0, submitted: 0, approved: 0, rejected: 0 }, annotatorCount: 2, totalItems: 200, deadline: '2026-06-10T00:00:00Z', aiAssistEnabled: true, blindModeEnabled: true, tsaEnabled: true, createdBy: 7, createdAt: '2026-04-15T00:00:00Z', publishedAt: '2026-04-16T00:00:00Z' },
  { id: 8, projectId: 5, name: '中医病历实体标注', type: 'normal', datasetId: 8, datasetName: '中医病历文本集', labelSchemaId: 5, labelSchemaName: '中医病历标注规范', status: 'in_progress', progress: { pending: 800, inProgress: 400, submitted: 600, approved: 150, rejected: 50 }, annotatorCount: 2, totalItems: 2000, deadline: '2026-06-30T00:00:00Z', aiAssistEnabled: false, blindModeEnabled: false, tsaEnabled: false, createdBy: 2, createdAt: '2026-04-22T00:00:00Z', publishedAt: '2026-04-23T00:00:00Z' },
];

export const mockAssignments: TaskAssignment[] = [
  { id: 1, taskId: 1, dataItemId: 1, annotatorId: 3, annotatorName: '李雪梅', status: 'submitted', assignedAt: '2026-03-22T00:00:00Z', startedAt: '2026-03-23T08:00:00Z', submittedAt: '2026-03-28T16:00:00Z' },
  { id: 2, taskId: 1, dataItemId: 2, annotatorId: 3, annotatorName: '李雪梅', status: 'approved', assignedAt: '2026-03-22T00:00:00Z', startedAt: '2026-03-23T08:30:00Z', submittedAt: '2026-03-28T16:30:00Z' },
  { id: 3, taskId: 1, dataItemId: 3, annotatorId: 5, annotatorName: '陈思雨', status: 'in_progress', assignedAt: '2026-03-22T00:00:00Z', startedAt: '2026-04-01T09:00:00Z' },
  { id: 4, taskId: 1, dataItemId: 4, annotatorId: 5, annotatorName: '陈思雨', status: 'pending', assignedAt: '2026-03-22T00:00:00Z' },
  { id: 5, taskId: 6, dataItemId: 100, annotatorId: 8, annotatorName: '孙明华', status: 'in_progress', assignedAt: '2026-04-12T00:00:00Z', startedAt: '2026-04-13T08:00:00Z' },
  { id: 6, taskId: 8, dataItemId: 200, annotatorId: 3, annotatorName: '李雪梅', status: 'submitted', assignedAt: '2026-04-23T00:00:00Z', startedAt: '2026-04-24T09:00:00Z', submittedAt: '2026-04-27T17:00:00Z' },
];

export const mockLabelSchemas: LabelSchema[] = [
  { id: 1, projectId: 1, name: '肺结节标注规范', description: '基于Lung-RADS的肺结节CT影像标注规范', currentVersion: 'v1.1', createdAt: '2026-03-01T00:00:00Z' },
  { id: 2, projectId: 2, name: '乳腺癌分级规范', description: '乳腺癌HE染色病理分级标注规范', currentVersion: 'v1.0', createdAt: '2026-03-10T00:00:00Z' },
  { id: 3, projectId: 3, name: '舌诊标注规范', description: '中医舌诊标准化标注规范', currentVersion: 'v1.0', createdAt: '2026-04-01T00:00:00Z' },
  { id: 4, projectId: 4, name: 'BI-RADS标注规范', description: '乳腺超声BI-RADS分级标注规范', currentVersion: 'v1.0', createdAt: '2026-04-10T00:00:00Z' },
  { id: 5, projectId: 5, name: '中医病历标注规范', description: '中医电子病历命名实体识别标注规范', currentVersion: 'v1.0', createdAt: '2026-04-20T00:00:00Z' },
];

export const mockLabelSchemaVersions: LabelSchemaVersion[] = [
  {
    id: 1, schemaId: 1, version: 'v1.1', isActive: true, publishedAt: '2026-03-15T00:00:00Z',
    schemaDef: {
      categories: [
        { id: 101, name: '肺结节', color: '#f50', children: [
          { id: 1011, name: '实性结节', color: '#f50', attributes: [
            { id: 10111, name: '大小', type: 'select', options: [{ value: '<5mm', label: '<5mm' }, { value: '5-10mm', label: '5-10mm' }, { value: '10-30mm', label: '10-30mm' }, { value: '>30mm', label: '>30mm' }] },
            { id: 10112, name: '边缘', type: 'select', options: [{ value: 'smooth', label: '光滑' }, { value: 'lobulated', label: '分叶' }, { value: 'spiculated', label: '毛刺' }] },
          ]},
          { id: 1012, name: '部分实性结节', color: '#fa0' },
          { id: 1013, name: '磨玻璃结节', color: '#ff0' },
        ]},
        { id: 102, name: '胸膜增厚', color: '#0af' },
        { id: 103, name: '淋巴结', color: '#0a8' },
      ]
    }
  },
  {
    id: 2, schemaId: 3, version: 'v1.0', isActive: true, publishedAt: '2026-04-05T00:00:00Z',
    schemaDef: {
      categories: [
        { id: 301, name: '舌色', color: '#e64', children: [
          { id: 3011, name: '淡白舌', color: '#ddd' },
          { id: 3012, name: '淡红舌', color: '#e8a' },
          { id: 3013, name: '红舌', color: '#e44' },
          { id: 3014, name: '绛舌', color: '#a00' },
          { id: 3015, name: '紫青舌', color: '#608' },
        ]},
        { id: 302, name: '苔色', color: '#aa8', children: [
          { id: 3021, name: '白苔', color: '#eee' },
          { id: 3022, name: '黄苔', color: '#ed4' },
          { id: 3023, name: '灰黑苔', color: '#444' },
        ]},
        { id: 303, name: '苔质', color: '#8a8', children: [
          { id: 3031, name: '薄苔', color: '#afa' },
          { id: 3032, name: '厚苔', color: '#8a8' },
          { id: 3033, name: '腻苔', color: '#686' },
          { id: 3034, name: '剥苔', color: '#faa' },
        ]},
      ]
    }
  },
  {
    id: 3, schemaId: 4, version: 'v1.0', isActive: true, publishedAt: '2026-04-12T00:00:00Z',
    schemaDef: {
      categories: [
        { id: 401, name: 'BI-RADS 0', color: '#888', description: '评估不完整' },
        { id: 402, name: 'BI-RADS 1', color: '#0a0', description: '阴性' },
        { id: 403, name: 'BI-RADS 2', color: '#0a8', description: '良性' },
        { id: 404, name: 'BI-RADS 3', color: '#aa0', description: '可能良性' },
        { id: 405, name: 'BI-RADS 4a', color: '#fa0', description: '低度可疑' },
        { id: 406, name: 'BI-RADS 4b', color: '#e60', description: '中度可疑' },
        { id: 407, name: 'BI-RADS 4c', color: '#e40', description: '高度可疑' },
        { id: 408, name: 'BI-RADS 5', color: '#e00', description: '高度提示恶性' },
      ]
    }
  },
];

export const mockAnnotations: AnnotationRecord[] = [
  { id: 1, assignmentId: 1, dataItemId: 1, taskId: 1, annotatorId: 3, payloadType: 'bbox', payload: { x: 120, y: 150, width: 45, height: 38, label: 1011, confidence: 0.92 }, status: 'submitted', isArbitrated: false, sourceRecordIds: [], version: 1, createdAt: '2026-03-28T16:00:00Z', submittedAt: '2026-03-28T16:00:00Z', updatedAt: '2026-03-28T16:00:00Z' },
  { id: 2, assignmentId: 2, dataItemId: 2, taskId: 1, annotatorId: 3, payloadType: 'bbox', payload: { x: 250, y: 300, width: 30, height: 35, label: 1011, confidence: 0.88 }, status: 'approved', isArbitrated: false, sourceRecordIds: [], version: 1, createdAt: '2026-03-28T16:30:00Z', submittedAt: '2026-03-28T16:30:00Z', updatedAt: '2026-03-29T10:00:00Z' },
];

export const mockReviewRecords: ReviewRecord[] = [
  { id: 1, annotationId: 2, reviewerId: 4, reviewerName: '王建国', decision: 'approved', comments: '标注准确，结节形态描述清晰', reviewLevel: 1, createdAt: '2026-03-29T10:00:00Z' },
  { id: 2, annotationId: 1, reviewerId: 4, reviewerName: '王建国', decision: 'rejected', comments: '结节边缘标注偏大，请参照标注规范第3.2条重新调整', reviewLevel: 1, createdAt: '2026-03-30T14:00:00Z' },
];

export const mockAcceptanceRecords: AcceptanceRecord[] = [
  { id: 1, taskId: 4, acceptorId: 2, decision: 'accepted', sampleSize: 30, samplePassRate: 0.93, comments: '整体质量达标，同意验收', lockedAt: '2026-04-20T16:00:00Z', createdAt: '2026-04-20T16:00:00Z' },
];

export const mockQualityMetrics: QualityMetric[] = [
  { id: 1, projectId: 1, taskId: 1, metricType: 'kappa', metricValue: { overall: 0.82, perClass: { '1011': 0.85, '1012': 0.78 } }, scope: 'task', scopeId: '1', computedAt: '2026-04-28T00:00:00Z' },
  { id: 2, projectId: 1, metricType: 'iou', metricValue: { mean: 0.76, median: 0.81 }, scope: 'task', scopeId: '1', computedAt: '2026-04-28T00:00:00Z' },
  { id: 3, projectId: 1, metricType: 'pass_rate', metricValue: { rate: 0.85, reviewedCount: 300, passedCount: 255 }, scope: 'task', scopeId: '1', computedAt: '2026-04-28T00:00:00Z' },
  { id: 4, projectId: 1, metricType: 'avg_time', metricValue: { perItem: 185, perItemUnit: 'seconds' }, scope: 'task', scopeId: '1', computedAt: '2026-04-28T00:00:00Z' },
];

export const mockAuditLogs: AuditLog[] = [
  { logId: 1, timestamp: '2026-04-01T08:00:00Z', orgId: 1, projectId: 1, userId: 2, userName: '张明远', action: 'CREATE', targetType: 'task', targetId: '1', payloadDiff: { name: '肺结节检出_第一批' }, prevLogHash: '0'.repeat(64), currentHash: 'a'.repeat(64), clientIp: '192.168.1.100' },
  { logId: 2, timestamp: '2026-04-01T08:05:00Z', orgId: 1, projectId: 1, userId: 2, userName: '张明远', action: 'PUBLISH', targetType: 'task', targetId: '1', payloadDiff: { status: 'draft→published' }, prevLogHash: 'a'.repeat(64), currentHash: 'b'.repeat(64), clientIp: '192.168.1.100' },
  { logId: 3, timestamp: '2026-04-02T09:00:00Z', orgId: 1, projectId: 1, userId: 3, userName: '李雪梅', action: 'CLAIM', targetType: 'assignment', targetId: '1', payloadDiff: { status: 'pending→in_progress' }, prevLogHash: 'b'.repeat(64), currentHash: 'c'.repeat(64), clientIp: '192.168.1.101' },
  { logId: 4, timestamp: '2026-04-05T16:00:00Z', orgId: 1, projectId: 1, userId: 3, userName: '李雪梅', action: 'SUBMIT', targetType: 'annotation', targetId: '1', payloadDiff: { status: 'draft→submitted' }, prevLogHash: 'c'.repeat(64), currentHash: 'd'.repeat(64), clientIp: '192.168.1.101' },
];

export const mockAIModels: AIModel[] = [
  { id: 1, name: '肺结节检测 v2.3', modality: 'ct', taskType: 'detection', version: '2.3.0', status: 'production', confidenceDefault: 0.7, perfMetrics: { mAP: 0.856, recall: 0.892, precision: 0.834 }, createdAt: '2026-02-15T00:00:00Z' },
  { id: 2, name: '眼底病灶分割 v1.1', modality: 'fundus', taskType: 'segmentation', version: '1.1.0', status: 'production', confidenceDefault: 0.75, perfMetrics: { dice: 0.812, iou: 0.723 }, createdAt: '2026-01-20T00:00:00Z' },
  { id: 3, name: '舌象体质分类 v1.0', modality: 'tongue', taskType: 'classification', version: '1.0.0', status: 'shadow', confidenceDefault: 0.8, perfMetrics: { accuracy: 0.78, f1: 0.76 }, createdAt: '2026-03-10T00:00:00Z' },
  { id: 4, name: '乳腺癌分级 v2.0', modality: 'wsi', taskType: 'classification', version: '2.0.0', status: 'production', confidenceDefault: 0.7, perfMetrics: { accuracy: 0.88, f1: 0.86 }, createdAt: '2026-02-01T00:00:00Z' },
];
