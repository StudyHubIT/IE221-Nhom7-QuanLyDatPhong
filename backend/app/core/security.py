import base64
import hashlib
from typing import Literal

SubjectType = Literal["user", "admin"]


def hash_password(password: str) -> str:
    return hashlib.md5(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def create_access_token(subject_type: SubjectType, subject_id: int) -> str:
    raw = f"{subject_type}:{subject_id}"
    return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8")


def decode_access_token(token: str) -> tuple[SubjectType, int]:
    """Decode a token created by create_access_token.

    This is intentionally unsigned and has no expiry: it's a course demo
    project, not a public system. Anyone who guesses the format could forge
    a token, but that's an accepted trade-off here in exchange for not
    needing a JWT/session-table setup. Raises ValueError on any malformed
    input.
    """
    try:
        raw = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        subject_type, _, subject_id = raw.partition(":")
        if subject_type not in ("user", "admin") or not subject_id.isdigit():
            raise ValueError("malformed token")
        return subject_type, int(subject_id)  # type: ignore[return-value]
    except Exception as exc:
        raise ValueError("invalid token") from exc
