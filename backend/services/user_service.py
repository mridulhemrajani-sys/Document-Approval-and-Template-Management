from sqlalchemy.orm import Session
import models
from fastapi import HTTPException, status
from schemas.users import RoleChange
from schemas.auth import UserRegister, AdminRegister
from models.users import UserRoles, UserStatus
from security.hash_password import create_hash_password


class UserService:
    @staticmethod
    def get_user(db : Session):
        db_user = db.query(models.User).filter(models.User.id==id).first()
        if db_user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return db_user

    @staticmethod
    def update_user_role(db_user : models.User, data : RoleChange, db : Session):
        db_user.role=data.new_role
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def create_admin_user(db : Session, data : AdminRegister):
        hashed_password=create_hash_password(data.password)
        new_user = models.User(name = data.name, email = data.email, password=hashed_password, role = UserRoles.ADMIN, status=UserStatus.APPROVED)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
