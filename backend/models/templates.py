from db.base import base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from datetime import datetime

class Template(base):
    __tablename__ = "templates"
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=False)
    is_archived = Column(Boolean, nullable=False, default=False)
    created_at = Column(Date, nullable=False, default=datetime.now)
    updated_at = Column(Date, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
