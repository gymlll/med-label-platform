import hashlib
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AuditLog, User

audit_bp = Blueprint('audit', __name__, url_prefix='/api/v1/audit')

ZERO_HASH = '0' * 64


def compute_hash(prev_hash, timestamp, user_id, action, target_type, target_id, diff_str):
    msg = (prev_hash + timestamp + str(user_id) + action + target_type + str(target_id) + diff_str)
    return hashlib.sha256(msg.encode('utf-8')).hexdigest()


def create_audit_log(user_id, user_name, action, target_type, target_id, diff=None, project_id=None, client_ip=''):
    last_log = AuditLog.query.order_by(AuditLog.log_id.desc()).first()
    prev_hash = last_log.current_hash if last_log else ZERO_HASH
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()
    diff_str = json.dumps(diff or {}, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    current_hash = compute_hash(prev_hash, now_str, user_id, action, target_type, target_id, diff_str)

    log = AuditLog(
        log_id=(last_log.log_id + 1) if last_log else 1,
        timestamp=now,
        org_id=1,
        project_id=project_id,
        user_id=user_id,
        user_name=user_name,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        payload_diff=json.dumps(diff, ensure_ascii=False) if diff else '{}',
        prev_log_hash=prev_hash,
        current_hash=current_hash,
        client_ip=client_ip or '127.0.0.1',
    )
    db.session.add(log)
    db.session.commit()
    return log


@audit_bp.route('/logs', methods=['GET'])
@jwt_required()
def list_logs():
    project_id = request.args.get('projectId', type=int)
    action = request.args.get('action')
    query = AuditLog.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if action:
        query = query.filter_by(action=action)
    logs = query.order_by(AuditLog.log_id.desc()).limit(100).all()
    return jsonify({
        'total': len(logs),
        'page': 1,
        'pageSize': len(logs),
        'items': [l.to_dict() for l in logs]
    })


@audit_bp.route('/reports', methods=['POST'])
@jwt_required()
def generate_report():
    project_id = request.args.get('projectId', type=int) or request.json.get('projectId')
    return jsonify({
        'message': '审计报告生成中',
        'reportUrl': f'/api/reports/audit_{project_id}.zip',
        'status': 'processing',
    })
