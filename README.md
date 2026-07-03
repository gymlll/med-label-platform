# 医学多模态数据标注平台

> 支持 NMPA/FDA 合规要求的医学影像与中医数据标注系统

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 + TypeScript + Ant Design 5 + ECharts |
| **后端** | Flask + SQLAlchemy + JWT + Flask-CORS |
| **数据库** | SQLite（可无缝切换 PostgreSQL） |

## 快速启动

### 1. 启动后端

```bash
cd backend
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended werkzeug
python seed.py      # 初始化种子数据（仅首次）
python app.py       # 启动后端 → http://localhost:5060
```

### 2. 启动前端

```bash
npm install
npm run dev         # 启动前端 → http://localhost:5173
```

### 3. 访问系统

打开浏览器访问 **http://localhost:5173**

## 演示账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 系统管理员 |
| zhang | 123456 | 主任医师 / 项目经理 |
| li | 123456 | 主治医师 / 标注员 |
| wang | 123456 | 副主任医师 / 审核员 |
| chen | 123456 | 住院医师 / 标注员 |
| liu | 123456 | 住院医师 / 标注员 |
| sun | 123456 | 住院医师 / 标注员 |

也可以直接在登录页点击 **"注册新账号"** 创建用户。

## 功能模块

### 标注过程管理
- 项目与数据集管理（创建、多模态适配、版本控制）
- 标签体系管理（医疗专业术语、中医特色标签、层级关系）
- 任务发布与分配（自动均分、手动指派、盲法标注）
- 个人工作台（任务认领、暂存草稿、进度跟踪）
- 多方协同标注（并行双盲、序贯流水线、分歧仲裁）
- 全生命周期状态追踪

### 标注结果管理
- 标注结果统一管理（多格式导出 COCO / Pascal VOC / DICOM-SR）
- 审核流程（通过/驳回/多级审核，标注-审核闭环）
- 质量监控（Fleiss' Kappa、IoU 分布、混淆矩阵）
- 任务验收（抽样检查、数据锁定、防篡改）
- 审计证据链（SHA-256 哈希链 + RFC 3161 时间戳）

### 标注工具
- 医学影像标注（DICOM 窗宽窗位、MPR、序列浏览）
- 病理 WSI 标注（金字塔多分辨率、缩放导航）
- 多模态工具（波形、文本 NER、舌象分类、视频标注）
- AI 辅助标注（预标注引擎、置信度过滤、主动学习）
- 高性能标注画布（图层管理、快捷键、多视图联动）

### 平台支撑
- 用户与权限管理（RBAC、机构/项目级角色）
- 系统配置（安全策略、集成服务、合规配置）
- 数据安全（传输加密、存储加密、脱敏策略）
- RESTful API（供第三方 AI 平台调用）

## 项目结构

```
med-label-platform/
├── backend/                    # Flask 后端
│   ├── app.py                  # 应用入口
│   ├── config.py               # 配置
│   ├── models.py               # 数据模型（8 张表）
│   ├── seed.py                 # 种子数据
│   └── routes/                 # API 路由
│       ├── auth.py             # 注册/登录/JWT
│       ├── projects.py         # 项目管理
│       ├── datasets.py         # 数据集管理
│       ├── tasks.py            # 任务管理
│       ├── annotations.py      # 标注记录
│       ├── reviews.py          # 审核流程
│       ├── acceptance.py       # 验收管理
│       ├── quality.py          # 质量监控
│       ├── audit.py            # 审计日志
│       ├── ai_models.py        # AI 模型
│       ├── notifications.py    # 通知系统
│       └── dashboard.py        # 工作台统计
│
├── src/                        # React 前端
│   ├── pages/                  # 12 个功能页面
│   ├── components/             # 布局组件
│   ├── services/api.ts         # API 对接层
│   └── types/                  # TypeScript 类型
│
├── public/buaa_logo.png        # 北航 logo
└── vite.config.ts
```

## 合规标准

- NMPA《医疗器械软件注册审查指导原则》
- FDA 21 CFR Part 11
- 等保三级
- 审计日志哈希链 + 关键节点 TSA 时间戳签名
