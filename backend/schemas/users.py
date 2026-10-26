from pydantic import BaseModel, EmailStr
from models.users import UserRoles

class RoleChange(BaseModel):
    new_role: UserRoles

class CurrentUserResponse(BaseModel):
    id : int
    name : str
    email : EmailStr
    role : UserRoles

class GetAllUsersResponse(BaseModel):
    id : int
    name : str
    email : EmailStr

class PendingUserResponse(BaseModel):
    id : int
    name : str
    email : EmailStr
    requested_role : UserRoles
