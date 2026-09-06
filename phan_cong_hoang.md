# Task B — Loại phòng & Phòng (Hoàng)

> File phân công riêng cho **Hoàng**. Tổng quan cả nhóm + ma trận endpoint:
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
> **Login đã hoạt động thật ở cả 2 phía**. Task B **không cần đụng lại** `auth.py`, phần `AdminAuth`
> trong `admin.py`, hay 2 trang login/logout — chỉ tập trung vào loại phòng & phòng.

**Branch đề xuất**: `feat/api-rooms`

**Bảng**: `LOAIPHONG`, `PHONG`

## Backend — checklist endpoint

- [x] `GET /api/v1/room-types` (P1) — list `LOAIPHONG` kèm `room_count`
- [x] `GET /api/v1/room-types/{id}` (P3) — chi tiết loại phòng + `available_rooms` (join `PHONG`,
      loại trừ phòng đang bị giữ bởi `CT_DATPHONG`→`DATPHONG` giao khoảng `check_in`/`check_out`
      nếu query truyền vào, và `PHONG.trang_thai ≠ MAINTENANCE`)
- [ ] `GET /api/v1/rooms/availability` (P2, P4) — tìm phòng trống theo ngày + loại phòng + số
      lượng + khoảng giá (logic lọc mô tả chi tiết ở mục P2 `screens.md`)
- [x] `GET /api/v1/admin/room-types` (A3) — list + tìm kiếm `q` + phân trang
- [x] `POST /api/v1/admin/room-types` (A3) — tạo mới
- [x] `GET /api/v1/admin/room-types/{id}` (A3) — chi tiết (form sửa)
- [x] `PUT /api/v1/admin/room-types/{id}` (A3) — cập nhật
- [x] `DELETE /api/v1/admin/room-types/{id}` (A3) — xóa, chặn 409 nếu còn `PHONG` tham chiếu
- [x] `GET /api/v1/admin/rooms` (A4) — list + lọc `loai_phong_id`/`trang_thai` + tìm kiếm + phân trang
- [x] `POST /api/v1/admin/rooms` (A4) — tạo mới, chặn 409 nếu `so_phong` trùng
- [x] `GET /api/v1/admin/rooms/{id}` (A4) — chi tiết (form sửa)
- [x] `PUT /api/v1/admin/rooms/{id}` (A4) — cập nhật
- [x] `DELETE /api/v1/admin/rooms/{id}` (A4) — xóa, chặn 409 nếu phòng đang có `CT_DATPHONG` của
      đơn chưa hoàn tất (`trang_thai` khác `CANCELLED`/`CHECKED_OUT`)
- [x] `PATCH /api/v1/admin/rooms/{id}/status` (A4) — đổi `trang_thai` (nút "Bảo trì"), chặn nếu
      đang gắn đơn chưa hoàn tất tương tự như xóa

## Frontend — checklist trang

- [x] `app/(public)/page.tsx` (P1)
- [x] `app/(public)/rooms/page.tsx` (P2)
- [x] `app/(public)/rooms/[id]/page.tsx` (P3)
- [x] `app/(admin)/admin/room-types/page.tsx`
- [x] `app/(admin)/admin/room-types/new/page.tsx`
- [x] `app/(admin)/admin/room-types/[id]/edit/page.tsx`
- [x] `app/(admin)/admin/rooms/page.tsx`
- [x] `app/(admin)/admin/rooms/new/page.tsx`
- [x] `app/(admin)/admin/rooms/[id]/edit/page.tsx`

## KHÔNG thuộc Task B (dễ nhầm)

- Trang `/cart` (P4) là của **Task C** (Vũ) — Task B chỉ cung cấp API `GET /rooms/availability` mà
  nút "Áp dụng ngày" trên `/cart` sẽ gọi lại, không cần tự làm UI giỏ hàng.
- Việc phòng "đang bị giữ" (để tính `available_rooms`/`availability`) chỉ cần **đọc**
  `DATPHONG`/`CT_DATPHONG` (bảng của Task C) — không tạo, không sửa 2 bảng này.

## Lưu ý phối hợp

Logic kiểm tra "phòng trống trong khoảng ngày" gần như giống hệt giữa `GET /room-types/{id}` và
`GET /rooms/availability` — nên viết thành 1 hàm dùng chung trong `catalog.py` thay vì lặp code
2 lần. Đồng thời **thống nhất sớm với Vũ** (Task C) về câu query này, vì Task C cũng cần kiểm tra
lại "phòng còn trống" ngay trong transaction `checkout` để tránh race condition — nếu 2 người viết
2 hàm khác nhau có thể cho kết quả không nhất quán.

Domain nào đụng bảng của domain khác chỉ cần *đọc* đúng phần đã thống nhất — không tự đổi model
của domain khác. Nếu cần đổi, báo trong nhóm trước.

## Definition of Done

- [ ] 14 endpoint ở checklist trả dữ liệu thật
- [ ] Test qua Swagger UI: CRUD loại phòng, CRUD phòng, tìm phòng trống theo ngày cho kết quả đúng
- [x] Test case xóa loại phòng đang có phòng → nhận 409 (không phải 500)
- [x] 9 trang frontend hiển thị dữ liệu thật

## Quy trình tự kiểm trước khi mở PR

1. Tạo branch `feat/api-rooms`, PR riêng để Long review.
2. Tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI thật
   (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà chưa thử
   trên giao diện.
3. Dùng checklist "Definition of Done" ở trên làm tiêu chí tự kiểm tra trước khi mở PR.
