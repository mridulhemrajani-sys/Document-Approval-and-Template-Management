from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from db import get_db
from schemas.auth import UserRegister
from schemas.tokens import Token
from sqlalchemy.orm import Session
from services.auth_services import AuthService
from models.users import UserStatus

auth_router = APIRouter(tags=['Authentication'])

from app import app

@app.post("/register")
def register(RegisterModel : UserRegister, db : Session = Depends(get_db)):
    AuthService.check_existing_user(db,RegisterModel)

    new_user = AuthService.register_service(db,RegisterModel)
    return new_user



@app.post("/login", response_model=Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = AuthService.check_user_exists(db,user_credentials)
    if db_user.status != UserStatus.APPROVED:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your account has not been approved. Please contact an admin.")

    access_token = AuthService.login_service(db_user, user_credentials)
    return {"access_token" : access_token, "token_type":"bearer"}


