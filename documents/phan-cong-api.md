# Phân công triển khai API (thay dữ liệu hardcoded bằng API thật)

Bối cảnh: UI đã hoàn thành (dùng dữ liệu giả từ [`apps/web/lib/mock-data.ts`](../apps/web/lib/mock-data.ts)).
Backend đã có scaffold FastAPI + Pydantic schema khớp [`openapi.yaml`](./openapi.yaml), nhưng
mọi endpoint đang trả dữ liệu giả từ `stubs.py`, chưa nối PostgreSQL. Việc cần làm: hiện thực
model + query DB thật cho từng endpoint, và sửa các trang frontend tương ứng để gọi API thay vì
import `mock-data`.

Tham khảo bắt buộc trước khi code: [`screens.md`](./screens.md) (mô tả từng màn hình),
[`openapi.yaml`](./openapi.yaml) (mở bằng https://editor.swagger.io), [`sql/erd.md`](./sql/erd.md).

## Vai trò

| Thành viên | Việc |
|---|---|
| Long | Task 0 — Nền tảng DB & Auth (scaffold API). Checklist: [`phan_cong_long.md`](../phan_cong_long.md). Phân công, review/merge PR, soạn báo cáo |
| Tịnh | Task A — Khách hàng, Tài khoản admin & Dashboard |
| Hoàng | Task B — Loại phòng & Phòng |
| Vũ | Task C — Đặt phòng & Thanh toán |
| Hiệp | Task D — Hủy đặt phòng & Hoàn tiền |

> Chi tiết từng task nằm ở file riêng từng người — Long [`phan_cong_long.md`](../phan_cong_long.md)
> (Task 0), Tịnh [`phan_cong_tinh.md`](../phan_cong_tinh.md),
> Hoàng [`phan_cong_hoang.md`](../phan_cong_hoang.md), Vũ [`phan_cong_vu.md`](../phan_cong_vu.md),
> Hiệp [`phan_cong_hiep.md`](../phan_cong_hiep.md). Ma trận endpoint + quy trình nhóm:
> [`phan_cong_cong_viec.md`](../phan_cong_cong_viec.md). File này chỉ giữ lại Task 0 (đã xong)
> để tham khảo lịch sử; checklist việc Long đã làm nằm ở `phan_cong_long.md`.

## Task 0 — Nền tảng DB & Auth (✅ đã xong, đã merge)

**Người làm**: Long — checklist chi tiết ở [`phan_cong_long.md`](../phan_cong_long.md). Merge xong
mới bắt đầu chia việc Task A–D, tránh 2 người cùng tạo Alembic migration → conflict revision.

- Viết SQLAlchemy model cho toàn bộ bảng trong `documents/sql/postgres/init_tables.sql`:
  `ADMINS, ROLES, PERMISSIONS, ADMIN_ROLES, ROLE_PERMISSIONS, USERS, LOAIPHONG, PHONG, DATPHONG, CT_DATPHONG, PAYMENTS, REFUNDS`
  (đặt trong `backend/app/models/`, ví dụ `hotel.py`).
- Tạo 1 Alembic migration duy nhất cho các bảng trên (`make migration name=create_hotel_tables`).
- Chuyển `documents/sql/postgres/seed_data.sql` thành seed script chạy được (vd. `backend/scripts/seed.py`
  hoặc data migration) — cần ít nhất: 1 admin, vài loại phòng/phòng, 1 user mẫu để 4 người kia test.
- Thêm hashing mật khẩu (passlib/bcrypt) + tạo & verify JWT thật (python-jose hoặc PyJWT).
- Sửa `backend/app/api/deps.py`: `get_current_user`/`get_current_admin` decode JWT thật, query DB,
  raise 401 nếu invalid/hết hạn — giữ nguyên interface (`CurrentUser`, `CurrentAdmin`) để 4 router
  khác không phải sửa cách dùng.
- Thêm `db` session dependency (`AsyncSession`/`Session`) dùng chung để các router khác `Depends()`.

**Definition of done**: `make migrate` chạy sạch trên DB rỗng, seed chạy xong có dữ liệu, gọi
`POST /api/v1/auth/login` và `POST /api/v1/admin/auth/login` bằng tài khoản seed trả JWT thật dùng
được cho các route `UserBearer`/`AdminBearer` khác.

## Task A-D — xem file phân công chi tiết

Đã chuyển toàn bộ nội dung Task A/B/C/D (bảng liên quan, hàm cần viết, file frontend, lưu ý
nghiệp vụ) sang [`phan_cong_cong_viec.md`](../phan_cong_cong_viec.md) ở root — bao gồm cả phần
**login đã hoàn thành ở cả 2 phía** (không nằm trong Task A-D nữa) và cách chia lại theo cụm
nghiệp vụ (mỗi người ôm trọn cả API public lẫn admin của cụm mình phụ trách).
