from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.hotel import AdminAccount, AdminRole, User


user_scheme = HTTPBearer(
    auto_error=False,
    bearerFormat="JWT",
    scheme_name="UserBearer",
)
admin_scheme = HTTPBearer(
    auto_error=False,
    bearerFormat="JWT",
    scheme_name="AdminBearer",
)


def _require_token(
    credentials: HTTPAuthorizationCredentials | None,
) -> str:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(user_scheme)
    ],
) -> User:
    _require_token(credentials)
    return User(
        id=1,
        email="user1@gmail.com",
        phone="0900000001",
        full_name="Nguyễn Văn A",
    )


def get_current_admin(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(admin_scheme)
    ],
) -> AdminAccount:
    _require_token(credentials)
    return AdminAccount(
        id=1,
        email="admin@hotel.com",
        full_name="Super Admin",
        role=AdminRole.SUPER_ADMIN,
    )


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[AdminAccount, Depends(get_current_admin)]
