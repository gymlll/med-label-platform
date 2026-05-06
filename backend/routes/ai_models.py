from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

ai_bp = Blueprint('ai', __name__, url_prefix='/api/v1/ai')

# 内置模型数据
BUILTIN_MODELS = [
    {'id': 1, 'name': '肺结节检测 v2.3', 'modality': 'ct', 'taskType': 'detection',
     'version': '2.3.0', 'status': 'production', 'confidenceDefault': 0.7,
     'perfMetrics': {'mAP': 0.856, 'recall': 0.892, 'precision': 0.834},
     'createdAt': '2026-02-15T00:00:00Z'},
    {'id': 2, 'name': '眼底病灶分割 v1.1', 'modality': 'fundus', 'taskType': 'segmentation',
     'version': '1.1.0', 'status': 'production', 'confidenceDefault': 0.75,
     'perfMetrics': {'dice': 0.812, 'iou': 0.723},
     'createdAt': '2026-01-20T00:00:00Z'},
    {'id': 3, 'name': '舌象体质分类 v1.0', 'modality': 'tongue', 'taskType': 'classification',
     'version': '1.0.0', 'status': 'shadow', 'confidenceDefault': 0.8,
     'perfMetrics': {'accuracy': 0.78, 'f1': 0.76},
     'createdAt': '2026-03-10T00:00:00Z'},
    {'id': 4, 'name': '乳腺癌分级 v2.0', 'modality': 'wsi', 'taskType': 'classification',
     'version': '2.0.0', 'status': 'production', 'confidenceDefault': 0.7,
     'perfMetrics': {'accuracy': 0.88, 'f1': 0.86},
     'createdAt': '2026-02-01T00:00:00Z'},
]


@ai_bp.route('/models', methods=['GET'])
@jwt_required()
def list_models():
    modality = request.args.get('modality')
    models = BUILTIN_MODELS
    if modality:
        models = [m for m in models if m['modality'] == modality]
    return jsonify(models)


@ai_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    data = request.get_json()
    model_id = data.get('modelId')
    model = next((m for m in BUILTIN_MODELS if m['id'] == model_id), None)
    if not model:
        return jsonify({'code': 'NOT_FOUND', 'message': '模型不存在'}), 404
    return jsonify({
        'predictions': [],
        'confidence': model['confidenceDefault'],
        'processingTime': 1200,
        'modelName': model['name'],
    })
