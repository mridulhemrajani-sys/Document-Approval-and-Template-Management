from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import get_db
import models
from models.users import UserRoles, UserStatus
from security.role_check import RoleChecker
from schemas.documents import DocumentsResponse 
from schemas.admin import AssignReviewer, ApproveUserRequest
from schemas.users import CurrentUserResponse, PendingUserResponse
from app import app
from services.admin_services import AdminService
from typing import List


admin_router = APIRouter(tags=['Admin'])

@app.get("/documents/submitted", response_model=list[DocumentsResponse])
def get_submitted_documents(db : Session = Depends(get_db), 
                            current_user : models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    return AdminService.document_submitted(db)

@app.patch("/documents/assign/{id}")
def assign_reviewer(id : int, payload : AssignReviewer, db : Session = Depends(get_db), 
                    current_user : models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    AdminService.check_role_for_assign(db, payload)
    return AdminService.assign(db, payload, id)
    
@app.get("/reviewers", response_model=List[CurrentUserResponse])
def get_reviewers(db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    reviewers = db.query(models.User).filter(models.User.role==UserRoles.REVIEWER).all()
    return reviewers

@app.get("/users/pending", response_model=List[PendingUserResponse])
def get_pending_users(db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    users = db.query(models.User).filter(models.User.status==UserStatus.PENDING).all()
    return users


@app.patch("/users/approve/{id}")
def approve_user_account(id: int, data: ApproveUserRequest, db: Session = Depends(get_db),current_user: models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    db_user = (db.query(models.User).filter(models.User.id == id,models.User.status == UserStatus.PENDING).first())

    if db_user is None:
        raise HTTPException(status_code=404, detail="Pending user not found")

    if data.role == UserRoles.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot assign ADMIN through registration approval")

    db_user.role = data.role
    db_user.status = UserStatus.APPROVED

    db.commit()
    db.refresh(db_user)

    return db_user

@app.patch("/users/reject/{id}")
def reject_user_account(id:int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    db_user = db.query(models.User).filter(models.User.id==id, models.User.status==UserStatus.PENDING).first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db_user.status=UserStatus.REJECTED
    db.commit()
    db.refresh(db_user)
    return db_user