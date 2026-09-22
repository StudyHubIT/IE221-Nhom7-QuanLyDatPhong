# Dàn ý báo cáo (rút gọn) — Hệ thống Quản lý Đặt phòng (IE221 · Nhóm 7)

> File này chỉ mô tả **cấu trúc** báo cáo (dàn ý + nội dung dự kiến từng mục), chưa phải bản
> viết đầy đủ. Bản rút gọn: chỉ còn 5 mục theo yêu cầu, thay cho cấu trúc 6-chương kiểu luận
> văn trước đó. Sau khi nhóm chốt dàn ý, các mục dưới sẽ tách thành file markdown, đúng theo
> `FILES_IN_ORDER` đã cập nhật trong `refer_scripts/merge_bao_cao.py` (script ghép + đánh số
> hình/bảng + convert sang .docx theo style ở `refer_scripts/reference-bao-cao.docx` /
> `refer_scripts/TEMPLATE-FORMAT.md`).
>
> Nguồn nội dung đã có, dùng để viết từng mục bên dưới thay vì bịa mới:
> - [`slides/index.html`](../slides/index.html) — đề tài, phạm vi đã hiện thực, kiến trúc,
>   4 skill Claude Code, ERD (`slides/images/erd.png`), sơ đồ Docker (`slides/images/docker.jpg`)
> - [`README.md`](../README.md) — hướng dẫn chạy, tài khoản demo, skills
> - [`phan_cong_cong_viec.md`](../phan_cong_cong_viec.md) + `phan_cong_{long,tinh,hoang,vu,hiep}.md`
>   — phân công chi tiết, ma trận endpoint, Definition of Done từng task
> - [`documents/openapi.yaml`](../documents/openapi.yaml), [`documents/screens.md`](../documents/screens.md),
>   `documents/sql/` — đặc tả API, mô tả màn hình, schema DB
> - `backend/tests/` — phạm vi test đã viết (nếu nhắc tới ở Chương 2)

**Ước lượng dung lượng**: sau khi viết chi tiết Chương 2 kèm 12 ảnh chụp màn hình thật (mục
2.1–2.2), tổng dung lượng đã tăng lên khoảng **~13–16 trang nội dung chính** — gần hơn nhiều so
với mốc ~20 trang ban đầu. Nếu vẫn muốn đủ ~20 trang, có thể viết Chương 1 chi tiết hơn hoặc
thêm ảnh minh hoạ cho phần kiến trúc/ERD.

---

## Thứ tự file khi tách vào `noi-dung/` (khớp `merge_bao_cao.py` đã cập nhật)

| # | File | Nội dung | Ước lượng |
|---|---|---|---|
| 00 | `00-tom-tat.md` | Tóm tắt đề tài (không phải "chương" — không có heading `# Chương N`) | ~0.3–0.5 trang |
| 01 | `01-chuong-1-thiet-ke-trien-khai.md` | Chương 1: Thiết kế & triển khai | ~4–6 trang |
| 02 | `02-chuong-2-pham-vi-da-lam.md` | Chương 2: Phạm vi đã làm (có 12 ảnh chụp màn hình thật) | ~7–9 trang |
| 03 | `03-chuong-3-ket-luan.md` | Chương 3: Kết luận | ~1 trang |

`# DANH MỤC HÌNH ẢNH` và `# DANH MỤC BẢNG BIỂU` không cần file riêng — `merge_bao_cao.py` tự
sinh từ caption `Hình N.i.` / `Bảng N.i.` trong 3 chương có heading `# Chương N`. Ảnh/bảng
trong `00-tom-tat.md` (không có heading chương) sẽ **không** được đánh số tự động — nếu cần
chèn ảnh minh hoạ ở Tóm tắt, chỉ dùng ảnh không đánh số hoặc thêm caption tay.

---

