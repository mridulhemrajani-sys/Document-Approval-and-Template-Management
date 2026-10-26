from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from schemas.templates import Template, CreateTemplateVersion, LatestTemplateResponse, TemplatesResponse
from security.jwt import get_current_user
from security.role_check import RoleChecker
from models.users import UserRoles
from typing import List
import models
from db import get_db
from services.template_service import TemplateService
from app import app

templates_router = APIRouter(tags=['Templates'])


@app.get("/templates", response_model=List[TemplatesResponse])
def get_unarchived_templates(db : Session = Depends(get_db), current_user: models.User = Depends(RoleChecker([UserRoles.AUTHOR, UserRoles.ADMIN]))):
    templates = db.query(models.Template).filter(models.Template.is_archived == False).all()
    return templates


@app.post("/templates")
def create_new_template(template_data: Template, db: Session = Depends(get_db), 
                        current_user: models.User = Depends(RoleChecker([UserRoles.ADMIN])), ):
    new_template = TemplateService.create_new_template(template_data, db, current_user)

    return TemplateService.create_first_version(template_data, db, current_user, new_template)


@app.post("/template/{id}")
def create_new_version(version_data: CreateTemplateVersion, id: int, db: Session = Depends(get_db), 
                       current_user: models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    current_version_count = TemplateService.get_version_count()
    new_version = TemplateService.create_version(current_version_count, version_data, id, db, current_user)
    return new_version


@app.get("/template/latest/{template_id}", response_model=LatestTemplateResponse)
def get_latest_template(template_id: int, db: Session = Depends(get_db),
                         current_user: int = Depends(get_current_user)):
    return TemplateService.get_latest_version(template_id, db)


@app.get("/template/versions/{template_id}", response_model=List[LatestTemplateResponse])
def get_all_versions(template_id: int, db: Session = Depends(get_db)):
    return TemplateService.get_all_versions(template_id, db)


@app.patch("template/archive/{template_id}")
def archive_template(template_id: int, db:Session = Depends(get_db), current_user: models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    db_template = TemplateService.get_template(template_id, db)
    return TemplateService.archive_template(db_template, db)

@app.get("/template/version/{version_id}", response_model=LatestTemplateResponse)
def get_template_version(version_id : int, db : Session = Depends(get_db)):
    template = db.query(models.TemplateVersions).filter(models.TemplateVersions.id==version_id).first()
    return template



