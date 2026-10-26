from fastapi import status, HTTPException
from sqlalchemy.orm import Session
import models
from models.documents import StatusEnums


class ReviewService:

    @staticmethod
    def get_to_review_docs(db : Session, current_user : models.User):
        documents = db.query(models.Documents).filter(models.Documents.reviewer_id==current_user.id).all()
        return documents

    @staticmethod
    def check_document_status_or_view_document(db : Session, current_user : models.User, id : int):
        document = db.query(models.Documents).filter(models.Documents.id == id and models.Documents.reviewer_id==current_user.id).first()
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
        if(document.status!=StatusEnums.IN_REVIEW):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot request changes right now.")
        return document

    @staticmethod
    def request_change(db : Session, document : models.Documents):
        document.status = StatusEnums.CHANGES_REQUESTED
        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def view_document_to_review(id : int, db : Session, current_user : models.User):
        document = db.query(models.Documents).filter(models.Documents.id==id and models.Documents.reviewer_id==current_user.id).first()
        if document is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This document does not exist or is not assigned to you for reviewing")
        return document

    @staticmethod
    def approve_doc(document : models.Documents, db : Session):
        document.status = StatusEnums.APPROVED
        document.reviewer_id=None
        db.commit()
        db.refresh(document)
        return document
    @staticmethod
    def reject_doc(document : models.Documents, db : Session):
        document.status = StatusEnums.REJECTED
        document.reviewer_id=None
        db.commit()
        db.refresh(document)
        return document

    
