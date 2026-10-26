from db.base import base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class TemplateVersions(base):
    __tablename__ = "template_versions"
    id = Column(Integer, nullable=False, primary_key=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)
    version = Column(Integer, nullable=False)
    fields_schema = Column(JSONB, server_default=text(" ' {} '"))
    change_reason = Column(String, nullable=True)
    created_at = Column(Date, nullable=False, default=datetime.now)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    