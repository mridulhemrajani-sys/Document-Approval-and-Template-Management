from app import app
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from security.jwt import get_current_user
from security.role_check import RoleChecker
from models.users import UserRoles
import models
from typing import Dict, List
from schemas.documents import DocumentCreate, DocumentUpdate, DocumentsResponse
from services.document_service import DocumentService

document_routers = APIRouter(tags=['Documents'])

@app.post("/document/{template_version_id}")
def create_document(payload: DocumentCreate, template_version_id: int, db: Session = Depends(get_db), 
                    current_user: models.User = Depends(RoleChecker([UserRoles.AUTHOR]))):
    db_template = DocumentService.get_version(template_version_id, db)
    template = DocumentService.convert_to_schema(db_template)

    data = DocumentService.generate_dynamic(payload, template)

    return DocumentService.create_new_document(db, template_version_id, payload, data, current_user)


@app.patch("/document/update/{document_id}")
def update_document(document_id : int, payload : DocumentUpdate, db: Session = Depends(get_db), 
                    current_user:models.User = Depends(RoleChecker([UserRoles.AUTHOR]))):
    
    document = DocumentService.get_document(db, document_id)
    DocumentService.document_status_author_for_update(document, current_user)

   
    DocumentService.check_payload_empty_for_update(payload)
   
    return DocumentService.update_doc(payload, document, db)

@app.get("/documents", response_model=List[DocumentsResponse])
def get_documents(db:Session = Depends(get_db), current_user : models.User = Depends(get_current_user)):
    return DocumentService.get_approved_documents(db)

@app.patch("/documents/submit/{id}")
def submit_document(id : int, db: Session = Depends(get_db), 
                    current_user : models.User = Depends(RoleChecker([UserRoles.AUTHOR]))):
     
    return DocumentService.submit(id, db, current_user)


@app.get("/my-documents", response_model=List[DocumentsResponse])
def get_my_documents(db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.AUTHOR]))):
    return DocumentService.get_self_documents(db, current_user)

@app.get("/document/{document_id}", response_model=DocumentsResponse)
def get_document_id(document_id : int, db : Session = Depends(get_db), current_user : models.User = Depends(RoleChecker([UserRoles.AUTHOR]))):
    document = db.query(models.Documents).filter(models.Documents.id == document_id, models.Documents.author_id==current_user.id).first()
    return document



    



    
