import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AnnotationRecord, Task, TaskAssignment

annotations_bp = Blueprint('annotations', __name__, url_prefix='/api/v1/annotations')


@annotations_bp.route('', methods=['GET'])
@jwt_required()
def list_annotations():
    data_item_id = request.args.get('dataItemId', type=int)
    task_id = request.args.get('taskId', type=int)
    query = AnnotationRecord.query
    if data_item_id:
        query = query.filter_by(data_item_id=data_item_id)
    if task_id:
        query = query.filter_by(task_id=task_id)
    annotations = query.order_by(AnnotationRecord.id.desc()).all()
    return jsonify([a.to_dict() for a in annotations])


@annotations_bp.route('', methods=['POST'])
@jwt_required()
def create_annotation():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    annotation = AnnotationRecord(
        data_item_id=data['dataItemId'],
        task_id=data['taskId'],
        annotator_id=user_id,
        payload_type=data.get('payloadType', 'bbox'),
        payload=json.dumps(data.get('payload', {}), ensure_ascii=False),
        status='draft',
    )
    if data.get('submitImmediately'):
        annotation.status = 'submitted'
        annotation.submitted_at = datetime.now(timezone.utc)
        task = Task.query.get(data['taskId'])
        if task:
            task.submitted_count = (task.submitted_count or 0) + 1

    db.session.add(annotation)
    db.session.commit()
    return jsonify(annotation.to_dict()), 201


@annotations_bp.route('/<int:annotation_id>', methods=['PATCH'])
@jwt_required()
def update_annotation(annotation_id):
    annotation = AnnotationRecord.query.get_or_404(annotation_id)
    data = request.get_json()
    if 'payload' in data:
        annotation.payload = json.dumps(data['payload'], ensure_ascii=False)
    if 'status' in data:
        annotation.status = data['status']
        if data['status'] == 'submitted':
            annotation.submitted_at = datetime.now(timezone.utc)
    annotation.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(annotation.to_dict())


@annotations_bp.route('/<int:annotation_id>', methods=['DELETE'])
@jwt_required()
def delete_annotation(annotation_id):
    annotation = AnnotationRecord.query.get_or_404(annotation_id)
    db.session.delete(annotation)
    db.session.commit()
    return jsonify({'message': '标注已删除'})


@annotations_bp.route('/<int:annotation_id>/submit', methods=['POST'])
@jwt_required()
def submit_annotation(annotation_id):
    annotation = AnnotationRecord.query.get_or_404(annotation_id)
    annotation.status = 'submitted'
    annotation.submitted_at = datetime.now(timezone.utc)

    task = Task.query.get(annotation.task_id)
    if task:
        task.submitted_count = (task.submitted_count or 0) + 1
        task.in_progress_count = max(0, (task.in_progress_count or 1) - 1)
    db.session.commit()
    return jsonify(annotation.to_dict())
