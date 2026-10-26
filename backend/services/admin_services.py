from sqlalchemy.orm import Session
import models
from models.documents import StatusEnums
from models.users import UserRoles
from schemas.admin import AssignReviewer
from fastapi import HTTPException, status


class AdminService:

    @staticmethod
    def document_submitted(db : Session):
        documents = db.query(models.Documents).filter(models.Documents.status==StatusEnums.SUBMITTED).all()
        return documents

    @staticmethod
    def check_role_for_assign(db : Session, payload : AssignReviewer ):
        reviewer = db.query(models.User).filter(models.User.id==payload.reviewer_id).first()
        if reviewer is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail ="Reviewer not found.")
        if reviewer.role!=UserRoles.REVIEWER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The user is not a reviewer.")

    @staticmethod
    def assign(db : Session, payload : AssignReviewer, id : int):
        document = db.query(models.Documents).filter(models.Documents.id == id).first()
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
        document.reviewer_id = payload.reviewer_id
        document.status = StatusEnums.IN_REVIEW
        db.commit()
        db.refresh(document)
        return document
        


    
        