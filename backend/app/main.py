from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.pages import router as pages_router
from app.api.v1 import admin as admin_api
from app.api.v1.auth import router as auth_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.catalog import room_types_router, rooms_router
from app.core.config import get_settings


settings = get_settings()

OPENAPI_TAGS = [
    {"name": "Health", "description": "Health check"},
    {"name": "Auth", "description": "P5 — đăng ký / đăng nhập khách hàng"},
    {"name": "RoomTypes", "description": "P1, P3 — loại phòng công khai"},
    {"name": "Rooms", "description": "P2, P4 — tìm phòng trống"},
    {"name": "Bookings", "description": "P6–P9 — đặt phòng, lịch sử, hủy"},
    {"name": "AdminAuth", "description": "A1 — đăng nhập quản trị"},
    {"name": "AdminDashboard", "description": "A2"},
    {"name": "AdminRoomTypes", "description": "A3 — CRUD loại phòng"},
    {"name": "AdminRooms", "description": "A4 — CRUD phòng"},
    {"name": "AdminBookings", "description": "A5, A6"},
    {"name": "AdminPayments", "description": "A7"},
    {"name": "AdminRefunds", "description": "A8"},
    {"name": "AdminCustomers", "description": "A9"},
    {"name": "AdminStaff", "description": "A10"},
]

app = FastAPI(
    title="HotelBook API",
    version="1.0.0",
    description=(
        "REST API hệ thống quản lý đặt phòng, map từ "
        "`documents/openapi.yaml`. Endpoint hiện là stub, chưa nối database. "
        "Authorize với token bất kỳ (ví dụ `stub`) để thử các route cần JWT."
    ),
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.api_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pages_router)
app.include_router(auth_router)
app.include_router(room_types_router)
app.include_router(rooms_router)
app.include_router(bookings_router)
for router in admin_api.admin_routers:
    app.include_router(router)


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
