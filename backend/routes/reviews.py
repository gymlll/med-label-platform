from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ReviewRecord, AnnotationRecord, Task

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/v1/reviews')


@reviews_bp.route('', methods=['GET'])
@jwt_required()
def list_reviews():
    reviewer_id = request.args.get('reviewerId', type=int)
    query = ReviewRecord.query
    if reviewer_id:
        query = query.filter_by(reviewer_id=reviewer_id)
    reviews = query.order_by(ReviewRecord.id.desc()).all()
    return jsonify([r.to_dict() for r in reviews])


@reviews_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    review = ReviewRecord(
        annotation_id=data['annotationId'],
        reviewer_id=user_id,
        decision=data['decision'],
        comments=data.get('comments', ''),
        review_level=data.get('reviewLevel', 1),
    )
    db.session.add(review)

    annotation = AnnotationRecord.query.get(data['annotationId'])
    if annotation:
        if data['decision'] == 'approved':
            annotation.status = 'approved'
            task = Task.query.get(annotation.task_id)
            if task:
                task.approved_count = (task.approved_count or 0) + 1
                task.submitted_count = max(0, (task.submitted_count or 1) - 1)
        elif data['decision'] == 'rejected':
            annotation.status = 'rejected'
            task = Task.query.get(annotation.task_id)
            if task:
                task.rejected_count = (task.rejected_count or 0) + 1
                task.submitted_count = max(0, (task.submitted_count or 1) - 1)

    db.session.commit()
    return jsonify(review.to_dict()), 201


@reviews_bp.route('/<int:review_id>', methods=['GET'])
@jwt_required()
def get_review(review_id):
    review = ReviewRecord.query.get_or_404(review_id)
    return jsonify(review.to_dict())
