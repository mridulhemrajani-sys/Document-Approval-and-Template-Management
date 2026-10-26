from pydantic import BaseModel
from models.users import UserRoles

class AssignReviewer(BaseModel):
    reviewer_id : int

class ApproveUserRequest(BaseModel):
    role : UserRoles