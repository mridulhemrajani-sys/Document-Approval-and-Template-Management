from pydantic import BaseModel, EmailStr
from models.users import UserRoles, UserStatus
from enum import Enum

class UserRegister(BaseModel):
    name : str
    email : EmailStr
    password : str
    requested_role : UserRoles

class AdminRegister(BaseModel):
    name : str
    email : EmailStr
    password : str
    # status : UserStatus.APPROVED

class UserRole(str, Enum):
    ADMIN = "admin"
    AUTHOR = "author"
    REVIEWER = "reviewer"