> Báo cáo này **không có trang Lời cảm ơn** — `bao_cao/loi-cam-on.md` không tồn tại, và
> `merge_bao_cao.py` tự bỏ qua mục này khi file vắng mặt (đã verify: không lỗi, chỉ in 1 dòng
> cảnh báo rồi tiếp tục).

## Tóm tắt đề tài (00)

- 1 đoạn: bài toán (khách sạn cần hệ thống đặt phòng online + quản trị), giải pháp (web 2 phía —
  khách hàng & CMS admin — API Python kết nối PostgreSQL), công nghệ chính (Next.js, FastAPI,
  SQLAlchemy, PostgreSQL, Docker Compose), kết quả đạt được (tóm gọn 1 câu, chi tiết để ở
  Chương 2 "Phạm vi đã làm").

---

## Chương 1: Thiết kế & triển khai (~4–6 trang, chương trọng tâm)

**1.1. Kiến trúc tổng thể**
- Chèn `Hình 1.1.` = sơ đồ Docker Compose (`slides/images/docker.jpg`): 3 service `web`
  (Next.js) → `api` (FastAPI) → `db` (PostgreSQL 16).
- Diễn giải luồng request + vì sao tách 3 service. Không cần nêu số cổng cụ thể (:3001/:8001/
  :5432) — chỉ chi tiết triển khai cục bộ, không phải quyết định kiến trúc đáng nói.

**1.2. Công nghệ sử dụng**
- Bảng thư viện backend (lấy nguyên từ slide "Kiến trúc", diễn giải thêm 1 câu mỗi dòng):
  FastAPI, Swagger UI, Uvicorn, Poetry, Pydantic v2, pydantic-settings, SQLAlchemy 2, Alembic,
  psycopg.
- Frontend: Next.js App Router (dùng chung cho cả trang khách & CMS admin trong `apps/web`).
- Xác thực: nêu đúng thực tế — hash mật khẩu + token dạng base64 `user:{id}`/`admin:{id}`,
  **không phải JWT ký số thật** (xem `phan_cong_long.md` mục "Lưu ý nghiệp vụ") — đây là giải
  pháp demo, không dùng cho production.

**1.3. Mô hình dữ liệu (ERD)**
- Chèn `Hình 1.2.` = `slides/images/erd.png`.
- 3 nhóm bảng: User & Auth (`USERS`, `ADMINS`, `ROLES`, `PERMISSIONS`, `ADMIN_ROLES`,
  `ROLE_PERMISSIONS` — **không kế thừa nhau**), Phòng & đặt (`LOAIPHONG`, `PHONG`, `DATPHONG`,
  `CT_DATPHONG`), Thanh toán (`PAYMENTS`, `REFUNDS`).
- Luồng chính: `USERS → DATPHONG → CT_DATPHONG → PHONG`, rồi `PAYMENTS → REFUNDS`.

**1.4. Thiết kế API**
- Nguyên tắc: spec OpenAPI trước (`documents/openapi.yaml`), scaffold stub, rồi nối DB thật.
- Gom endpoint theo **cụm tính năng** (không theo người phụ trách) — mỗi cụm là 1 nhóm nghiệp
  vụ trọn vẹn, có cả API phía khách lẫn phía quản trị của cụm đó (rút gọn từ ma trận endpoint
  đầy đủ ở `phan_cong_cong_viec.md`):
  - Xác thực & tài khoản: đăng ký/đăng nhập khách, đăng nhập quản trị, lấy thông tin phiên
    đăng nhập hiện tại.
  - Loại phòng & phòng: tìm loại phòng/phòng trống phía khách, CRUD loại phòng & phòng phía
    quản trị.
  - Đặt phòng & thanh toán: tạo/xem đơn đặt phòng phía khách, quản lý đơn & thanh toán phía
    quản trị.
  - Hủy đặt phòng & hoàn tiền: khách tự hủy đơn, quản trị duyệt/từ chối hoàn tiền.
  - Khách hàng, tài khoản quản trị & dashboard: quản lý khách hàng, quản lý tài khoản/vai trò
    nhân viên, thống kê KPI tổng hợp.

