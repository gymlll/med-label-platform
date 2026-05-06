from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, User, Dataset, Task

projects_bp = Blueprint('projects', __name__, url_prefix='/api/v1/projects')


@projects_bp.route('', methods=['GET'])
@jwt_required()
def list_projects():
    status = request.args.get('status')
    query = Project.query
    if status:
        query = query.filter_by(status=status)
    projects = query.order_by(Project.id.desc()).all()
    return jsonify({
        'total': len(projects),
        'page': 1,
        'pageSize': len(projects),
        'items': [p.to_dict() for p in projects]
    })


@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    project = Project(
        code=data.get('code', ''),
        name=data['name'],
        description=data.get('description', ''),
        research_type=data.get('researchType', ''),
        created_by=user_id,
    )
    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201


@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())


@projects_bp.route('/<int:project_id>', methods=['PATCH'])
@jwt_required()
def update_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'status' in data:
        project.status = data['status']
    project.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(project.to_dict())


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    project.status = 'closed'
    db.session.commit()
    return jsonify({'message': '项目已关闭'})


# 项目下的数据集
@projects_bp.route('/<int:project_id>/datasets', methods=['GET'])
@jwt_required()
def list_project_datasets(project_id):
    datasets = Dataset.query.filter_by(project_id=project_id).order_by(Dataset.id.desc()).all()
    return jsonify({
        'total': len(datasets),
        'page': 1,
        'pageSize': len(datasets),
        'items': [d.to_dict() for d in datasets]
    })


# 项目下的任务
@projects_bp.route('/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def list_project_tasks(project_id):
    tasks = Task.query.filter_by(project_id=project_id).order_by(Task.id.desc()).all()
    return jsonify({
        'total': len(tasks),
        'page': 1,
        'pageSize': len(tasks),
        'items': [t.to_dict() for t in tasks]
    })


# 项目仪表盘数据
@projects_bp.route('/<int:project_id>/quality/dashboard', methods=['GET'])
@jwt_required()
def quality_dashboard(project_id):
    tasks = Task.query.filter_by(project_id=project_id).all()
    total_annotations = sum(t.submitted_count + t.approved_count + t.rejected_count for t in tasks)
    total_approved = sum(t.approved_count for t in tasks)
    pass_rate = total_approved / total_annotations if total_annotations > 0 else 0
    return jsonify({
        'totalAnnotations': total_annotations,
        'passRate': round(pass_rate, 4),
        'totalTasks': len(tasks),
        'activeTasks': sum(1 for t in tasks if t.status == 'in_progress'),
    })
