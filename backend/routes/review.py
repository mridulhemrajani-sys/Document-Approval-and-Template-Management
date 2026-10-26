from fastapi import APIRouter, Depends
from app import app
from typing import List
from sqlalchemy.orm import Session
from db import get_db
from security.role_check import UserRoles, RoleChecker
from schemas.documents import DocumentsResponse
import models
from services.review_service import ReviewService

review_routers = APIRouter(tags='Review')

@app.get("/review", response_model=List[DocumentsResponse])
def get_review_docs(db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.REVIEWER]))):
    return ReviewService.get_to_review_docs(db, current_user)

@app.patch("/review/change/{id}")
def request_change(id : int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.REVIEWER]))):
    document = ReviewService.check_document_status_or_view_document(db, current_user, id)
    return ReviewService.request_change(db, document)

@app.get("/review/{id}", response_model=DocumentsResponse)
def get_document(id : int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.REVIEWER]))):
    return ReviewService.view_document_to_review(id, db, current_user)


@app.patch("/review/approve/{id}")
def approve_document(id : int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.REVIEWER]))):
    document = ReviewService.check_document_status_or_view_document(db, current_user, id)
    return ReviewService.approve_doc(document, db)


@app.patch("/review/reject/{id}")
def reject_document(id : int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.REVIEWER]))):
    document = ReviewService.check_document_status_or_view_document(db, current_user, id)
    return ReviewService.reject_doc(document, db)
