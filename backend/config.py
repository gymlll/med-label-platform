import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'med-label-platform-secret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{os.path.join(BASE_DIR, "medlabel.db")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = 3600 * 2  # 2 小时
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500MB
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    WSI_BASE_DIR = os.path.join(BASE_DIR, 'data', 'wsi')
    DICOM_BASE_DIR = os.path.join(BASE_DIR, 'data', 'dicom')
