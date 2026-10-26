from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import models
from schemas.templates import TemplateVersionSchema
from pydantic import ValidationError
from schemas.documents import generate_dynamic_model, DocumentCreate, DocumentUpdate
from models.documents import StatusEnums



class DocumentService:

    @staticmethod
    def get_version(template_version_id: int, db: Session):
        db_template = db.query(models.TemplateVersions).filter(
            models.TemplateVersions.id == template_version_id).first()
        return db_template

    @staticmethod
    def convert_to_schema(db_template : models.TemplateVersions):
        try:
            template = TemplateVersionSchema.model_validate(db_template, from_attributes=True)
        except ValidationError as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                detail="Stored template schema is invalid.")
        if template is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail="No template version found for the given id")
        return template

    @staticmethod
    def generate_dynamic(payload: DocumentCreate, template : TemplateVersionSchema):
        DynamicDocumentModel = generate_dynamic_model(template)
        try:
            validated_data = DynamicDocumentModel(**payload.fields)
        except ValidationError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=e.errors())
    
        data = validated_data.model_dump(exclude_unset=True)
        return data

    @staticmethod
    def create_new_document(db:Session, template_version_id: int, payload: DocumentCreate, data, current_user : models.User):
        document = models.Documents(title = payload.title, author_id = current_user.id, 
                                        template_version_id=template_version_id, fields = data)
        db.add(document)
        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def get_document(db : Session, document_id : int):
        document = db.query(models.Documents).filter(models.Documents.id==document_id).first()
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return document

    @staticmethod
    def document_status_author_for_update(document : models.Documents, current_user : models.User):
        status_not_allowed = [StatusEnums.APPROVED, StatusEnums.IN_REVIEW, StatusEnums.REJECTED, StatusEnums.SUBMITTED]
        
        if document.status in status_not_allowed:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                    detail="Cannot update the document right now.")
        if document.author_id!=current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                    detail="You can only edit a document that you created.")
        return
    
    @staticmethod
    def check_payload_empty_for_update(payload : DocumentUpdate):
        if payload.fields is None and payload.title is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, 
                detail="At least one field (title or fields) must be provided for update."
            )
        return

    @staticmethod
    def update_doc(payload : DocumentUpdate, document : models.Documents, db : Session):
        modified = False
        
        if payload.title is not None:
            document.title = payload.title
            modified = True
        
    
        # if payload.fields is None:
        #      document.title = payload.title
        #      db.commit()
        #      db.refresh(document)
        #      return document
    
        if payload.fields is not None:
            db_template = db.query(models.TemplateVersions).filter(
                    models.TemplateVersions.id == document.template_version_id).first()
            if not db_template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Associated template version not found."
                )
            try:
                template = TemplateVersionSchema.model_validate(db_template, from_attributes=True)
            except ValidationError as e:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                                    detail="Stored template schema is invalid.")
            DynamicDocumentModel = generate_dynamic_model(template)
                
            try:
                validated_data =DynamicDocumentModel(**payload.fields)
            except ValidationError as e:
                    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=e.errors())
        
            data = validated_data.model_dump(exclude_unset=True)
            document.fields = {**(document.fields or {}), **data}
            modified = True
    
        if modified:
            db.commit()
            db.refresh(document)
    
        return document

    @staticmethod
    def get_approved_documents(db:Session):
        documents = db.query(models.Documents).filter(models.Documents.status == StatusEnums.APPROVED).all()
        return documents

    @staticmethod
    def submit(id : int, db: Session, current_user : models.User):
        document = db.query(models.Documents).filter(models.Documents.id==id and models.Documents.author_id==current_user.id).first()
        if (document.status==StatusEnums.DRAFT):
            document.status = StatusEnums.SUBMITTED
        elif(document.status==StatusEnums.CHANGES_REQUESTED):
            document.status = StatusEnums.IN_REVIEW
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot submit the document right now.")
        db.commit()
        db.refresh(document)
        return document

    @staticmethod
    def get_self_documents(db:Session, current_user : models.User):
        documents = db.query(models.Documents).filter(models.Documents.author_id == current_user.id).all()
        return documents
        
        
    
        

    