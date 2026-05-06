from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, TaskAssignment, Dataset, User

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/v1/tasks')


@tasks_bp.route('', methods=['GET'])
@jwt_required()
def list_tasks():
    project_id = request.args.get('projectId', type=int)
    status = request.args.get('status')
    query = Task.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    if status:
        query = query.filter_by(status=status)
    tasks = query.order_by(Task.id.desc()).all()
    result = []
    for t in tasks:
        d = t.to_dict()
        ds = Dataset.query.get(t.dataset_id)
        d['datasetName'] = ds.name if ds else ''
        d['labelSchemaName'] = ''
        result.append(d)
    return jsonify({'total': len(result), 'page': 1, 'pageSize': len(result), 'items': result})


@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    task = Task(
        project_id=data['projectId'],
        name=data['name'],
        type=data.get('type', 'normal'),
        dataset_id=data.get('datasetId'),
        label_schema_id=data.get('labelSchemaId'),
        deadline=datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data.get('deadline') else None,
        ai_assist_enabled=data.get('aiAssistEnabled', False),
        blind_mode_enabled=data.get('blindModeEnabled', False),
        tsa_enabled=data.get('tsaEnabled', False),
        total_items=data.get('totalItems', 0),
        pending_count=data.get('totalItems', 0),
        created_by=user_id,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    d = task.to_dict()
    ds = Dataset.query.get(task.dataset_id)
    d['datasetName'] = ds.name if ds else ''
    return jsonify(d)


@tasks_bp.route('/<int:task_id>/publish', methods=['POST'])
@jwt_required()
def publish_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.status = 'published'
    task.published_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(task.to_dict())


@tasks_bp.route('/<int:task_id>/terminate', methods=['POST'])
@jwt_required()
def terminate_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.status = 'terminated'
    db.session.commit()
    return jsonify(task.to_dict())


@tasks_bp.route('/<int:task_id>/assign', methods=['POST'])
@jwt_required()
def assign_task(task_id):
    data = request.get_json()
    task = Task.query.get_or_404(task_id)
    annotator_ids = data.get('annotatorIds', [])
    start_index = data.get('startIndex', 0)

    for i, annotator_id in enumerate(annotator_ids):
        assignment = TaskAssignment(
            task_id=task_id,
            data_item_id=start_index + i + 1,
            annotator_id=annotator_id,
        )
        db.session.add(assignment)

    task.annotator_count = len(annotator_ids)
    task.status = 'published'
    task.published_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'message': '分配成功', 'assigned': len(annotator_ids)})


@tasks_bp.route('/<int:task_id>/assignments', methods=['GET'])
@jwt_required()
def get_assignments(task_id):
    assignments = TaskAssignment.query.filter_by(task_id=task_id).all()
    items = []
    for a in assignments:
        d = a.to_dict()
        user = User.query.get(a.annotator_id)
        d['annotatorName'] = user.full_name if user else ''
        items.append(d)
    return jsonify(items)


@tasks_bp.route('/assignments/me', methods=['GET'])
@jwt_required()
def my_assignments():
    user_id = int(get_jwt_identity())
    assignments = TaskAssignment.query.filter_by(annotator_id=user_id).all()
    items = []
    for a in assignments:
        d = a.to_dict()
        user = User.query.get(a.annotator_id)
        d['annotatorName'] = user.full_name if user else ''
        items.append(d)
    return jsonify(items)


@tasks_bp.route('/assignments/<int:assignment_id>/claim', methods=['POST'])
@jwt_required()
def claim_assignment(assignment_id):
    assignment = TaskAssignment.query.get_or_404(assignment_id)
    assignment.status = 'in_progress'
    assignment.started_at = datetime.now(timezone.utc)
    task = Task.query.get(assignment.task_id)
    if task:
        task.in_progress_count = (task.in_progress_count or 0) + 1
        task.pending_count = max(0, (task.pending_count or 1) - 1)
        if task.status == 'published':
            task.status = 'in_progress'
    db.session.commit()
    return jsonify({'message': '认领成功'})
