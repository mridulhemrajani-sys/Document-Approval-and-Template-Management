from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FieldsSchema(BaseModel):
    name: str
    label: str
    type: str
    required: bool

TYPE_MAPPING: Dict[str, Any] = {
    "string" : str,
    "integer" : int,
    "float" : float,
    "boolean" : bool
}

class TemplatesResponse(BaseModel):
    id: int
    name: str
    created_by: int

class Template(BaseModel):
    name: str
    description: str
    # created_by: int
    fields_schema: List[FieldsSchema]

class TemplateVersionSchema(BaseModel):
    id: int
    version: int
    fields_schema: List[FieldsSchema]

    class Config:
        from_attributes = True

class FirstTemplateVersion(BaseModel):
    # template_id: int
    version: int
    fields_schema: FieldsSchema
    change_reason: str
    # created_by: int

class CreateTemplateVersion(BaseModel):
    # version: int
    # template_id: int
    fields_schema: List[FieldsSchema]
    change_reason: str
    # created_by: int

class LatestTemplateResponse(BaseModel):
    id: int
    version: int
    template_id:int
    fields_schema:List[FieldsSchema]
    change_reason: Optional[str] = None
    created_by:int

