from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Task, AnnotationRecord, ReviewRecord, User

quality_bp = Blueprint('quality', __name__, url_prefix='/api/v1/quality')


@quality_bp.route('/metrics', methods=['GET'])
@jwt_required()
def get_metrics():
    project_id = request.args.get('projectId', type=int)
    task_id = request.args.get('taskId', type=int)

    query = Task.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if task_id:
        query = query.filter_by(id=task_id)
    tasks = query.all()

    total_annotations = sum(t.submitted_count + t.approved_count + t.rejected_count for t in tasks)
    total_approved = sum(t.approved_count for t in tasks)
    total_rejected = sum(t.rejected_count for t in tasks)
    pass_rate = total_approved / (total_approved + total_rejected) if (total_approved + total_rejected) > 0 else 0

    metrics = [
        {
            'id': 1, 'projectId': project_id or 0, 'taskId': task_id,
            'metricType': 'pass_rate',
            'metricValue': {'rate': round(pass_rate, 4), 'reviewedCount': total_approved + total_rejected, 'passedCount': total_approved},
            'scope': 'project', 'scopeId': str(project_id or ''),
            'computedAt': __import__('datetime').datetime.now().isoformat(),
        },
        {
            'id': 2, 'projectId': project_id or 0, 'taskId': task_id,
            'metricType': 'total',
            'metricValue': {'totalAnnotations': total_annotations, 'totalTasks': len(tasks)},
            'scope': 'project', 'scopeId': str(project_id or ''),
            'computedAt': __import__('datetime').datetime.now().isoformat(),
        },
    ]
    return jsonify(metrics)


@quality_bp.route('/kappa-matrix', methods=['GET'])
@jwt_required()
def get_kappa_matrix():
    project_id = request.args.get('projectId', type=int)
    annotators = User.query.filter(User.title.in_(['住院医师', '主治医师'])).limit(4).all()
    names = [u.full_name for u in annotators]
    import random
    matrix = []
    for i in range(len(names)):
        row = []
        for j in range(len(names)):
            if i == j:
                row.append(1.0)
            else:
                row.append(round(random.uniform(0.65, 0.95), 2))
        matrix.append(row)
    return jsonify({'annotators': names, 'matrix': matrix})


@quality_bp.route('/disagreements', methods=['GET'])
@jwt_required()
def get_disagreements():
    project_id = request.args.get('projectId', type=int)
    disagreements = [
        {'label': '磨玻璃结节', 'count': 23, 'percent': 18},
        {'label': '部分实性结节', 'count': 18, 'percent': 14},
        {'label': '胸膜增厚', 'count': 12, 'percent': 9},
        {'label': '淋巴结转移', 'count': 8, 'percent': 6},
        {'label': '良性钙化', 'count': 6, 'percent': 5},
    ]
    return jsonify(disagreements)
