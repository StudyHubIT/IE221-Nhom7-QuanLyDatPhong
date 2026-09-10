# Phân công triển khai API (thay dữ liệu hardcoded bằng API thật)

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
> 4 task dưới đây **không cần đụng lại** `auth.py`, phần `AdminAuth` trong `admin.py`, hay 2 trang
> login/logout — chỉ tập trung vào phần còn lại.

**Cách chia**: mỗi task ôm trọn 1 cụm nghiệp vụ — cả API phía khách (public) lẫn phía CMS
(admin) của cụm đó — để một người nắm được toàn bộ logic thay vì chỉ thấy nửa câu chuyện.

**Mục đích tài liệu này**: ma trận endpoint + link tới file phân công từng người. Chi tiết
checklist, phạm vi, và Definition of Done nằm ở file riêng của mỗi thành viên — không ai phải
đoán hoặc vô tình làm trùng/bỏ sót việc của người khác. Mỗi endpoint trong `openapi.yaml` xuất
hiện **đúng một lần** trong 4 task (trừ các endpoint đã xong ở Task 0, được đánh dấu ✅ DONE).

## Vai trò & file phân công

| Thành viên | Task | File chi tiết |
|---|---|---|
| Tịnh | A — Khách hàng, Tài khoản admin & Dashboard | [`phan_cong_tinh.md`](phan_cong_tinh.md) |
| Hoàng | B — Loại phòng & Phòng | [`phan_cong_hoang.md`](phan_cong_hoang.md) |
| Vũ | C — Đặt phòng & Thanh toán | [`phan_cong_vu.md`](phan_cong_vu.md) |
| Hiệp | D — Hủy đặt phòng & Hoàn tiền | [`phan_cong_hiep.md`](phan_cong_hiep.md) |

## Ma trận endpoint ↔ Task (tổng quan, xem chi tiết ở file từng người)

| Method | Endpoint | Task |
|---|---|---|
| POST | `/api/v1/auth/register` | ✅ DONE (Task 0) |
| POST | `/api/v1/auth/login` | ✅ DONE (Task 0) |
| POST | `/api/v1/auth/logout` | ✅ DONE (Task 0) |
| GET | `/api/v1/auth/me` | ✅ DONE (Task 0) |
| POST | `/api/v1/admin/auth/login` | ✅ DONE (Task 0) |
| POST | `/api/v1/admin/auth/logout` | ✅ DONE (Task 0) |
| GET | `/api/v1/admin/auth/me` | ✅ DONE (Task 0) |
| GET | `/api/v1/room-types` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/room-types/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/rooms/availability` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/admin/room-types` | **B** — [Hoàng](phan_cong_hoang.md) |
| POST | `/api/v1/admin/room-types` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/admin/room-types/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| PUT | `/api/v1/admin/room-types/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| DELETE | `/api/v1/admin/room-types/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/admin/rooms` | **B** — [Hoàng](phan_cong_hoang.md) |
| POST | `/api/v1/admin/rooms` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/admin/rooms/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| PUT | `/api/v1/admin/rooms/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| DELETE | `/api/v1/admin/rooms/{id}` | **B** — [Hoàng](phan_cong_hoang.md) |
| PATCH | `/api/v1/admin/rooms/{id}/status` | **B** — [Hoàng](phan_cong_hoang.md) |
| GET | `/api/v1/bookings` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| POST | `/api/v1/bookings` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| GET | `/api/v1/bookings/{id}` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| GET | `/api/v1/admin/bookings` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| GET | `/api/v1/admin/bookings/{id}` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| PATCH | `/api/v1/admin/bookings/{id}/status` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| GET | `/api/v1/admin/payments` | ✅ DONE (**C** — [Vũ](phan_cong_vu.md)) |
| POST | `/api/v1/bookings/{id}/cancel` | **D** — [Hiệp](phan_cong_hiep.md) |
| GET | `/api/v1/admin/refunds` | **D** — [Hiệp](phan_cong_hiep.md) |
| POST | `/api/v1/admin/refunds/{id}/approve` | **D** — [Hiệp](phan_cong_hiep.md) |
| POST | `/api/v1/admin/refunds/{id}/reject` | **D** — [Hiệp](phan_cong_hiep.md) |
| GET | `/api/v1/admin/customers` | **A** — [Tịnh](phan_cong_tinh.md) |
| PATCH | `/api/v1/admin/customers/{id}/status` | **A** — [Tịnh](phan_cong_tinh.md) |
| GET | `/api/v1/admin/admins` | **A** — [Tịnh](phan_cong_tinh.md) |
| POST | `/api/v1/admin/admins` | **A** — [Tịnh](phan_cong_tinh.md) |
| GET | `/api/v1/admin/admins/{id}` | **A** — [Tịnh](phan_cong_tinh.md) |
| PUT | `/api/v1/admin/admins/{id}` | **A** — [Tịnh](phan_cong_tinh.md) |
| PATCH | `/api/v1/admin/admins/{id}/status` | **A** — [Tịnh](phan_cong_tinh.md) |
| GET | `/api/v1/admin/roles` | **A** — [Tịnh](phan_cong_tinh.md) |
| GET | `/api/v1/admin/dashboard` | **A** — [Tịnh](phan_cong_tinh.md) (làm sau cùng) |

## Quy trình làm việc đề xuất

1. Task 0 (đã xong) — không cần làm lại.
2. Task A/B/C/D chạy song song, mỗi người tạo branch riêng (`feat/api-accounts`, `feat/api-rooms`,
   `feat/api-bookings`, `feat/api-refunds`), PR riêng để Long review.
3. Mỗi PR nên tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI
   thật (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà
   chưa thử trên giao diện. Dùng checklist "Definition of Done" ở file từng người làm tiêu chí tự
   kiểm tra trước khi mở PR.
4. Domain nào đụng bảng của domain khác (vd. Task A đọc `DATPHONG`/`PAYMENTS`/`REFUNDS` của B/C/D
   cho Dashboard, Task D ghi `DATPHONG.trang_thai` khi duyệt refund) chỉ cần *đọc* hoặc ghi đúng
   phần đã thống nhất ở mục "Lưu ý phối hợp"/"KHÔNG thuộc phạm vi" của từng task, không tự đổi
   model của domain khác — nếu cần đổi, báo trong nhóm trước.
5. Task C và Task D cùng sửa `bookings.py` — thống nhất thứ tự merge hoặc tách hàm
   `cancel_my_booking` ra file riêng ngay từ đầu để giảm rủi ro conflict.
6. Khi cả 4 task merge xong, Long tổng hợp để soạn báo cáo.
