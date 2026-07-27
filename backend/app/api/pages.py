from fastapi import APIRouter

from app.schemas.page import PageRead

router = APIRouter(prefix="/api/pages", tags=["pages"])


@router.get("", response_model=list[PageRead])
def list_pages() -> list[PageRead]:
    return []
