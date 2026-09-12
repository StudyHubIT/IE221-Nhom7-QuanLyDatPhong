from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import decode_access_token
from app.models.hotel import Admin as AdminModel
from app.models.hotel import User as UserModel
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


def _invalid_token() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _admin_role(admin: AdminModel) -> AdminRole:
    codes = {role.code for role in admin.roles}
    if AdminRole.SUPER_ADMIN.value in codes:
        return AdminRole.SUPER_ADMIN
    if admin.roles:
        try:
            return AdminRole(admin.roles[0].code)
        except ValueError:
            return AdminRole.STAFF
    return AdminRole.STAFF


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(user_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:

    token = _require_token(credentials)
    try:
        subject_type, subject_id = decode_access_token(token)
    except ValueError:
        raise _invalid_token()
    if subject_type != "user":
        raise _invalid_token()

    user = db.get(UserModel, subject_id)
    if user is None or user.status == "LOCKED":
        raise _invalid_token()
    return User.model_validate(user)


def get_current_admin(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(admin_scheme)
    ],
    db: Annotated[Session, Depends(get_db)],
) -> AdminAccount:
    token = _require_token(credentials)
    try:
        subject_type, subject_id = decode_access_token(token)
    except ValueError:
        raise _invalid_token()
    if subject_type != "admin":
        raise _invalid_token()

    admin = db.get(AdminModel, subject_id)
    if admin is None or admin.status == "LOCKED":
        raise _invalid_token()
    return AdminAccount(
        id=admin.id,
        full_name=admin.full_name,
        email=admin.email,
        role=_admin_role(admin),
        status=admin.status,
    )


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[AdminAccount, Depends(get_current_admin)]
