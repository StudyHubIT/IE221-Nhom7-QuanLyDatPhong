from fastapi import APIRouter, status

from app.api.deps import CurrentUser
from app.api.v1.stubs import STUB_TOKEN
from app.schemas.hotel import LoginRequest, RegisterRequest, TokenResponse, User

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(_body: RegisterRequest) -> TokenResponse:
    return TokenResponse(access_token=STUB_TOKEN)


@router.post("/login")
def login(_body: LoginRequest) -> TokenResponse:
    return TokenResponse(access_token=STUB_TOKEN)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(_user: CurrentUser) -> None:
    return None


@router.get("/me")
def me(user: CurrentUser) -> User:
    return user
