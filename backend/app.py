import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 确保 upload 目录存在
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.WSI_BASE_DIR, exist_ok=True)
    os.makedirs(Config.DICOM_BASE_DIR, exist_ok=True)

    # 初始化扩展
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    # 注册蓝图
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.projects import projects_bp
    from routes.datasets import datasets_bp
    from routes.tasks import tasks_bp
    from routes.annotations import annotations_bp
    from routes.reviews import reviews_bp
    from routes.quality import quality_bp
    from routes.audit import audit_bp
    from routes.ai_models import ai_bp
    from routes.acceptance import acceptance_bp
    from routes.dashboard import dashboard_bp
    from routes.notifications import notifications_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(datasets_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(annotations_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(quality_bp)
    app.register_blueprint(audit_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(acceptance_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notifications_bp)

    # 健康检查
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': '医学数据标注平台后端服务运行中'}

    # 创建数据库表
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    print('* 后端服务启动: http://localhost:5001')
    print('* API 文档: http://localhost:5001/api/health')
    app.run(host='0.0.0.0', port=5001, debug=True)
