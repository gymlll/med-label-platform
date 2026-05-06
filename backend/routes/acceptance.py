from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task

acceptance_bp = Blueprint('acceptance', __name__, url_prefix='/api/v1/acceptance')


@acceptance_bp.route('', methods=['POST'])
@jwt_required()
def create_acceptance():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    task_id = data['taskId']
    task = Task.query.get_or_404(task_id)

    record = {
        'id': int(datetime.now().timestamp()),
        'taskId': task_id,
        'acceptorId': user_id,
        'decision': data.get('decision', 'accepted'),
        'sampleSize': data.get('sampleSize', 0),
        'samplePassRate': data.get('samplePassRate', 0.0),
        'comments': data.get('comments', ''),
        'createdAt': datetime.now(timezone.utc).isoformat(),
    }

    if data.get('decision') == 'accepted':
        task.status = 'accepted'
        task.completed_at = datetime.now(timezone.utc)
        db.session.commit()

    return jsonify(record), 201


@acceptance_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_acceptance(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify({
        'id': int(datetime.now().timestamp()),
        'taskId': task_id,
        'decision': 'accepted' if task.status == 'accepted' else None,
        'createdAt': task.completed_at.isoformat() if task.completed_at else None,
    })
