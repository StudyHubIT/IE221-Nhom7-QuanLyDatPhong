from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.pages import router as pages_router
from app.core.config import get_settings


settings = get_settings()

app = FastAPI(title="CMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pages_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
