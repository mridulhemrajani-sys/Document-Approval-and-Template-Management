import models
from security.hash_password import create_hash_password
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from security.check_password import check_hashed_password
from security.jwt import create_access_token
from schemas.auth import UserRegister
from fastapi import HTTPException, status, Depends

class AuthService:

    @staticmethod
    def check_existing_user(db : Session, RegisterModel : UserRegister):
        db_user = db.query(models.User).filter(RegisterModel.email == models.User.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="User with this email id already exists")
        return

    @staticmethod
    def register_service(db : Session, RegisterModel : UserRegister):
        hashed_password=create_hash_password(RegisterModel.password)
        new_user = models.User(name = RegisterModel.name, email = RegisterModel.email, password=hashed_password, requested_role = RegisterModel.requested_role)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def check_user_exists(db : Session, user_credentials : OAuth2PasswordRequestForm = Depends()):
        db_user = db.query(models.User).filter(models.User.email==user_credentials.username).first()
        if not db_user:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
        return db_user

    @staticmethod
    def login_service( db_user : models.User, user_credentials : OAuth2PasswordRequestForm = Depends()):
        if check_hashed_password(user_credentials.password, db_user.password)==False:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

        access_token = create_access_token(data = {"id" : db_user.id})
        return access_token

