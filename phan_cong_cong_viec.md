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

**Mục đích tài liệu này**: liệt kê **tường minh từng endpoint và từng trang frontend** thuộc về
task nào, để không ai phải đoán hoặc vô tình làm trùng/bỏ sót việc của người khác. Mỗi endpoint
trong `openapi.yaml` xuất hiện **đúng một lần** trong 4 task bên dưới (trừ các endpoint đã xong ở
Task 0, được đánh dấu ✅ DONE).

## Ma trận endpoint ↔ Task (tổng quan, xem chi tiết ở từng mục bên dưới)

| Method | Endpoint | Task |
|---|---|---|
| POST | `/api/v1/auth/register` | ✅ DONE (Task 0) |
| POST | `/api/v1/auth/login` | ✅ DONE (Task 0) |
| POST | `/api/v1/auth/logout` | ✅ DONE (Task 0) |
| GET | `/api/v1/auth/me` | ✅ DONE (Task 0) |
| POST | `/api/v1/admin/auth/login` | ✅ DONE (Task 0) |
| POST | `/api/v1/admin/auth/logout` | ✅ DONE (Task 0) |
| GET | `/api/v1/admin/auth/me` | ✅ DONE (Task 0) |
| GET | `/api/v1/room-types` | **B** |
| GET | `/api/v1/room-types/{id}` | **B** |
| GET | `/api/v1/rooms/availability` | **B** |
| GET | `/api/v1/admin/room-types` | **B** |
| POST | `/api/v1/admin/room-types` | **B** |
| GET | `/api/v1/admin/room-types/{id}` | **B** |
| PUT | `/api/v1/admin/room-types/{id}` | **B** |
| DELETE | `/api/v1/admin/room-types/{id}` | **B** |
| GET | `/api/v1/admin/rooms` | **B** |
| POST | `/api/v1/admin/rooms` | **B** |
| GET | `/api/v1/admin/rooms/{id}` | **B** |
| PUT | `/api/v1/admin/rooms/{id}` | **B** |
| DELETE | `/api/v1/admin/rooms/{id}` | **B** |
| PATCH | `/api/v1/admin/rooms/{id}/status` | **B** |
| GET | `/api/v1/bookings` | **C** |
| POST | `/api/v1/bookings` | **C** |
| GET | `/api/v1/bookings/{id}` | **C** |
| GET | `/api/v1/admin/bookings` | **C** |
| GET | `/api/v1/admin/bookings/{id}` | **C** |
| PATCH | `/api/v1/admin/bookings/{id}/status` | **C** |
| GET | `/api/v1/admin/payments` | **C** |
| POST | `/api/v1/bookings/{id}/cancel` | **D** |
| GET | `/api/v1/admin/refunds` | **D** |
| POST | `/api/v1/admin/refunds/{id}/approve` | **D** |
| POST | `/api/v1/admin/refunds/{id}/reject` | **D** |
| GET | `/api/v1/admin/customers` | **A** |
| PATCH | `/api/v1/admin/customers/{id}/status` | **A** |
| GET | `/api/v1/admin/admins` | **A** |
| POST | `/api/v1/admin/admins` | **A** |
| GET | `/api/v1/admin/admins/{id}` | **A** |
| PUT | `/api/v1/admin/admins/{id}` | **A** |
| PATCH | `/api/v1/admin/admins/{id}/status` | **A** |
| GET | `/api/v1/admin/roles` | **A** |
| GET | `/api/v1/admin/dashboard` | **A** (làm sau cùng) |

## Task A — Khách hàng, Tài khoản admin & Dashboard (Tịnh)

**Bảng**: `USERS` (đọc/khóa), `ADMINS`, `ROLES`, `PERMISSIONS`, `ADMIN_ROLES`, `ROLE_PERMISSIONS`

### Backend — checklist endpoint (trong `admin.py`)

