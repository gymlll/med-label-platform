from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/v1/notifications')


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify([n.to_dict() for n in notifs])


@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notification_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({'code': 'NOT_FOUND', 'message': '通知不存在'}), 404
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': '已标记已读'})


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': '全部标记已读'})