**1.5. Công cụ hỗ trợ phát triển: 4 skill Claude Code**
- Ngắn gọn, 1 đoạn mỗi skill (đã có sẵn mô tả ở slide "Skills"): `add-feature-endpoint`,
  `wire-frontend-page`, `task-scope-check`, `seed-reset` — quy ước cho AI agent theo convention
  repo, không phải thư viện chạy trong production.

---

## Chương 2: Phạm vi đã làm (~7–9 trang, đã viết chi tiết + 12 ảnh chụp màn hình thật)

**2.1. Trải nghiệm phía khách hàng** — mỗi mục con 1 ảnh chụp màn hình thật (`bao_cao/images/`,
chụp bằng Chrome headless điều khiển qua CDP, đăng nhập bằng cách ghi session vào localStorage
đúng key `apps/web/lib/session.ts` dùng, không cần tự động hoá form đăng nhập):
- 2.1.1. Trang chủ & tìm phòng trống (`Hình 2.1`, `Hình 2.2`)
- 2.1.2. Chi tiết loại phòng (`Hình 2.3`)
- 2.1.3. Giỏ phòng & lịch lưu trú (`Hình 2.4`)
- 2.1.4. Thanh toán — 3 bước, 3 phương thức mô phỏng (`Hình 2.5`)
- 2.1.5. Lịch sử đặt phòng & tự hủy (`Hình 2.6`)

**2.2. Trang quản trị (CMS)** — mỗi mục con 1 ảnh, đăng nhập Super Admin:
- 2.2.1. Dashboard — 5 chỉ số KPI (`Hình 2.7`)
- 2.2.2. Quản lý loại phòng & phòng (`Hình 2.8`)
- 2.2.3. Quản lý đơn đặt phòng (`Hình 2.9`)
- 2.2.4. Quản lý thanh toán (`Hình 2.10`)
- 2.2.5. Duyệt yêu cầu hoàn tiền (`Hình 2.11`) — ảnh chụp khi đã có 1 yêu cầu thật ở trạng thái
  chờ duyệt (tạo bằng cách gọi API đặt + tự hủy 1 đơn qua tài khoản demo trước khi chụp, để
  không chụp màn hình trống)
- 2.2.6. Quản lý khách hàng & tài khoản nhân viên (`Hình 2.12`)

**2.3. Ngoài phạm vi** — nêu rõ để không bị hỏi thiếu: cổng thanh toán thật (VNPay/Momo), JWT
ký số production, tách UI theo từng quyền chi tiết.

---

## Chương 3: Kết luận (~1 trang)

- Tóm tắt kết quả đạt được so với mục tiêu (đối chiếu trực tiếp với Chương 2, không lặp lại
  chi tiết).
- Khẳng định sản phẩm chạy được end-to-end (đặt phòng → thanh toán → hủy/hoàn tiền) trên môi
  trường Docker.
- Hạn chế còn lại (gộp ngắn gọn, không cần chương riêng): token demo không phải JWT ký số,
  thanh toán giả lập, không tách quyền UI chi tiết.
- 1–2 câu hướng phát triển nếu làm tiếp: cổng thanh toán thật, JWT + refresh token, phân
  quyền UI theo `ROLE_PERMISSIONS` (đã có sẵn ở schema nhưng chưa khai thác hết).

---

## Việc cần làm tiếp

1. ~~Tạo 4 file trong `bao_cao/noi-dung/`~~ — xong.
2. ~~Viết nội dung từng mục~~ — xong, Chương 2 đã có 12 ảnh chụp thật.
3. Xác nhận lại mốc dung lượng ~13–16 trang đã ổn chưa, hay vẫn cần viết thêm cho đủ ~20 trang.
4. Chạy `python3 refer_scripts/merge_bao_cao.py` rồi `python3 refer_scripts/convert_to_docx.py`
   để ra bản `.docx` hoàn chỉnh (đã verify chạy sạch, không lỗi).
