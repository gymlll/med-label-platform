from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
import hashlib

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'code': 'INVALID_INPUT', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    full_name = data.get('fullName', '').strip()
    email = data.get('email', '').strip()
    title = data.get('title', '')
    department = data.get('department', '')

    if not username or not password:
        return jsonify({'code': 'VALIDATION_ERROR', 'message': '用户名和密码不能为空'}), 422
    if len(username) < 3:
        return jsonify({'code': 'VALIDATION_ERROR', 'message': '用户名至少3个字符'}), 422
    if len(password) < 6:
        return jsonify({'code': 'VALIDATION_ERROR', 'message': '密码至少6个字符'}), 422

    if User.query.filter_by(username=username).first():
        return jsonify({'code': 'DUPLICATE', 'message': '用户名已存在'}), 409

    user = User(
        username=username,
        full_name=full_name or username,
        email=email,
        title=title,
        department=department,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'code': 'INVALID_INPUT', 'message': '请求数据为空'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'code': 'VALIDATION_ERROR', 'message': '用户名和密码不能为空'}), 422

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'code': 'AUTH_FAILED', 'message': '用户名或密码错误'}), 401

    if user.status != 'active':
        return jsonify({'code': 'USER_DISABLED', 'message': '账户已被禁用'}), 403

    user.last_login_at = datetime.now(timezone.utc)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_dict()})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'code': 'NOT_FOUND', 'message': '用户不存在'}), 404
    return jsonify(user.to_dict())


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': '已退出登录'})
