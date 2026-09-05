# Task A — Khách hàng, Tài khoản admin & Dashboard (Tịnh)

> File phân công riêng cho **Tịnh**. Tổng quan cả nhóm + ma trận endpoint:
> [`phan_cong_cong_viec.md`](phan_cong_cong_viec.md).

Bối cảnh: UI đã hoàn thành (dùng dữ liệu giả từ [`apps/web/lib/mock-data.ts`](apps/web/lib/mock-data.ts)).
Backend đã có scaffold FastAPI + Pydantic schema khớp [`documents/openapi.yaml`](documents/openapi.yaml),
nhưng phần lớn endpoint vẫn trả dữ liệu giả từ `stubs.py`, chưa nối PostgreSQL. Việc cần làm: hiện
thực model + query DB thật cho từng endpoint, và sửa các trang frontend tương ứng để gọi API thay
vì import `mock-data`.

Tham khảo bắt buộc trước khi code: [`documents/screens.md`](documents/screens.md) (mô tả từng màn
hình), [`documents/openapi.yaml`](documents/openapi.yaml) (mở bằng https://editor.swagger.io),
[`documents/sql/erd.md`](documents/sql/erd.md).

> **Task 0 (nền tảng DB & Auth) đã xong** — chi tiết ở [`documents/phan-cong-api.md`](documents/phan-cong-api.md).
> **Login đã hoạt động thật ở cả 2 phía** (`/login`, `/admin/login`, header/sidebar hiển thị đúng
> phiên đăng nhập, có đăng xuất, có chặn truy cập `/account/*` và `/admin/*` khi chưa đăng nhập).
> Task A **không cần đụng lại** `auth.py`, phần `AdminAuth` trong `admin.py`, hay 2 trang
> login/logout — chỉ tập trung vào phần còn lại.

**Branch đề xuất**: `feat/api-accounts`

**Bảng**: `USERS` (đọc/khóa), `ADMINS`, `ROLES`, `PERMISSIONS`, `ADMIN_ROLES`, `ROLE_PERMISSIONS`

## Backend — checklist endpoint (trong `admin.py`)

- [ ] `GET /api/v1/admin/customers` (A9) — list `USERS`, lọc `status`, tìm kiếm `q` (email/tên/sđt), phân trang
- [ ] `PATCH /api/v1/admin/customers/{id}/status` (A9) — khóa/mở tài khoản khách (`ACTIVE`↔`LOCKED`)
- [ ] `GET /api/v1/admin/admins` (A10) — list `ADMINS` kèm role hiện tại (qua `ADMIN_ROLES`→`ROLES`)
- [ ] `POST /api/v1/admin/admins` (A10) — tạo admin, hash password, gán 1 role qua `ADMIN_ROLES`, check email trùng → 409
- [ ] `GET /api/v1/admin/admins/{id}` (A10) — chi tiết 1 admin (form sửa)
- [ ] `PUT /api/v1/admin/admins/{id}` (A10) — sửa admin; `password` optional (chỉ hash lại nếu có gửi)
- [ ] `PATCH /api/v1/admin/admins/{id}/status` (A10) — khóa/mở tài khoản admin
- [ ] `GET /api/v1/admin/roles` (A10) — list `ROLES` kèm `PERMISSIONS` (qua `ROLE_PERMISSIONS`), **chỉ đọc**, không cần tạo mới role/permission
- [ ] `GET /api/v1/admin/dashboard` (A2) — đếm đơn theo `trang_thai`, doanh thu tháng (`PAYMENTS.status=PAID`), số phòng theo `trang_thai`, số refund `REQUESTED`, danh sách refund/booking mới nhất

## Frontend — checklist trang

- [ ] `app/(admin)/admin/customers/page.tsx`
- [ ] `app/(admin)/admin/staff/page.tsx`
- [ ] `app/(admin)/admin/staff/new/page.tsx`
- [ ] `app/(admin)/admin/staff/[id]/edit/page.tsx`
- [ ] `app/(admin)/admin/page.tsx` (dashboard)

## KHÔNG thuộc Task A (dễ nhầm)

- Nút "Xem đơn của khách" trên A9 chỉ là **link** sang `/admin/bookings?user_id=...` — endpoint
  `GET /api/v1/admin/bookings` (kèm filter `user_id`) đã là việc của **Task C** (Vũ), Task A không cần
  implement lại, chỉ cần link đúng query param.
- Trang login (`/login`, `/admin/login`) và toàn bộ cơ chế session/logout: **đã xong ở Task 0**,
  không đụng vào.

## Lưu ý nghiệp vụ

- A10 nên giới hạn quyền truy cập cho `SUPER_ADMIN` (theo mục 5.2 `screens.md`) — có thể tạm thời
  bỏ qua nếu chưa kịp, ghi rõ TODO.
- A9 khóa tài khoản (`status=LOCKED`) không được xóa dữ liệu `DATPHONG`/`PAYMENTS` liên quan.
- A2 (Dashboard) đọc dữ liệu từ **tất cả** domain khác (`DATPHONG`, `PAYMENTS`, `PHONG`, `REFUNDS`)
  — làm **sau cùng**, sau khi Task B/C/D đã có dữ liệu thật, nếu không sẽ luôn trả số 0.

## Lưu ý phối hợp

- Dashboard chỉ *đọc* bảng của Task B/C/D (`PHONG`, `DATPHONG`, `PAYMENTS`, `REFUNDS`) — không tự
  đổi model của domain khác. Nếu cần đổi, báo trong nhóm trước.
- Test lại Dashboard lần 2 sau khi Hoàng/Vũ/Hiệp merge, vì số liệu phụ thuộc dữ liệu thật của họ.

## Definition of Done

- [ ] Tất cả 9 endpoint ở checklist trên trả dữ liệu thật từ Postgres (không còn stub)
- [ ] Test qua Swagger UI: tạo/sửa/khóa 1 admin, khóa/mở 1 khách hàng thành công
- [ ] Cả 5 trang frontend hiển thị dữ liệu thật, không còn import `mock-data` cho phần liên quan
- [ ] Dashboard hiển thị số liệu đúng sau khi Task B/C/D đã có dữ liệu (test lại lần 2 sau khi các
      task khác merge)

## Quy trình tự kiểm trước khi mở PR

1. Tạo branch `feat/api-accounts`, PR riêng để Long review.
2. Tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI thật
   (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà chưa thử
   trên giao diện.
3. Dùng checklist "Definition of Done" ở trên làm tiêu chí tự kiểm tra trước khi mở PR.
