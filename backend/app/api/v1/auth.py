from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.core.db import get_db
from app.core.security import create_access_token, hash_password, verify_password

from app.models.hotel import User as UserModel
from app.schemas.hotel import LoginRequest, RegisterRequest, TokenResponse, User

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    body: RegisterRequest, 
    db: Annotated[Session, Depends(get_db)] 
) -> TokenResponse:
    existing = db.query(UserModel).filter(UserModel.email == body.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email đã tồn tại"
        )

    user = UserModel(
        email=body.email,
        phone=body.phone,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token("user", user.id))


@router.post("/login")
def login(
    body: LoginRequest, 
    db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    user = db.query(UserModel).filter(UserModel.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai thông tin đăng nhập",
        )

    return TokenResponse(access_token=create_access_token("user", user.id))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_user: CurrentUser) -> None:
    # Token is stateless (unsigned base64), nothing to revoke server-side.
    return None


@router.get("/me")
def me(user: CurrentUser) -> User:
    return user
