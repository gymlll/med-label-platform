import uuid
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# ==================== 用户与权限 ====================
class Organization(db.Model):
    __tablename__ = 'organizations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    code = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(32), default='active')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), default=1)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(32))
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(128))
    title = db.Column(db.String(64))  # 职称
    department = db.Column(db.String(128))  # 科室
    status = db.Column(db.String(32), default='active')
    last_login_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id, 'orgId': self.org_id, 'username': self.username,
            'fullName': self.full_name, 'email': self.email, 'phone': self.phone,
            'title': self.title, 'department': self.department,
            'status': self.status, 'lastLoginAt': self.last_login_at.isoformat() if self.last_login_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, default=1)
    code = db.Column(db.String(64), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    research_type = db.Column(db.String(64))
    status = db.Column(db.String(32), default='active')
    member_count = db.Column(db.Integer, default=0)
    dataset_count = db.Column(db.Integer, default=0)
    task_count = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'orgId': self.org_id, 'code': self.code,
            'name': self.name, 'description': self.description,
            'researchType': self.research_type, 'status': self.status,
            'memberCount': self.member_count, 'datasetCount': self.dataset_count,
            'taskCount': self.task_count, 'createdBy': self.created_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Dataset(db.Model):
    __tablename__ = 'datasets'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    modality = db.Column(db.String(64), nullable=False)
    status = db.Column(db.String(32), default='active')
    item_count = db.Column(db.Integer, default=0)
    total_size = db.Column(db.BigInteger, default=0)
    file_format = db.Column(db.String(32))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'projectId': self.project_id, 'name': self.name,
            'description': self.description, 'modality': self.modality,
            'status': self.status, 'itemCount': self.item_count,
            'totalSize': self.total_size, 'fileFormat': self.file_format,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(32), default='normal')
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id'))
    label_schema_id = db.Column(db.Integer)
    status = db.Column(db.String(32), default='draft')
    annotator_count = db.Column(db.Integer, default=0)
    total_items = db.Column(db.Integer, default=0)
    pending_count = db.Column(db.Integer, default=0)
    in_progress_count = db.Column(db.Integer, default=0)
    submitted_count = db.Column(db.Integer, default=0)
    approved_count = db.Column(db.Integer, default=0)
    rejected_count = db.Column(db.Integer, default=0)
    deadline = db.Column(db.DateTime, nullable=True)
    ai_assist_enabled = db.Column(db.Boolean, default=False)
    blind_mode_enabled = db.Column(db.Boolean, default=False)
    tsa_enabled = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    published_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id, 'projectId': self.project_id, 'name': self.name,
            'type': self.type, 'datasetId': self.dataset_id,
            'labelSchemaId': self.label_schema_id, 'status': self.status,
            'annotatorCount': self.annotator_count, 'totalItems': self.total_items,
            'progress': {
                'pending': self.pending_count, 'inProgress': self.in_progress_count,
                'submitted': self.submitted_count, 'approved': self.approved_count,
                'rejected': self.rejected_count,
            },
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'aiAssistEnabled': self.ai_assist_enabled,
            'blindModeEnabled': self.blind_mode_enabled,
            'tsaEnabled': self.tsa_enabled,
            'createdBy': self.created_by,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
        }


class TaskAssignment(db.Model):
    __tablename__ = 'task_assignments'
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    data_item_id = db.Column(db.Integer, nullable=False)
    annotator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(32), default='pending')
    assigned_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = db.Column(db.DateTime, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id, 'taskId': self.task_id, 'dataItemId': self.data_item_id,
            'annotatorId': self.annotator_id, 'status': self.status,
            'assignedAt': self.assigned_at.isoformat() if self.assigned_at else None,
            'startedAt': self.started_at.isoformat() if self.started_at else None,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None,
        }


class AnnotationRecord(db.Model):
    __tablename__ = 'annotation_records'
    id = db.Column(db.Integer, primary_key=True)
    data_item_id = db.Column(db.Integer, nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    annotator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    payload_type = db.Column(db.String(32), nullable=False)
    payload = db.Column(db.Text, default='{}')
    ai_model_id = db.Column(db.Integer, nullable=True)
    ai_confidence = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(32), default='draft')
    is_arbitrated = db.Column(db.Boolean, default=False)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    submitted_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json
        return {
            'id': self.id, 'dataItemId': self.data_item_id, 'taskId': self.task_id,
            'annotatorId': self.annotator_id, 'payloadType': self.payload_type,
            'payload': json.loads(self.payload) if self.payload else {},
            'aiModelId': self.ai_model_id, 'aiConfidence': self.ai_confidence,
            'status': self.status, 'isArbitrated': self.is_arbitrated,
            'version': self.version,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'submittedAt': self.submitted_at.isoformat() if self.submitted_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class ReviewRecord(db.Model):
    __tablename__ = 'review_records'
    id = db.Column(db.Integer, primary_key=True)
    annotation_id = db.Column(db.Integer, db.ForeignKey('annotation_records.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    decision = db.Column(db.String(32), nullable=False)
    comments = db.Column(db.Text)
    review_level = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'annotationId': self.annotation_id,
            'reviewerId': self.reviewer_id, 'decision': self.decision,
            'comments': self.comments, 'reviewLevel': self.review_level,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id, 'userId': self.user_id, 'title': self.title,
            'content': self.content, 'isRead': self.is_read,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    log_id = db.Column(db.Integer, unique=True, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    org_id = db.Column(db.Integer, default=1)
    project_id = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, nullable=False)
    user_name = db.Column(db.String(255))
    action = db.Column(db.String(64), nullable=False)
    target_type = db.Column(db.String(64), nullable=False)
    target_id = db.Column(db.String(128))
    payload_diff = db.Column(db.Text)
    prev_log_hash = db.Column(db.String(64))
    current_hash = db.Column(db.String(64))
    client_ip = db.Column(db.String(45))

    def to_dict(self):
        import json
        return {
            'logId': self.log_id, 'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'orgId': self.org_id, 'projectId': self.project_id,
            'userId': self.user_id, 'userName': self.user_name,
            'action': self.action, 'targetType': self.target_type,
            'targetId': self.target_id,
            'payloadDiff': json.loads(self.payload_diff) if self.payload_diff else {},
            'prevLogHash': self.prev_log_hash, 'currentHash': self.current_hash,
            'clientIp': self.client_ip,
        }
