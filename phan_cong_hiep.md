# Task D — Hủy đặt phòng & Hoàn tiền (Hiệp)

> File phân công riêng cho **Hiệp**. Tổng quan cả nhóm + ma trận endpoint:
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
> **Login đã hoạt động thật ở cả 2 phía**. Task D **không cần đụng lại** `auth.py`, phần `AdminAuth`
> trong `admin.py`, hay 2 trang login/logout — chỉ tập trung vào hủy đặt phòng & hoàn tiền.

**Branch đề xuất**: `feat/api-refunds`

**Bảng**: `REFUNDS` (đọc thêm `DATPHONG`, `PAYMENTS`)

## Backend — checklist endpoint

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

## Frontend — checklist trang

- [ ] Nút "Hủy đặt phòng" + dialog xác nhận (nhập `reason`) trên
      `app/(public)/account/bookings/[id]/page.tsx` — **chỉ thêm phần này**, không sửa phần hiển
      thị thông tin đơn (của Task C)
- [ ] `app/(admin)/admin/refunds/page.tsx` (A8) — nút Duyệt/Từ chối

## KHÔNG thuộc Task D (dễ nhầm)

- Không đụng vào `GET /api/v1/bookings/{id}` hay các endpoint booking khác trong `bookings.py` —
  chỉ thêm đúng 1 hàm `cancel_my_booking`.
- Không tự thêm cột/bảng audit log hay thông báo — ngoài phạm vi ERD hiện tại (xem mục 7
  `screens.md`).

## Lưu ý phối hợp

Cùng sửa `bookings.py` với Vũ (Task C). Khi `approve`, nhớ đây là **2 câu UPDATE trên 2 bảng khác
nhau trong cùng 1 transaction** (`REFUNDS` + `DATPHONG`) — nếu chỉ update `REFUNDS` mà quên
`DATPHONG.trang_thai` thì đơn đã hủy vẫn hiện `CONFIRMED`, gây sai lệch dữ liệu cho cả Task A
(Dashboard) và Task C (danh sách booking).

Thống nhất thứ tự merge với Vũ, hoặc tách hàm `cancel_my_booking` ra router/file riêng ngay từ đầu
(vd. `refunds.py`) để tránh conflict khi cả 2 cùng sửa `bookings.py`.

Domain nào đụng bảng của domain khác (Task D ghi `DATPHONG.trang_thai` khi duyệt refund) chỉ ghi
đúng phần đã thống nhất — không tự đổi model của domain khác. Nếu cần đổi, báo trong nhóm trước.

## Definition of Done

- [ ] 4 endpoint ở checklist trả dữ liệu thật
- [ ] Test: hủy 1 đơn `CONFIRMED` → tạo refund `REQUESTED` thành công; thử hủy lại lần 2 cùng đơn
      → nhận 400
- [ ] Test: `approve` 1 refund → kiểm tra cả `REFUNDS.status` lẫn `DATPHONG.trang_thai` đều đổi
      đúng; `reject` 1 refund → `DATPHONG.trang_thai` giữ nguyên
- [ ] 2 phần frontend (nút hủy + trang admin refunds) hoạt động đúng

## Quy trình tự kiểm trước khi mở PR

1. Tạo branch `feat/api-refunds`, PR riêng để Long review.
2. Tự test qua Swagger UI (`http://localhost:8001/docs`) trước, rồi test lại trên UI thật
   (`http://localhost:3001`) sau khi nối frontend — không coi là xong nếu chỉ curl API mà chưa thử
   trên giao diện.
3. Dùng checklist "Definition of Done" ở trên làm tiêu chí tự kiểm tra trước khi mở PR.
4. Task C và Task D cùng sửa `bookings.py` — thống nhất thứ tự merge hoặc tách hàm
   `cancel_my_booking` ra file riêng ngay từ đầu để giảm rủi ro conflict.
