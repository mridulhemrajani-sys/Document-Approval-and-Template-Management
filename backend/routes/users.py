from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from security.role_check import RoleChecker
from models.users import UserRoles
from schemas.users import RoleChange, CurrentUserResponse, GetAllUsersResponse
from schemas.auth import UserRegister, AdminRegister
from services.user_service import UserService
import models
from security.jwt import get_current_user
from services.auth_services import AuthService
from app import app
from typing import List


user_router = APIRouter(tags=['Users'])

@app.patch("/update/role/{id}")
def update_role(data:RoleChange, id: int, db: Session = Depends(get_db), current_user:models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    db_user = UserService.get_user(db)
    return UserService.update_user_role(db_user, data, db)

@app.get("/get/users", response_model=List[GetAllUsersResponse])
def get_all_users(db : Session = Depends(get_db), current_user:models.User = Depends(RoleChecker([UserRoles.ADMIN]))):
    db_users = db.query(models.User).all()
    return db_users


@app.post("/register/admin")
def create_admin_user(data: AdminRegister, db: Session = Depends(get_db)):
    AuthService.check_existing_user(db, data)
    return UserService.create_admin_user(db, data)

@app.get("/me", response_model=CurrentUserResponse)
def get_my_profile(current_user : models.User = Depends(get_current_user)):
    return current_user