- [ ] `GET /api/v1/admin/customers` (A9) — list `USERS`, lọc `status`, tìm kiếm `q` (email/tên/sđt), phân trang
- [ ] `PATCH /api/v1/admin/customers/{id}/status` (A9) — khóa/mở tài khoản khách (`ACTIVE`↔`LOCKED`)
- [ ] `GET /api/v1/admin/admins` (A10) — list `ADMINS` kèm role hiện tại (qua `ADMIN_ROLES`→`ROLES`)
- [ ] `POST /api/v1/admin/admins` (A10) — tạo admin, hash password, gán 1 role qua `ADMIN_ROLES`, check email trùng → 409
- [ ] `GET /api/v1/admin/admins/{id}` (A10) — chi tiết 1 admin (form sửa)
- [ ] `PUT /api/v1/admin/admins/{id}` (A10) — sửa admin; `password` optional (chỉ hash lại nếu có gửi)
- [ ] `PATCH /api/v1/admin/admins/{id}/status` (A10) — khóa/mở tài khoản admin
- [ ] `GET /api/v1/admin/roles` (A10) — list `ROLES` kèm `PERMISSIONS` (qua `ROLE_PERMISSIONS`), **chỉ đọc**, không cần tạo mới role/permission
- [ ] `GET /api/v1/admin/dashboard` (A2) — đếm đơn theo `trang_thai`, doanh thu tháng (`PAYMENTS.status=PAID`), số phòng theo `trang_thai`, số refund `REQUESTED`, danh sách refund/booking mới nhất

### Frontend — checklist trang

- [ ] `app/(admin)/admin/customers/page.tsx`
- [ ] `app/(admin)/admin/staff/page.tsx`
- [ ] `app/(admin)/admin/staff/new/page.tsx`
- [ ] `app/(admin)/admin/staff/[id]/edit/page.tsx`
- [ ] `app/(admin)/admin/page.tsx` (dashboard)

### KHÔNG thuộc Task A (dễ nhầm)

- Nút "Xem đơn của khách" trên A9 chỉ là **link** sang `/admin/bookings?user_id=...` — endpoint
  `GET /api/v1/admin/bookings` (kèm filter `user_id`) đã là việc của **Task C**, Task A không cần
  implement lại, chỉ cần link đúng query param.
- Trang login (`/login`, `/admin/login`) và toàn bộ cơ chế session/logout: **đã xong ở Task 0**,
  không đụng vào.

### Lưu ý nghiệp vụ

- A10 nên giới hạn quyền truy cập cho `SUPER_ADMIN` (theo mục 5.2 `screens.md`) — có thể tạm thời
  bỏ qua nếu chưa kịp, ghi rõ TODO.
- A9 khóa tài khoản (`status=LOCKED`) không được xóa dữ liệu `DATPHONG`/`PAYMENTS` liên quan.
- A2 (Dashboard) đọc dữ liệu từ **tất cả** domain khác (`DATPHONG`, `PAYMENTS`, `PHONG`, `REFUNDS`)
  — làm **sau cùng**, sau khi Task B/C/D đã có dữ liệu thật, nếu không sẽ luôn trả số 0.

### Definition of Done

- [ ] Tất cả 9 endpoint ở checklist trên trả dữ liệu thật từ Postgres (không còn stub)
- [ ] Test qua Swagger UI: tạo/sửa/khóa 1 admin, khóa/mở 1 khách hàng thành công
- [ ] Cả 5 trang frontend hiển thị dữ liệu thật, không còn import `mock-data` cho phần liên quan
- [ ] Dashboard hiển thị số liệu đúng sau khi Task B/C/D đã có dữ liệu (test lại lần 2 sau khi các
      task khác merge)

## Task B — Loại phòng & Phòng (Hoàng)

**Bảng**: `LOAIPHONG`, `PHONG`

### Backend — checklist endpoint

- [ ] `GET /api/v1/room-types` (P1) — list `LOAIPHONG` kèm `room_count`
- [ ] `GET /api/v1/room-types/{id}` (P3) — chi tiết loại phòng + `available_rooms` (join `PHONG`,
      loại trừ phòng đang bị giữ bởi `CT_DATPHONG`→`DATPHONG` giao khoảng `check_in`/`check_out`
      nếu query truyền vào, và `PHONG.trang_thai ≠ MAINTENANCE`)
- [ ] `GET /api/v1/rooms/availability` (P2, P4) — tìm phòng trống theo ngày + loại phòng + số
      lượng + khoảng giá (logic lọc mô tả chi tiết ở mục P2 `screens.md`)
