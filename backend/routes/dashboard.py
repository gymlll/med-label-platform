from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import db, Project, Task, User, AnnotationRecord

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/v1/dashboard')


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    active_projects = Project.query.filter_by(status='active').count()
    total_tasks = Task.query.count()
    active_tasks = Task.query.filter_by(status='in_progress').count()
    total_annotators = User.query.count()
    total_annotations = AnnotationRecord.query.count()
    total_approved = AnnotationRecord.query.filter_by(status='approved').count()
    total_reviewed = AnnotationRecord.query.filter(
        AnnotationRecord.status.in_(['approved', 'rejected'])
    ).count()
    pass_rate = total_approved / total_reviewed if total_reviewed > 0 else 0

    return jsonify({
        'activeProjects': active_projects,
        'totalTasks': total_tasks,
        'activeTasks': active_tasks,
        'totalAnnotators': total_annotators,
        'totalAnnotations': total_annotations,
        'passRate': round(pass_rate, 4),
        'avgKappa': 0.78,
    })


@dashboard_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_activities():
    recent_annotations = AnnotationRecord.query.order_by(
        AnnotationRecord.updated_at.desc()
    ).limit(6).all()

    activities = []
    for a in recent_annotations:
        user = User.query.get(a.annotator_id)
        task = Task.query.get(a.task_id)
        activities.append({
            'id': a.id,
            'userId': a.annotator_id,
            'userName': user.full_name if user else '未知',
            'action': {
                'draft': '暂存标注', 'submitted': '提交标注',
                'approved': '标注通过', 'rejected': '标注驳回',
            }.get(a.status, a.status),
            'target': f'数据#{a.data_item_id}',
            'time': a.updated_at.isoformat() if a.updated_at else '',
            'project': task.name if task else '',
        })

    return jsonify(activities)


@dashboard_bp.route('/task-distribution', methods=['GET'])
@jwt_required()
def get_task_distribution():
    tasks = Task.query.order_by(Task.id.desc()).limit(5).all()
    return jsonify([
        {'name': t.name, 'completed': (t.approved_count or 0) + (t.submitted_count or 0), 'total': t.total_items or 0}
        for t in tasks
    ])
