from pydantic import BaseModel, create_model
from schemas.templates import Template, TYPE_MAPPING, Dict, Optional, TemplateVersionSchema
from typing import Any
from enum import Enum

def generate_dynamic_model(template : TemplateVersionSchema):
    dynamic_fields = {}
    for field_info in template.fields_schema:
        field_type = TYPE_MAPPING.get(field_info.type, str)
        if field_info.required:
            dynamic_fields[field_info.name]=(field_type, ...)
        else:
            dynamic_fields[field_info.name]=(field_type | None, None)

    return create_model(f"Document{template.id}Model", **dynamic_fields)

class DocumentCreate(BaseModel):
    title: str
    fields: Dict[str, Any]

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    fields: Optional[Dict[str,Any]] = None

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    CHANGES_REQUESTED = "changes_requested"
    APPROVED = "approved"
    REJECTED = "rejected"

class DocumentsResponse(BaseModel):
    id: int
    title : str
    author_id : int
    template_version_id: int
    status : DocumentStatus
    fields : Dict[str,Any] | None
    # created_at : 

