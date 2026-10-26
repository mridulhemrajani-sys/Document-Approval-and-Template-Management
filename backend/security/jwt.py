from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from dotenv import load_dotenv
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import os
from fastapi.security import OAuth2PasswordBearer
import models
from models.users import UserStatus
from schemas import tokens
from db import get_db

load_dotenv()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
expire_time = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))
algo = os.getenv('ALGORITHM')
secret_key = os.getenv('SECRET_KEY')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expire_time) 

    to_encode.update({"exp" : expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algo)
    return encoded_jwt

def verify_access_token(token: str, credentials_exception):
    try:
        payload  = jwt.decode(token, secret_key, algo)
        id = int(payload.get("id"))
        if id is None:
            raise credentials_exception
        token_data = tokens.TokenData(id=id)
    except JWTError:
        raise credentials_exception
    return token_data

def get_current_user(token:str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = verify_access_token(token, credentials_exception)

    user = db.query(models.User).filter(models.User.id == token.id).first()
    if user is None:
        raise credentials_exception
    if user.status != UserStatus.APPROVED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account has not been approved. Please contact an admin.")

    return user