- [ ] `GET /api/v1/admin/room-types` (A3) — list + tìm kiếm `q` + phân trang
- [ ] `POST /api/v1/admin/room-types` (A3) — tạo mới
- [ ] `GET /api/v1/admin/room-types/{id}` (A3) — chi tiết (form sửa)
- [ ] `PUT /api/v1/admin/room-types/{id}` (A3) — cập nhật
- [ ] `DELETE /api/v1/admin/room-types/{id}` (A3) — xóa, chặn 409 nếu còn `PHONG` tham chiếu
- [ ] `GET /api/v1/admin/rooms` (A4) — list + lọc `loai_phong_id`/`trang_thai` + tìm kiếm + phân trang
- [ ] `POST /api/v1/admin/rooms` (A4) — tạo mới, chặn 409 nếu `so_phong` trùng
- [ ] `GET /api/v1/admin/rooms/{id}` (A4) — chi tiết (form sửa)
- [ ] `PUT /api/v1/admin/rooms/{id}` (A4) — cập nhật
- [ ] `DELETE /api/v1/admin/rooms/{id}` (A4) — xóa, chặn 409 nếu phòng đang có `CT_DATPHONG` của
      đơn chưa hoàn tất (`trang_thai` khác `CANCELLED`/`CHECKED_OUT`)
- [ ] `PATCH /api/v1/admin/rooms/{id}/status` (A4) — đổi `trang_thai` (nút "Bảo trì"), chặn nếu
      đang gắn đơn chưa hoàn tất tương tự như xóa

### Frontend — checklist trang

- [ ] `app/(public)/page.tsx` (P1)
- [ ] `app/(public)/rooms/page.tsx` (P2)
- [ ] `app/(public)/rooms/[id]/page.tsx` (P3)
- [ ] `app/(admin)/admin/room-types/page.tsx`
- [ ] `app/(admin)/admin/room-types/new/page.tsx`
- [ ] `app/(admin)/admin/room-types/[id]/edit/page.tsx`
- [ ] `app/(admin)/admin/rooms/page.tsx`
- [ ] `app/(admin)/admin/rooms/new/page.tsx`
- [ ] `app/(admin)/admin/rooms/[id]/edit/page.tsx`

### KHÔNG thuộc Task B (dễ nhầm)

- Trang `/cart` (P4) là của **Task C** — Task B chỉ cung cấp API `GET /rooms/availability` mà nút
  "Áp dụng ngày" trên `/cart` sẽ gọi lại, không cần tự làm UI giỏ hàng.
- Việc phòng "đang bị giữ" (để tính `available_rooms`/`availability`) chỉ cần **đọc**
  `DATPHONG`/`CT_DATPHONG` (bảng của Task C) — không tạo, không sửa 2 bảng này.

### Lưu ý phối hợp

Logic kiểm tra "phòng trống trong khoảng ngày" gần như giống hệt giữa `GET /room-types/{id}` và
`GET /rooms/availability` — nên viết thành 1 hàm dùng chung trong `catalog.py` thay vì lặp code
2 lần. Đồng thời **thống nhất sớm với Vũ** (Task C) về câu query này, vì Task C cũng cần kiểm tra
lại "phòng còn trống" ngay trong transaction `checkout` để tránh race condition — nếu 2 người viết
2 hàm khác nhau có thể cho kết quả không nhất quán.

### Definition of Done

- [ ] 14 endpoint ở checklist trả dữ liệu thật
- [ ] Test qua Swagger UI: CRUD loại phòng, CRUD phòng, tìm phòng trống theo ngày cho kết quả đúng
- [ ] Test case xóa loại phòng đang có phòng → nhận 409 (không phải 500)
- [ ] 9 trang frontend hiển thị dữ liệu thật

## Task C — Đặt phòng & Thanh toán (Vũ)

**Bảng**: `DATPHONG`, `CT_DATPHONG`, `PAYMENTS` (đọc thêm `PHONG`)

### Backend — checklist endpoint (trong `bookings.py`, **trừ** `cancel_my_booking` — xem ghi chú)

- [ ] `GET /api/v1/bookings` (P8) — đơn của tôi, lọc `status`, phân trang
- [ ] `POST /api/v1/bookings` (P6) — **quan trọng nhất**: 1 transaction tạo `DATPHONG` + nhiều
      `CT_DATPHONG` + `PAYMENTS(status=PAID)`, set `trang_thai=CONFIRMED`; kiểm tra lại phòng còn
      trống *trong* transaction, trả 409 nếu bị đặt mất (race condition)
