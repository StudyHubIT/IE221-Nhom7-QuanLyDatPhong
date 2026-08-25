# `backend/app` — HotelBook API

Package Python của [FastAPI](https://fastapi.tiangolo.com/). Mọi request HTTP đi vào đây, rồi lần lượt qua **router → dependency (auth/DB) → model SQLAlchemy → schema Pydantic**.

Contract API nằm ở [`documents/openapi.yaml`](../../documents/openapi.yaml). Phân công hiện thực từng cụm endpoint: [`phan_cong_cong_viec.md`](../../phan_cong_cong_viec.md).

```text
app/
├── main.py              # Tạo FastAPI app, CORS, gắn router, /health
├── db_seed.py           # Seed tài khoản + phòng mẫu (`make seed`)
├── core/                # Cấu hình, DB session, hash/token
├── models/              # SQLAlchemy ORM (bảng PostgreSQL)
├── schemas/             # Pydantic DTO (request/response JSON)
└── api/                 # FastAPI router + auth dependency
    ├── deps.py
    ├── pages.py
    └── v1/              # API phiên bản 1 (`/api/v1/...`)
```

## Luồng request

```text
HTTP  →  api/v1/*.py (router)
           │
           ├─ api/deps.py          CurrentUser / CurrentAdmin
           ├─ core/db.py           get_db → Session
           ├─ models/*.py          query / insert PostgreSQL
           └─ schemas/*.py         validate input, serialize JSON
```

Khi thêm endpoint mới: **tái sử dụng model + schema đã có**, đặt route đúng file trong `api/v1/`, dùng `CurrentUser`/`CurrentAdmin` và `get_db` — không tự parse token hay tạo session riêng.

---

## File gốc

| File | Ý nghĩa |
|---|---|
| `main.py` | Entry point. Tạo `FastAPI`, CORS, `include_router` cho auth / catalog / bookings / admin, endpoint `GET /health`. |
| `db_seed.py` | Insert dữ liệu demo (admin, staff, user, loại phòng, phòng). Idempotent: đã có admin thì bỏ qua. Chạy bằng `make seed` hoặc `poetry run python -m app.db_seed`. |

Migration schema **không** nằm trong `app/` — chúng ở `backend/alembic/` (xem [Alembic](#alembic--migration-schema) bên dưới). Test nằm ở `backend/tests/`.

---

## `core/` — hạ tầng dùng chung

Không chứa nghiệp vụ đặt phòng. Mọi router/model đều import từ đây.

| File | Ý nghĩa |
|---|---|
| `config.py` | Đọc biến môi trường (`.env`) bằng **pydantic-settings** `BaseSettings`: host, CORS, `DATABASE_URL`. `get_settings()` được cache. |
| `db.py` | Engine SQLAlchemy + `SessionLocal`. `get_db()` là FastAPI dependency: mở session, `yield`, đóng khi xong request. |
| `security.py` | `hash_password` / `verify_password`, `create_access_token` / `decode_access_token`. Token demo (base64, không JWT, không hết hạn) — đủ cho đồ án, không dùng production. |

---

## `models/` — tầng ORM (database)

Ánh xạ 1-1 với bảng PostgreSQL. Dùng SQLAlchemy 2.0 (`Mapped` / `mapped_column`). **Không** định nghĩa shape JSON ở đây.

| File | Ý nghĩa |
|---|---|
| `base.py` | `Base(DeclarativeBase)` — metadata chung cho mọi bảng và Alembic. |
| `hotel.py` | Domain khách sạn: `Admin`, `Role`, `Permission`, `User`, `RoomType`, `Room`, `Booking`, `BookingItem`, `Payment`, `Refund` + bảng trung gian `admin_roles`, `role_permissions`. |
| `page.py` | Model `Page` còn lại từ scaffold CMS ban đầu (`pages` table). Không thuộc nghiệp vụ đặt phòng. |
| `__init__.py` | Re-export model để Alembic/`env.py` import một chỗ, đảm bảo metadata đủ khi generate migration. |

Khi ORM và Pydantic trùng tên (`User`, `Room`, …), router alias model: `from app.models.hotel import User as UserModel`.

Không thêm cột/bảng mới trừ khi được yêu cầu — phải tạo Alembic migration (`make migration name=...`).

---

## `schemas/` — tầng DTO (JSON)

Contract với frontend / Swagger: body request, query, response. Tách khỏi ORM vì JSON thường khác bảng (ví dụ `User` response không có `password_hash`). Chi tiết API Pydantic đang dùng: [Pydantic](#pydantic-v2--dto--settings).

| File | Ý nghĩa |
|---|---|
| `hotel.py` | Enum (`BookingStatus`, `RoomStatus`, …) và DTO (`LoginRequest`, `Booking`, `Paginated[T]`, …) khớp `openapi.yaml`. |
| `page.py` | Schema CRUD cho `Page` (scaffold CMS). |

---

## `api/` — tầng HTTP

FastAPI router: path, method, status code, `Depends`. Không chứa câu SQL phức tạp lâu dài — query nên ở handler (hoặc tách service sau này), nhưng hiện tại handler gọi thẳng `Session`.

| File | Ý nghĩa |
|---|---|
| `deps.py` | `CurrentUser` / `CurrentAdmin`: đọc Bearer token, decode, query DB, 401 nếu sai/locked. Router chỉ khai báo type, không parse token lại. |
| `pages.py` | `GET /api/pages` — leftover CMS, không dùng cho HotelBook. |

### `api/v1/` — REST API HotelBook

Prefix `/api/v1/...`. Mỗi file là một cụm nghiệp vụ (khớp phân công Task A–D).

| File | Prefix / phạm vi | Ý nghĩa |
|---|---|---|
| `auth.py` | `/api/v1/auth` | Đăng ký, đăng nhập, logout, `/me` của **khách hàng**. Đã nối PostgreSQL. |
| `catalog.py` | `/api/v1/room-types`, `/api/v1/rooms` | Catalog công khai: danh sách loại phòng, tìm phòng trống. Không cần đăng nhập. |
| `bookings.py` | `/api/v1/bookings` | Đặt phòng phía khách: list, checkout, chi tiết, hủy. Cần `CurrentUser`. |
| `admin.py` | `/api/v1/admin/...` | Toàn bộ CMS: login admin, dashboard, CRUD loại phòng/phòng, booking, payment, refund, khách hàng, nhân viên. Nhiều sub-router trong cùng file. Login admin đã nối DB; phần CRUD còn stub. |
| `stubs.py` | (không phải router) | Factory trả object giả (`stub_booking`, `stub_room`, …) cho handler chưa query DB. Xóa dần khi endpoint được hiện thực. |

`admin.py` tách sub-router theo tag OpenAPI (`auth_router`, `room_types_router`, `refunds_router`, …). Endpoint mới của admin gắn vào sub-router sẵn có, không tạo file router mới trừ khi không có chỗ hợp lý.

---

## Pydantic v2 — DTO & settings

### Pydantic là gì

**Pydantic** là thư viện Python dùng **type hint** để mô tả, kiểm tra và chuyển đổi dữ liệu. Khai báo một class kế thừa `BaseModel` với các field (`email: str`, `password: str`) — Pydantic sẽ:

1. **Validate** — JSON/dict gửi lên có đúng field, đúng kiểu không. Sai thì raise lỗi (FastAPI trả **422**), handler không chạy với data hỏng.
2. **Parse / coerce** — `"1"` có thể thành `int` 1, ISO string thành `date`, tùy annotation.
3. **Serialize** — object Python → JSON khi trả response (`model_dump()` / FastAPI tự gọi).
4. **Sinh schema** — FastAPI đọc class Pydantic để vẽ Swagger (`/docs`) khớp `openapi.yaml`.

Khác `dict` thường: `dict` không biết `email` phải là string, không tự báo lỗi. Khác SQLAlchemy **model**: model = hàng trong Postgres (có `password_hash`, FK, `relationship`). Pydantic **schema** = hình dạng JSON ra/vào API (không lộ hash, có thể gộp field từ nhiều bảng). Hai tầng này cố ý tách.

Ví dụ `POST /api/v1/auth/login`: body phải khớp `LoginRequest`. Thiếu `password` hoặc `email` không phải string → 422, chưa đụng DB.

```python
class LoginRequest(BaseModel):
    email: str
    password: str
```

FastAPI gắn schema vào router (`body: LoginRequest`) nên validation xảy ra **trước** hàm `login()`. Response `TokenResponse` / `User` cũng là Pydantic: chỉ field được khai báo mới ra JSON.

`pydantic-settings` là phần mở rộng cùng họ: dùng `BaseModel` để đọc **biến môi trường** (`.env`) thay vì JSON HTTP — trong repo đó là `app/core/config.py`.

### Phiên bản đang dùng

Đang dùng **Pydantic v2**, không phải v1. Khai báo trong `backend/pyproject.toml`; phiên bản lock trong `backend/poetry.lock`:

| Package | Constraint (`pyproject.toml`) | Lock hiện tại | Vai trò |
|---|---|---|---|
| `pydantic` | (kéo theo FastAPI) | **2.13.4** | `BaseModel`, `ConfigDict`, `Field`, `field_validator` |
| `pydantic-core` | (kéo theo pydantic) | 2.46.4 | Engine validate/serialize |
| `pydantic-settings` | `^2.11.0` | **2.14.2** | Đọc `.env` vào `Settings` |

Không dùng API v1: `class Config`, `orm_mode = True`, `.dict()`, `.parse_obj()`. Tương đương v2: `model_config = ConfigDict(...)`, `from_attributes=True`, `.model_dump()`, `.model_validate()`.

### Schema (`app/schemas/`)

Mọi DTO kế thừa `pydantic.BaseModel`. FastAPI lấy type hint để validate request và sinh OpenAPI.

| Pattern | Cách dùng trong repo |
|---|---|
| Type hint | `email: str`, `phone: str \| None = None` — FastAPI/Pydantic tự 422 nếu sai kiểu. |
| `ConfigDict(from_attributes=True)` | Cho schema đọc từ ORM (`User`, `RoomType`, `Room`, `AdminAccount`, `PageRead`). Cho phép `Schema.model_validate(row)` thay vì map từng field. |
| `str, Enum` | `BookingStatus`, `RoomStatus`, `PaymentStatus`, `PaymentMethod`, `RefundStatus`, `AccountStatus`, `AdminRole` — JSON ra đúng string (`"PENDING"`), không phải int. |
| `Generic` + `Field` | `Paginated[T]` (`items`, `total`, `page`, `page_size`) — list endpoint dùng chung. `items` dùng `Field(default_factory=list)`. |
| Write vs Read | `RoomTypeWrite` / `RoomWrite` / `AdminWrite` = body tạo/sửa (không có `id`). `RoomType` / `Room` = response. |

Khi ORM và schema trùng tên, router alias model: `from app.models.hotel import User as UserModel`.

### Settings (`app/core/config.py`)

`Settings` kế thừa `pydantic_settings.BaseSettings` (không phải `BaseModel` thường):

- `SettingsConfigDict(env_file=".env", extra="ignore")` — đọc env, bỏ key lạ.
- `field_validator("api_cors_origins", mode="before")` — nhận chuỗi `"a,b"` hoặc list.
- `NoDecode` trên `api_cors_origins` để pydantic-settings không tự JSON-decode giá trị CORS.

`get_settings()` bọc `@lru_cache` để không parse `.env` mỗi request. Alembic `env.py` cũng gọi `get_settings().database_url` thay vì hardcode URL trong `alembic.ini`.

---

## Alembic — migration schema

**Alembic 1.16+** (`^1.16.5` trong `pyproject.toml`, lock **1.18.5**). Công cụ migration của SQLAlchemy: so sánh `Base.metadata` (models) với PostgreSQL rồi sinh/áp dụng revision SQL.

Nằm **ngoài** `app/`, cạnh package:

```text
backend/
├── alembic.ini              # Cấu hình Alembic (script_location, logging)
├── alembic/
│   ├── env.py               # Kết nối DB + target_metadata = Base.metadata
│   ├── script.py.mako       # Template file revision mới
│   └── versions/            # Chuỗi revision đã apply
│       ├── 20260727_0001_create_pages_table.py
│       └── 20260825_0002_create_hotel_tables.py
└── app/                     # Models mà Alembic đọc metadata
```

### `env.py` gắn với `app/`

`alembic/env.py` import `from app.models import Base` và `from app.core.config import get_settings`, rồi:

1. Ghi đè `sqlalchemy.url` bằng `settings.database_url` (cùng `.env` với FastAPI).
2. Gán `target_metadata = Base.metadata` — autogenerate chỉ thấy bảng nếu model đã được import. Vì vậy `app/models/__init__.py` re-export mọi model; thiếu import = Alembic tưởng bảng đã bị xóa.

Chạy online (kết nối Postgres) hoặc offline (in SQL ra stdout).

### Chuỗi revision hiện tại

Linear, một nhánh — **không** tạo revision song song (dễ conflict khi merge):

| Revision | File | Việc |
|---|---|---|
| `20260727_0001` | `create_pages_table.py` | Bảng `pages` (scaffold CMS). `down_revision = None`. |
| `20260825_0002` | `create_hotel_tables.py` | 12 bảng HotelBook + `admin_roles` / `role_permissions`. `down_revision = 20260727_0001`. Autogenerate từ `models/hotel.py`. |

`head` hiện tại = `20260825_0002`. Container `api` chạy `alembic upgrade head` khi start.

### Lệnh

Từ **root repo** (Makefile) hoặc `cd backend`:

| Việc | Lệnh |
|---|---|
| Áp dụng hết revision chưa chạy | `make migrate` → `poetry run alembic upgrade head` |
| Sinh revision mới từ diff model ↔ DB | `make migration name=ten_thay_doi` → `alembic revision --autogenerate -m "..."` |
| Xem revision đang đứng | `cd backend && poetry run alembic current` |
| Lùi 1 bước | `cd backend && poetry run alembic downgrade -1` |

Sau `autogenerate`, **đọc lại file** trong `alembic/versions/` trước khi commit: Alembic có thể bỏ sót đổi `server_default`, rename cột, hoặc đề xuất drop bảng không liên quan. Chỉ thêm cột/bảng mới khi đã thống nhất với nhóm — revision mới phải `down_revision` trỏ đúng `head` hiện tại, không fork nhánh.

`make seed` **không** phải Alembic: seed ghi dữ liệu mẫu sau khi schema đã `upgrade head`.

---

## Quy ước khi sửa code

1. **Model** (`models/`) = bảng DB. **Schema** (`schemas/`) = JSON. Không trộn hai tầng.
2. Auth: chỉ `CurrentUser` / `CurrentAdmin` từ `api/deps.py`.
3. DB: chỉ `get_db` từ `core/db.py`.
4. List endpoint trả `Paginated[T]` (`page`, `page_size`, mặc định 1/20).
5. Lỗi: `404` không tìm thấy, `409` xung đột (trùng email, xóa loại phòng còn phòng), `400` sai trạng thái nghiệp vụ.
6. Nhiều ghi liên quan nhau (checkout = booking + chi tiết + payment) nằm trong **một** transaction.
7. Schema mới: Pydantic **v2** (`ConfigDict`, `model_validate`) — không `orm_mode` / `.dict()`.
8. Đổi bảng: tạo Alembic revision (`make migration name=...`) nối tiếp `head`, không sửa file revision đã merge.

Chạy test: `cd backend && poetry run pytest`. Swagger local: http://localhost:8001/docs.

## Tài liệu tham khảo

- [FastAPI](https://fastapi.tiangolo.com/) — docs chính thức (router, `Depends`, Pydantic, OpenAPI/Swagger). Bắt đầu từ [Tutorial - User Guide](https://fastapi.tiangolo.com/tutorial/).
