from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Dataset

datasets_bp = Blueprint('datasets', __name__, url_prefix='/api/v1/datasets')


@datasets_bp.route('', methods=['GET'])
@jwt_required()
def list_datasets():
    project_id = request.args.get('projectId', type=int)
    query = Dataset.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    datasets = query.order_by(Dataset.id.desc()).all()
    return jsonify({
        'total': len(datasets),
        'page': 1,
        'pageSize': len(datasets),
        'items': [d.to_dict() for d in datasets]
    })


@datasets_bp.route('', methods=['POST'])
@jwt_required()
def create_dataset():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    dataset = Dataset(
        project_id=data['projectId'],
        name=data['name'],
        description=data.get('description', ''),
        modality=data['modality'],
        file_format=data.get('fileFormat', 'dicom'),
        created_by=user_id,
    )
    db.session.add(dataset)
    db.session.commit()
    return jsonify(dataset.to_dict()), 201


@datasets_bp.route('/<int:dataset_id>', methods=['GET'])
@jwt_required()
def get_dataset(dataset_id):
    dataset = Dataset.query.get_or_404(dataset_id)
    return jsonify(dataset.to_dict())


@datasets_bp.route('/<int:dataset_id>', methods=['PATCH'])
@jwt_required()
def update_dataset(dataset_id):
    dataset = Dataset.query.get_or_404(dataset_id)
    data = request.get_json()
    for field in ['name', 'description', 'modality', 'status', 'item_count', 'total_size']:
        if field in data:
            setattr(dataset, field, data[field])
    if 'itemCount' in data:
        dataset.item_count = data['itemCount']
    if 'totalSize' in data:
        dataset.total_size = data['totalSize']
    db.session.commit()
    return jsonify(dataset.to_dict())