- [ ] `GET /api/v1/bookings/{id}` (P7, P9) — chi tiết đơn của tôi (kèm `rooms`, `payment`, `refund`
      nếu có — `refund` là dữ liệu do Task D tạo, Task C chỉ cần đọc và trả về đúng field)
- [ ] `GET /api/v1/admin/bookings` (A5) — list + lọc `status`/`from`/`to`/`user_id`/`q` + phân
      trang (param `user_id` này chính là cái Task A dùng để link từ A9 sang)
- [ ] `GET /api/v1/admin/bookings/{id}` (A6) — chi tiết đơn (admin)
- [ ] `PATCH /api/v1/admin/bookings/{id}/status` (A6) — chuyển
      `PENDING→CONFIRMED→CHECKED_IN→CHECKED_OUT`, chặn 400 nếu nhảy ngược/nhảy cách
- [ ] `GET /api/v1/admin/payments` (A7) — list + lọc `status`/`method` + phân trang (gộp vào task
      này vì `PAYMENTS` chỉ được tạo ra từ `checkout`, cùng một mạch dữ liệu với booking)

### Frontend — checklist trang

- [ ] `app/(public)/cart/page.tsx` (P4)
- [ ] `app/(public)/checkout/page.tsx` (P6)
- [ ] `app/(public)/checkout/success/page.tsx` (P7)
- [ ] `app/(public)/account/bookings/page.tsx` (P8)
- [ ] `app/(public)/account/bookings/[id]/page.tsx` (P9) — **chỉ phần hiển thị thông tin đơn**;
      nút "Hủy đặt phòng" trên cùng trang này thuộc Task D, xem ghi chú bên dưới
- [ ] `app/(admin)/admin/bookings/page.tsx` (A5)
- [ ] `app/(admin)/admin/bookings/[id]/page.tsx` (A6)
- [ ] `app/(admin)/admin/payments/page.tsx` (A7)

### KHÔNG thuộc Task C (dễ nhầm)

- `POST /api/v1/bookings/{id}/cancel` — tuy nằm cùng file `bookings.py` nhưng thuộc **Task D**,
  không tự viết hàm này.
- `GET /api/v1/admin/refunds` và duyệt/từ chối refund — thuộc Task D, kể cả khi thấy field
  `refund` xuất hiện trong response `Booking`/`Payment`.

### Lưu ý phối hợp

- Cùng sửa `bookings.py` với Hiệp (Task D) — thống nhất thứ tự merge trước, hoặc tách hàm
  `cancel_my_booking` ra router/file riêng ngay từ đầu (vd. `refunds.py`, include vào
  `bookings_router` hoặc router riêng) để tránh conflict khi cả 2 cùng sửa 1 file.
- Thống nhất với Hoàng (Task B) hàm kiểm tra "phòng còn trống" dùng chung, vì `checkout` cần gọi
  lại đúng logic đó trong transaction để tránh 2 khách đặt trùng phòng.

### Definition of Done

- [ ] 7 endpoint ở checklist trả dữ liệu thật
- [ ] Test 2 request `checkout` cùng lúc cho cùng 1 phòng → 1 thành công, 1 nhận 409 (test thủ
      công hoặc viết test tự động, không chỉ tin vào code review)
- [ ] Test chuyển trạng thái đơn admin theo đúng thứ tự, thử nhảy ngược → nhận 400
- [ ] 8 trang frontend hiển thị dữ liệu thật

## Task D — Hủy đặt phòng & Hoàn tiền (Hiệp)

**Bảng**: `REFUNDS` (đọc thêm `DATPHONG`, `PAYMENTS`)

### Backend — checklist endpoint

- [ ] `POST /api/v1/bookings/{id}/cancel` (P9, trong `bookings.py`) — tạo `REFUNDS(status=REQUESTED)`;
      chỉ hợp lệ khi `DATPHONG.trang_thai` đang `PENDING`/`CONFIRMED` **và** chưa có `REFUNDS` nào
      của đơn này đang ở `REQUESTED`/`APPROVED` → 400 nếu không hợp lệ
