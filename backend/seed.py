"""
种子数据脚本 - 为后端数据库填充初始数据
运行: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Organization, User, Project, Dataset, Task, TaskAssignment, AnnotationRecord, ReviewRecord, AuditLog
from routes.audit import create_audit_log
from datetime import datetime, timezone, timedelta
import random

app = create_app()

with app.app_context():
    # 清空旧数据
    db.drop_all()
    db.create_all()

    # 1. 机构
    org = Organization(name='中国人民解放军总医院', code='PLA301', description='综合性三甲医院')
    db.session.add(org)
    db.session.flush()

    # 2. 用户 (8人)
    users_data = [
        {'username': 'admin', 'password': 'admin123', 'full_name': '系统管理员', 'title': '高级工程师', 'department': '信息科'},
        {'username': 'zhang', 'password': '123456', 'full_name': '张明远', 'title': '主任医师', 'department': '放射科'},
        {'username': 'li', 'password': '123456', 'full_name': '李雪梅', 'title': '主治医师', 'department': '病理科'},
        {'username': 'wang', 'password': '123456', 'full_name': '王建国', 'title': '副主任医师', 'department': '放射科'},
        {'username': 'chen', 'password': '123456', 'full_name': '陈思雨', 'title': '住院医师', 'department': '放射科'},
        {'username': 'liu', 'password': '123456', 'full_name': '刘博文', 'title': '住院医师', 'department': '病理科'},
        {'username': 'zhao', 'password': '123456', 'full_name': '赵雅琴', 'title': '主任医师', 'department': '超声科'},
        {'username': 'sun', 'password': '123456', 'full_name': '孙明华', 'title': '住院医师', 'department': '中医科'},
    ]
    users = []
    for ud in users_data:
        u = User(username=ud['username'], full_name=ud['full_name'],
                 title=ud['title'], department=ud['department'],
                 last_login_at=datetime.now(timezone.utc))
        u.set_password(ud['password'])
        db.session.add(u)
        users.append(u)
    db.session.flush()

    # 3. 项目 (5个)
    projects_data = [
        {'code': 'P2026-001', 'name': '肺结节CT影像标注项目', 'description': '基于多中心CT影像的肺结节检测与分类标注',
         'research_type': '影像组学', 'created_by': users[1].id, 'member_count': 12, 'dataset_count': 3, 'task_count': 3},
        {'code': 'P2026-002', 'name': '病理WSI肿瘤分级标注', 'description': '乳腺癌HE染色全切片病理图像的肿瘤分级标注',
         'research_type': '临床研究', 'created_by': users[1].id, 'member_count': 8, 'dataset_count': 2, 'task_count': 2},
        {'code': 'P2026-003', 'name': '中医舌诊图像数据集构建', 'description': '采集并标注中医舌象图像',
         'research_type': '中医证候', 'created_by': users[6].id, 'member_count': 6, 'dataset_count': 1, 'task_count': 1},
        {'code': 'P2026-004', 'name': '乳腺超声BI-RADS标注', 'description': '乳腺超声图像按照BI-RADS标准进行分类',
         'research_type': '临床研究', 'created_by': users[6].id, 'member_count': 5, 'dataset_count': 1, 'task_count': 1},
        {'code': 'P2026-005', 'name': '中医病历NER标注', 'description': '中医电子病历的命名实体识别标注',
         'research_type': '中医证候', 'created_by': users[1].id, 'member_count': 4, 'dataset_count': 1, 'task_count': 1},
    ]
    projects = []
    for pd in projects_data:
        p = Project(**pd)
        db.session.add(p)
        projects.append(p)
    db.session.flush()

    # 4. 数据集 (8个)
    datasets_data = [
        {'project_id': projects[0].id, 'name': '胸部CT训练集_v1', 'modality': 'ct', 'item_count': 500, 'total_size': 256000000000, 'file_format': 'dicom'},
        {'project_id': projects[0].id, 'name': '胸部CT验证集_v1', 'modality': 'ct', 'item_count': 100, 'total_size': 51200000000, 'file_format': 'dicom'},
        {'project_id': projects[0].id, 'name': '低剂量CT筛查集', 'modality': 'ct', 'item_count': 200, 'total_size': 80000000000, 'file_format': 'dicom'},
        {'project_id': projects[1].id, 'name': '乳腺癌WSI数据集', 'modality': 'wsi', 'item_count': 300, 'total_size': 600000000000, 'file_format': 'svs'},
        {'project_id': projects[1].id, 'name': '乳腺良性病变WSI', 'modality': 'wsi', 'item_count': 100, 'total_size': 200000000000, 'file_format': 'svs'},
        {'project_id': projects[2].id, 'name': '中医舌象图像库_v1', 'modality': 'tongue', 'item_count': 500, 'total_size': 25000000000, 'file_format': 'png'},
        {'project_id': projects[3].id, 'name': '乳腺超声图像集', 'modality': 'us', 'item_count': 200, 'total_size': 40000000000, 'file_format': 'dicom'},
        {'project_id': projects[4].id, 'name': '中医病历文本集', 'modality': 'text', 'item_count': 2000, 'total_size': 50000000, 'file_format': 'json'},
    ]
    datasets = []
    for dd in datasets_data:
        ds = Dataset(**dd, status='active', created_by=users[0].id)
        db.session.add(ds)
        datasets.append(ds)
    db.session.flush()

    # 5. 任务 (8个)
    tasks_data = [
        {'project_id': projects[0].id, 'name': '肺结节检出_第一批', 'type': 'normal', 'dataset_id': datasets[0].id,
         'status': 'in_progress', 'annotator_count': 5, 'total_items': 500,
         'pending_count': 120, 'in_progress_count': 80, 'submitted_count': 200, 'approved_count': 80, 'rejected_count': 20,
         'ai_assist_enabled': True, 'tsa_enabled': True,
         'deadline': datetime(2026, 5, 30, tzinfo=timezone.utc)},
        {'project_id': projects[0].id, 'name': '肺结节检出_双盲质控', 'type': 'parallel', 'dataset_id': datasets[1].id,
         'status': 'in_progress', 'annotator_count': 4, 'total_items': 100,
         'pending_count': 10, 'in_progress_count': 20, 'submitted_count': 40, 'approved_count': 20, 'rejected_count': 10,
         'ai_assist_enabled': True, 'blind_mode_enabled': True, 'tsa_enabled': True,
         'deadline': datetime(2026, 5, 15, tzinfo=timezone.utc)},
        {'project_id': projects[0].id, 'name': '低剂量CT筛查标注', 'type': 'normal', 'dataset_id': datasets[2].id,
         'status': 'draft', 'annotator_count': 3, 'total_items': 200,
         'pending_count': 200, 'deadline': datetime(2026, 6, 1, tzinfo=timezone.utc)},
        {'project_id': projects[1].id, 'name': '乳腺癌分级_第一轮', 'type': 'sequential', 'dataset_id': datasets[3].id,
         'status': 'under_review', 'annotator_count': 4, 'total_items': 300,
         'submitted_count': 250, 'approved_count': 200, 'rejected_count': 50,
         'ai_assist_enabled': True, 'tsa_enabled': True,
         'deadline': datetime(2026, 5, 20, tzinfo=timezone.utc)},
        {'project_id': projects[1].id, 'name': '良恶性鉴别_验证集', 'type': 'normal', 'dataset_id': datasets[4].id,
         'status': 'published', 'annotator_count': 3, 'total_items': 100,
         'pending_count': 100, 'blind_mode_enabled': True,
         'deadline': datetime(2026, 5, 25, tzinfo=timezone.utc)},
        {'project_id': projects[2].id, 'name': '舌色分类标注', 'type': 'normal', 'dataset_id': datasets[5].id,
         'status': 'in_progress', 'annotator_count': 3, 'total_items': 500,
         'pending_count': 200, 'in_progress_count': 100, 'submitted_count': 150, 'approved_count': 40, 'rejected_count': 10,
         'ai_assist_enabled': True,
         'deadline': datetime(2026, 6, 15, tzinfo=timezone.utc)},
        {'project_id': projects[3].id, 'name': 'BI-RADS分类标注', 'type': 'parallel', 'dataset_id': datasets[6].id,
         'status': 'published', 'annotator_count': 2, 'total_items': 200,
         'pending_count': 200, 'blind_mode_enabled': True, 'tsa_enabled': True,
         'deadline': datetime(2026, 6, 10, tzinfo=timezone.utc)},
        {'project_id': projects[4].id, 'name': '中医病历实体标注', 'type': 'normal', 'dataset_id': datasets[7].id,
         'status': 'in_progress', 'annotator_count': 2, 'total_items': 2000,
         'pending_count': 800, 'in_progress_count': 400, 'submitted_count': 600, 'approved_count': 150, 'rejected_count': 50,
         'deadline': datetime(2026, 6, 30, tzinfo=timezone.utc)},
    ]
    tasks = []
    for td in tasks_data:
        t = Task(**td)
        db.session.add(t)
        tasks.append(t)
    db.session.flush()

    # 6. 任务分配
    assignments_data = [
        {'task_id': tasks[0].id, 'data_item_id': 1, 'annotator_id': users[2].id, 'status': 'submitted'},
        {'task_id': tasks[0].id, 'data_item_id': 2, 'annotator_id': users[2].id, 'status': 'approved'},
        {'task_id': tasks[0].id, 'data_item_id': 3, 'annotator_id': users[4].id, 'status': 'in_progress'},
        {'task_id': tasks[5].id, 'data_item_id': 100, 'annotator_id': users[7].id, 'status': 'in_progress'},
        {'task_id': tasks[7].id, 'data_item_id': 200, 'annotator_id': users[2].id, 'status': 'submitted'},
    ]
    for ad in assignments_data:
        a = TaskAssignment(**ad)
        db.session.add(a)
    db.session.flush()

    # 7. 标注记录
    annotations_data = [
        {'data_item_id': 1, 'task_id': tasks[0].id, 'annotator_id': users[2].id,
         'payload_type': 'bbox', 'payload': '{"x":120,"y":150,"width":45,"height":38,"label":1011,"confidence":0.92}',
         'status': 'submitted'},
        {'data_item_id': 2, 'task_id': tasks[0].id, 'annotator_id': users[2].id,
         'payload_type': 'bbox', 'payload': '{"x":250,"y":300,"width":30,"height":35,"label":1011,"confidence":0.88}',
         'status': 'approved'},
    ]
    for ad in annotations_data:
        a = AnnotationRecord(**ad)
        db.session.add(a)
    db.session.flush()

    # 8. 审核记录
    review = ReviewRecord(
        annotation_id=2, reviewer_id=users[3].id,
        decision='approved', comments='标注准确，结节形态描述清晰'
    )
    db.session.add(review)
    db.session.flush()

    # 9. 审计日志（示例）
    user_map = {u.username: u for u in users}
    create_audit_log(users[1].id, users[1].full_name, 'CREATE', 'task', str(tasks[0].id),
                     {'name': '肺结节检出_第一批'}, projects[0].id)
    create_audit_log(users[1].id, users[1].full_name, 'PUBLISH', 'task', str(tasks[0].id),
                     {'status': 'draft→published'}, projects[0].id)
    create_audit_log(users[2].id, users[2].full_name, 'SUBMIT', 'annotation', '1',
                     {'status': 'draft→submitted'}, projects[0].id)
    create_audit_log(users[3].id, users[3].full_name, 'REVIEW', 'annotation', '2',
                     {'decision': 'approved'}, projects[0].id)

    db.session.commit()

    # 10. 通知（每人4条示例通知）
    from models import Notification
    notification_data = [
        {'user_id': 1, 'title': '李雪梅 提交了标注结果', 'content': 'CT_001001.dcm 肺结节标注已提交'},
        {'user_id': 1, 'title': '王建国 审核通过了 3 条标注', 'content': '肺结节检出_第一批 3条标注审核通过'},
        {'user_id': 1, 'title': '系统通知：任务即将到期', 'content': '任务「肺结节检出_双盲质控」将于5月15日截止'},
        {'user_id': 1, 'title': '陈思雨 提交了驳回修改', 'content': 'CT_001003.dcm 标注已修改后重新提交'},
        {'user_id': 2, 'title': '李雪梅 提交了标注结果', 'content': '肺结节检出_第一批 新标注已提交'},
        {'user_id': 2, 'title': '系统通知：任务已发布', 'content': '良恶性鉴别_验证集 标注任务已发布'},
        {'user_id': 3, 'title': '审核提醒', 'content': '您的 5 条标注待审核'},
        {'user_id': 3, 'title': '标注已驳回', 'content': 'CT_001002.dcm 标注被驳回，请修改后重新提交'},
    ]
    for nd in notification_data:
        db.session.add(Notification(**nd))
    db.session.commit()
    print(f'  - 通知: {len(notification_data)}')
    print(f'  - 机构: 1')
    print(f'  - 用户: {len(users)} (admin/admin123, 其他用户密码: 123456)')
    print(f'  - 项目: {len(projects)}')
    print(f'  - 数据集: {len(datasets)}')
    print(f'  - 任务: {len(tasks)}')
    print(f'  - 分配: {len(assignments_data)}')
    print(f'  - 标注: {len(annotations_data)}')
    print(f'  - 审核: 1')
    print(f'  - 审计日志: 4')
