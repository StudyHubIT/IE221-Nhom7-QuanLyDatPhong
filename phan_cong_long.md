# Task 0 — Nền tảng DB & Auth (Long)

> File phân công riêng cho **Long**. Tổng quan cả nhóm + ma trận endpoint:
> [`phan_cong_cong_viec.md`](phan_cong_cong_viec.md). Lịch sử Task 0 (bản gốc):
> [`documents/phan-cong-api.md`](documents/phan-cong-api.md).

Bối cảnh: Long dựng scaffold FastAPI + schema Pydantic khớp
[`documents/openapi.yaml`](documents/openapi.yaml), viết model/migration/seed Postgres, rồi hiện
thực cụm Auth (khách + admin) query DB thật. Các endpoint nghiệp vụ còn lại lúc đó trả dữ liệu
giả từ `stubs.py` — Task A/B/C/D của Tịnh/Hoàng/Vũ/Hiệp nối Postgres sau.

File này **chỉ inventory phần backend**. UI mock + nối login frontend không nằm trong checklist
dưới đây.

**Commit gốc**: `185db35` (scaffold HotelBook API), `34302e0` (DB + Auth thật).

**Bảng**: toàn bộ schema khách sạn — `ADMINS`, `ROLES`, `PERMISSIONS`, `ADMIN_ROLES`,
`ROLE_PERMISSIONS`, `USERS`, `LOAIPHONG`, `PHONG`, `DATPHONG`, `CT_DATPHONG`, `PAYMENTS`,
`REFUNDS`

## Backend — checklist endpoint (Auth thật, trong `auth.py` và `AdminAuth` của `admin.py`)

- [x] `POST /api/v1/auth/register` — tạo `USERS`, hash mật khẩu, 409 nếu email trùng, trả token
- [x] `POST /api/v1/auth/login` — kiểm tra email/password trên `USERS`, 401 nếu sai
- [x] `POST /api/v1/auth/logout` — 204 (token stateless, không revoke phía server)
- [x] `GET /api/v1/auth/me` — profile user theo `CurrentUser`
- [x] `POST /api/v1/admin/auth/login` — login bảng `ADMINS`
- [x] `POST /api/v1/admin/auth/logout` — 204
- [x] `GET /api/v1/admin/auth/me` — profile admin + role `SUPER_ADMIN` / `STAFF` (qua
      `ADMIN_ROLES` → `ROLES`)

## Backend — nền tảng (không phải endpoint nghiệp vụ)

- [x] Spec OpenAPI [`documents/openapi.yaml`](documents/openapi.yaml) + schema Pydantic
      `backend/app/schemas/hotel.py` (enum trạng thái, request/response toàn API)
- [x] Mount router FastAPI trong `backend/app/main.py`: Auth, Catalog, Bookings, Admin, `/health`
- [x] `UserBearer` / `AdminBearer` + `get_current_user` / `get_current_admin` trong
      `backend/app/api/deps.py` — decode token, query DB, 401 nếu sai loại token / tài khoản
      `LOCKED`; giữ interface `CurrentUser` / `CurrentAdmin` cho Task A–D
- [x] `get_db()` session SQLAlchemy dùng chung (`backend/app/core/db.py`)
- [x] Hash mật khẩu + tạo/decode token (`backend/app/core/security.py`) — demo: MD5 + token
      base64 `user:{id}` / `admin:{id}` (không phải JWT ký)
- [x] SQLAlchemy model `backend/app/models/hotel.py` cho đủ bảng trong
      `documents/sql/postgres/init_tables.sql`
- [x] Alembic migration `backend/alembic/versions/20260825_0002_create_hotel_tables.py`
- [x] Seed idempotent `backend/app/db_seed.py` (`make seed`): role/permission, admin/staff,
      user mẫu (kể cả `LOCKED`), loại phòng + phòng; mật khẩu chung `password123`
- [x] Scaffold handler khớp OpenAPI (`catalog.py`, `bookings.py`, phần còn lại của `admin.py`)
      + dữ liệu giả `backend/app/api/v1/stubs.py` — để Task A–D thay bằng query DB
- [x] Pytest auth + fixture token: `backend/tests/conftest.py`,
      `backend/tests/test_hotelbook_api.py` (login đúng/sai, register trùng email, `/me` cần
      token, user token không vào route admin và ngược lại)

## KHÔNG thuộc Task 0 (dễ nhầm)

- `GET /api/v1/room-types`, `GET /api/v1/rooms/availability`, CRUD admin loại phòng/phòng —
  **Task B** (Hoàng). Long chỉ khai báo route + stub.
- `GET/POST /api/v1/bookings`, `GET /api/v1/admin/bookings`, `GET /api/v1/admin/payments` —
  **Task C** (Vũ).
- `POST /api/v1/bookings/{id}/cancel`, `GET /api/v1/admin/refunds`, approve/reject refund —
  **Task D** (Hiệp).
- `GET /api/v1/admin/customers`, CRUD admin/staff, `GET /api/v1/admin/dashboard` —
  **Task A** (Tịnh). Không đụng lại `auth.py` / `AdminAuth` khi làm A–D.

## Lưu ý nghiệp vụ

- Token không revoke được khi logout: client xóa token là đủ. Route bảo vệ vẫn decode + query
  DB mỗi request.
- Tài khoản `LOCKED` không lấy được token hợp lệ qua `CurrentUser` / `CurrentAdmin`.
- Role admin suy ra từ bảng `ROLES` (`SUPER_ADMIN` ưu tiên, còn lại `STAFF`).
- Seed chạy lại an toàn: bỏ qua nếu dữ liệu đã tồn tại.

## Lưu ý phối hợp

- Task 0 merge xong mới chia A–D, tránh 2 người cùng tạo Alembic revision.
- A–D **không** sửa `auth.py`, `AdminAuth`, `deps.py` (`CurrentUser`/`CurrentAdmin`),
  `security.py`, hay `models/hotel.py` trừ khi nhóm thống nhất trước.
- `stubs.py` là hợp đồng dữ liệu giả lúc scaffold; handler A–D thay bằng query SQLAlchemy,
  không thêm endpoint mới ngoài `openapi.yaml`.

## Definition of Done

- [x] `make migrate` chạy sạch trên DB rỗng; `make seed` có dữ liệu mẫu
- [x] 7 endpoint Auth ở checklist trả dữ liệu thật từ Postgres (không còn stub)
- [x] `POST /api/v1/auth/login` và `POST /api/v1/admin/auth/login` bằng tài khoản seed trả
      token dùng được cho `UserBearer` / `AdminBearer`
- [x] Test qua Swagger UI (`http://localhost:8001/docs`): register/login/me khách + login/me
      admin; token user bị từ chối trên route admin
- [x] Review/merge PR Task A–D sau khi từng người tự test Swagger rồi UI
