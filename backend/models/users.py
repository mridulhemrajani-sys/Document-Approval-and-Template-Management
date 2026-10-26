from db.base import base
from sqlalchemy import Column, Integer, String, Date, Enum
from datetime import datetime
import enum

class UserRoles(enum.Enum):
    ADMIN = "admin"
    AUTHOR = "author"
    REVIEWER = "reviewer"

class UserStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(base):
    __tablename__ = "users"
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRoles), nullable=True)
    requested_role = Column(Enum(UserRoles), nullable=True)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)
    created_at = Column(Date, nullable=False, default=datetime.now())

