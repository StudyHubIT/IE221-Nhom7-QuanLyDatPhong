# Task C — Đặt phòng & Thanh toán (Vũ)

> File phân công riêng cho **Vũ**. Tổng quan cả nhóm + ma trận endpoint:
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
> **Login đã hoạt động thật ở cả 2 phía**. Task C **không cần đụng lại** `auth.py`, phần `AdminAuth`
> trong `admin.py`, hay 2 trang login/logout — chỉ tập trung vào đặt phòng & thanh toán.

**Branch đề xuất**: `feat/api-bookings`

**Bảng**: `DATPHONG`, `CT_DATPHONG`, `PAYMENTS` (đọc thêm `PHONG`)

## Backend — checklist endpoint (trong `bookings.py`, `admin_bookings.py`, `admin_payments.py`)

- [x] `GET /api/v1/bookings` (P8) — đơn của tôi, lọc `status`, phân trang
- [x] `POST /api/v1/bookings` (P6) — **quan trọng nhất**: 1 transaction tạo `DATPHONG` + nhiều
      `CT_DATPHONG` + `PAYMENTS(status=PAID)`, set `trang_thai=CONFIRMED`; kiểm tra lại phòng còn
      trống *trong* transaction, trả 409 nếu bị đặt mất (race condition)
- [x] `GET /api/v1/bookings/{id}` (P7, P9) — chi tiết đơn của tôi (kèm `rooms`, `payment`, `refund`
      nếu có — `refund` là dữ liệu do Task D tạo, Task C chỉ cần đọc và trả về đúng field)
- [x] `GET /api/v1/admin/bookings` (A5) — list + lọc `status`/`from`/`to`/`user_id`/`q` + phân
      trang (param `user_id` này chính là cái Task A dùng để link từ A9 sang)
- [x] `GET /api/v1/admin/bookings/{id}` (A6) — chi tiết đơn (admin)
- [x] `PATCH /api/v1/admin/bookings/{id}/status` (A6) — chuyển
      `PENDING→CONFIRMED→CHECKED_IN→CHECKED_OUT`, chặn 400 nếu nhảy ngược/nhảy cách
- [x] `GET /api/v1/admin/payments` (A7) — list + lọc `status`/`method` + phân trang (gộp vào task
      này vì `PAYMENTS` chỉ được tạo ra từ `checkout`, cùng một mạch dữ liệu với booking)

## Frontend — checklist trang

- [x] `app/(public)/cart/page.tsx` (P4)
- [x] `app/(public)/checkout/page.tsx` (P6)
- [x] `app/(public)/checkout/success/page.tsx` (P7)
- [x] `app/(public)/account/bookings/page.tsx` (P8)
- [x] `app/(public)/account/bookings/[id]/page.tsx` (P9) — **chỉ phần hiển thị thông tin đơn**;
      nút "Hủy đặt phòng" trên cùng trang này thuộc Task D, xem ghi chú bên dưới
- [x] `app/(admin)/admin/bookings/page.tsx` (A5)
- [x] `app/(admin)/admin/bookings/[id]/page.tsx` (A6)
- [x] `app/(admin)/admin/payments/page.tsx` (A7)

## KHÔNG thuộc Task C (dễ nhầm)

- `POST /api/v1/bookings/{id}/cancel` — tuy nằm cùng file `bookings.py` nhưng thuộc **Task D**
  (Hiệp), không tự viết hàm này.
- `GET /api/v1/admin/refunds` và duyệt/từ chối refund — thuộc Task D, kể cả khi thấy field
  `refund` xuất hiện trong response `Booking`/`Payment`.

## Lưu ý phối hợp

- Cùng sửa `bookings.py` với Hiệp (Task D) — thống nhất thứ tự merge trước, hoặc tách hàm
  `cancel_my_booking` ra router/file riêng ngay từ đầu (vd. `refunds.py`, include vào
  `bookings_router` hoặc router riêng) để tránh conflict khi cả 2 cùng sửa 1 file.
- Thống nhất với Hoàng (Task B) hàm kiểm tra "phòng còn trống" dùng chung, vì `checkout` cần gọi
  lại đúng logic đó trong transaction để tránh 2 khách đặt trùng phòng.
- Domain nào đụng bảng của domain khác chỉ cần *đọc* đúng phần đã thống nhất — không tự đổi model
  của domain khác. Nếu cần đổi, báo trong nhóm trước.

## Definition of Done

- [x] 7 endpoint ở checklist trả dữ liệu thật
- [x] Test 2 request `checkout` cùng lúc cho cùng 1 phòng → 1 thành công, 1 nhận 409 (test thủ
      công hoặc viết test tự động, không chỉ tin vào code review)
- [x] Test chuyển trạng thái đơn admin theo đúng thứ tự, thử nhảy ngược → nhận 400
- [x] 8 trang frontend hiển thị dữ liệu thật

## Quy trình tự kiểm trước khi mở PR

1. Tạo branch `feat/api-bookings`, PR riêng để Long review.
2. Tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI thật
   (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà chưa thử
   trên giao diện.
3. Dùng checklist "Definition of Done" ở trên làm tiêu chí tự kiểm tra trước khi mở PR.
4. Task C và Task D cùng sửa `bookings.py` — thống nhất thứ tự merge hoặc tách hàm
   `cancel_my_booking` ra file riêng ngay từ đầu để giảm rủi ro conflict.
