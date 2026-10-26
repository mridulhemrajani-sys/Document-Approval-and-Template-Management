from db.base import base
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, text, Enum
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import enum

class StatusEnums(enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    CHANGES_REQUESTED = "changes_requested"
    APPROVED = "approved"
    REJECTED = "rejected"

class Documents(base):
    __tablename__ = "documents"
    id = Column(Integer, nullable=False, primary_key=True)
    title = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    template_version_id = Column(Integer, ForeignKey("template_versions.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(Enum(StatusEnums), nullable=False, default=StatusEnums.DRAFT)
    fields = Column(JSONB, nullable=False, server_default=text(" '{}' "))
    created_at = Column(Date, nullable=False, default=datetime.now)
    updated_at = Column(Date, nullable=True)
    