from fastapi import Depends, HTTPException, status
from security.jwt import get_current_user
from models.users import UserRoles
import models
from db import get_db
from sqlalchemy.orm import Session

class RoleChecker:
    def __init__(self, allowed_roles: list[UserRoles]):
        self.allowed_roles = allowed_roles

    def __call__(self, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
        # user = db.query(models.User).filter(models.User.id == current_user.id).first()
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have the permissions to access this."
            )
        return current_user