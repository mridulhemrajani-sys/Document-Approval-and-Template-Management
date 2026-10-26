from db.base import base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class DocumentHistory(base):
    __tablename__ = "document_history"

    id = Column(Integer, nullable=False, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    comment = Column(String, nullable=True)
    created_at = Column(Date, nullable=False, default=datetime.now)

