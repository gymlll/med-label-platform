from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, User

users_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')


@users_bp.route('', methods=['GET'])
@jwt_required()
def list_users():
    department = request.args.get('department')
    query = User.query
    if department:
        query = query.filter_by(department=department)
    query = query.filter_by(status='active')
    users = query.order_by(User.id).all()
    return jsonify({
        'total': len(users),
        'page': 1,
        'pageSize': len(users),
        'items': [u.to_dict() for u in users]
    })


@users_bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'code': 'DUPLICATE', 'message': '用户名已存在'}), 409

    user = User(
        username=data['username'],
        full_name=data.get('fullName', ''),
        email=data.get('email'),
        phone=data.get('phone'),
        title=data.get('title'),
        department=data.get('department'),
    )
    user.set_password(data.get('password', '123456'))
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@users_bp.route('/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    for field in ['full_name', 'email', 'phone', 'title', 'department', 'status']:
        if field in data:
            setattr(user, field, data[field])
    if 'fullName' in data:
        user.full_name = data['fullName']
    db.session.commit()
    return jsonify(user.to_dict())