- [ ] `GET /api/v1/admin/refunds` (A8, trong `admin.py`) — list, mặc định ưu tiên hiển thị
      `status=REQUESTED`, lọc theo `status` + tìm kiếm + phân trang
- [ ] `POST /api/v1/admin/refunds/{id}/approve` (A8) — set `REFUNDS.status=APPROVED` +
      `approved_by=<admin hiện tại>` **và** `DATPHONG.trang_thai=CANCELLED` (2 việc, cùng 1
      transaction); 400 nếu refund không ở trạng thái `REQUESTED`
- [ ] `POST /api/v1/admin/refunds/{id}/reject` (A8) — set `REFUNDS.status=REJECTED`, **không**
      đụng vào `DATPHONG.trang_thai` (đơn giữ nguyên); 400 nếu refund không ở trạng thái `REQUESTED`

### Frontend — checklist trang

- [ ] Nút "Hủy đặt phòng" + dialog xác nhận (nhập `reason`) trên
      `app/(public)/account/bookings/[id]/page.tsx` — **chỉ thêm phần này**, không sửa phần hiển
      thị thông tin đơn (của Task C)
- [ ] `app/(admin)/admin/refunds/page.tsx` (A8) — nút Duyệt/Từ chối

### KHÔNG thuộc Task D (dễ nhầm)

- Không đụng vào `GET /api/v1/bookings/{id}` hay các endpoint booking khác trong `bookings.py` —
  chỉ thêm đúng 1 hàm `cancel_my_booking`.
- Không tự thêm cột/bảng audit log hay thông báo — ngoài phạm vi ERD hiện tại (xem mục 7
  `screens.md`).

### Lưu ý phối hợp

Cùng sửa `bookings.py` với Vũ (Task C) — xem "Lưu ý phối hợp" ở Task C. Khi `approve`, nhớ đây là
**2 câu UPDATE trên 2 bảng khác nhau trong cùng 1 transaction** (`REFUNDS` + `DATPHONG`) — nếu chỉ
update `REFUNDS` mà quên `DATPHONG.trang_thai` thì đơn đã hủy vẫn hiện `CONFIRMED`, gây sai lệch
dữ liệu cho cả Task A (Dashboard) và Task C (danh sách booking).

### Definition of Done

- [ ] 4 endpoint ở checklist trả dữ liệu thật
- [ ] Test: hủy 1 đơn `CONFIRMED` → tạo refund `REQUESTED` thành công; thử hủy lại lần 2 cùng đơn
      → nhận 400
- [ ] Test: `approve` 1 refund → kiểm tra cả `REFUNDS.status` lẫn `DATPHONG.trang_thai` đều đổi
      đúng; `reject` 1 refund → `DATPHONG.trang_thai` giữ nguyên
- [ ] 2 phần frontend (nút hủy + trang admin refunds) hoạt động đúng

## Quy trình làm việc đề xuất

1. Task 0 (đã xong) — không cần làm lại.
2. Task A/B/C/D chạy song song, mỗi người tạo branch riêng (`feat/api-accounts`, `feat/api-rooms`,
   `feat/api-bookings`, `feat/api-refunds`), PR riêng để Long review.
3. Mỗi PR nên tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI
   thật (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà
   chưa thử trên giao diện. Dùng checklist "Definition of Done" ở mỗi task làm tiêu chí tự kiểm
   tra trước khi mở PR.
4. Domain nào đụng bảng của domain khác (vd. Task A đọc `DATPHONG`/`PAYMENTS`/`REFUNDS` của B/C/D
   cho Dashboard, Task D ghi `DATPHONG.trang_thai` khi duyệt refund) chỉ cần *đọc* hoặc ghi đúng
   phần đã thống nhất ở mục "Lưu ý phối hợp"/"KHÔNG thuộc phạm vi" của từng task, không tự đổi
   model của domain khác — nếu cần đổi, báo trong nhóm trước.
5. Task C và Task D cùng sửa `bookings.py` — thống nhất thứ tự merge hoặc tách hàm
   `cancel_my_booking` ra file riêng ngay từ đầu để giảm rủi ro conflict.
6. Khi cả 4 task merge xong, Long tổng hợp để soạn báo cáo.
