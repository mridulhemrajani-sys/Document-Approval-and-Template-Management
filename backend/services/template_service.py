from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from schemas.templates import Template, CreateTemplateVersion
from sqlalchemy import func

import models

class TemplateService:
    @staticmethod
    def create_new_template(template_data: Template, db: Session, current_user: models.User):
        new_template = models.Template(name = template_data.name, description=template_data.description,
                                           created_by = current_user.id)
        db.add(new_template)
        db.flush()
        return new_template

    @staticmethod
    def create_first_version(template_data: Template, db: Session, current_user: models.User, new_template : models.Template):
        json_serializable_object = [f.model_dump() for f in template_data.fields_schema]
        first_version = models.TemplateVersions(template_id = new_template.id, version=1, 
                                                fields_schema=json_serializable_object, 
                                                created_by = current_user.id)
        db.add(first_version)
        db.commit()
        db.refresh(new_template)
        return new_template

    @staticmethod
    def get_version_count(db : Session):
        return db.query(func.count(models.TemplateVersions.id)).filter(models.TemplateVersions.template_id==id).first()

    @staticmethod
    def create_version(current_version_count, version_data: CreateTemplateVersion, id: int, db: Session, current_user: models.User):
        fields_schema_object = [f.model_dump() for f in version_data.fields_schema]
        new_version = models.TemplateVersions(template_id = id, version = current_version_count[0]+1,
                                                fields_schema = fields_schema_object, 
                                                change_reason = version_data.change_reason, 
                                                created_by = current_user.id)
        db.add(new_version)
        db.commit()
        db.refresh(new_version)
        return new_version

    @staticmethod
    def get_latest_version(template_id: int, db: Session):
        templates = db.query(models.TemplateVersions).filter(
                models.TemplateVersions.template_id==template_id).order_by(
                models.TemplateVersions.version.desc()).first()
        return templates

    @staticmethod
    def get_all_versions(template_id: int, db: Session):
        versions = db.query(models.TemplateVersions).filter(models.TemplateVersions.template_id==template_id).all()
        return versions

    @staticmethod
    def get_template(template_id: int, db : Session):
        db_template = db.query(models.Template).filter(models.Template.id==template_id).first()
        return db_template

    @staticmethod
    def archive_template(db_template : models.Template, db : Session):
        db_template.is_archived=True
        db.commit()
        db.refresh(db_template)
        return db_template