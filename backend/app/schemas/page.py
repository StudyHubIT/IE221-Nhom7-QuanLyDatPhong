from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PageBase(BaseModel):
    slug: str
    title: str
    body: str = ""


class PageCreate(PageBase):
    pass


class PageRead(PageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
