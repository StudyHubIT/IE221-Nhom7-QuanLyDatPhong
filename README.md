# CMS Monorepo

Monorepo scaffold for a CMS with:

- `apps/web`: Next.js App Router + Tailwind + pnpm
- `backend`: FastAPI + SQLAlchemy + Alembic + Poetry
- root `docker-compose.yml` + `Makefile` for local orchestration

## Structure

```text
apps/
  web/
backend/
  app/
  alembic/
docker-compose.yml
Makefile
pnpm-workspace.yaml
```

## Hướng dẫn chạy dự án

### Yêu cầu môi trường

- Docker + Docker Compose
- Node.js 20+ và `pnpm`
- Python 3.11+ và `poetry` (cần cho `make migrate`/`make seed`/`make migration` — các lệnh
  này chạy trên máy host, không qua Docker)

### Các bước

1. Clone repo, vào thư mục gốc của project.
2. Tạo file môi trường từ mẫu:
   ```bash
   cp .env.example .env
   ```
   Giá trị mặc định đã dùng được ngay cho local, không cần chỉnh gì thêm.
3. Cài dependency cho cả web và backend:
   ```bash
   make install
   ```
   Lệnh này chạy `pnpm install` (cho `apps/web`) và `poetry install` (cho `backend`).
4. Khởi động toàn bộ stack (PostgreSQL, FastAPI, Next.js):
   ```bash
   make up
   ```
   - Lần chạy đầu tiên có thể mất vài phút để build image.
   - Kiểm tra các service đã chạy chưa: `docker compose ps`.
   - Nếu có lỗi, xem log: `make logs`.
   - Container `api` tự động chạy `alembic upgrade head` khi khởi động, nên schema database đã
     sẵn sàng ngay sau bước này — không cần tự chạy `make migrate` trừ khi bạn thêm migration
     mới trong lúc `api` container đang chạy.
5. Tạo dữ liệu mẫu (tài khoản đăng nhập, loại phòng, phòng):
   ```bash
   make seed
   ```
   An toàn khi chạy lại nhiều lần — bỏ qua nếu dữ liệu đã tồn tại.
6. Mở ứng dụng:
   - Web (trang khách hàng + CMS admin): http://localhost:3001
   - Swagger API docs: http://localhost:8001/docs
7. Đăng nhập thử bằng tài khoản demo — xem bảng ở mục [Tài khoản đăng nhập demo](#tài-khoản-đăng-nhập-demo)
   bên dưới.
8. Khi xong việc, dừng stack:
   ```bash
   make down
   ```

## Useful commands

- `make install` installs both workspace and backend dependencies
- `make up` starts PostgreSQL, FastAPI, and Next.js via Docker Compose
- `make down` stops the stack
- `make logs` tails all service logs
- `make migrate` runs `alembic upgrade head` locally in `backend`
- `make migration name=create_pages_table` creates a new Alembic revision
- `make seed` seeds demo accounts/rooms into PostgreSQL (see below)
- `make shell-api` opens a shell in the Poetry environment
- `make shell-web` opens a shell in `apps/web`

## Tài khoản đăng nhập demo

Chạy `make seed` (sau khi `make migrate`) để tạo dữ liệu mẫu. Mật khẩu giống nhau cho mọi tài
khoản: **`password123`**.

| Vai trò | Nơi đăng nhập | Email |
|---|---|---|
| Khách hàng | `http://localhost:3001/login` | `user1@gmail.com` |
| Khách hàng | `http://localhost:3001/login` | `user2@gmail.com` |
| Admin (Super Admin) | `http://localhost:3001/admin/login` | `admin@hotel.com` |
| Admin (Staff) | `http://localhost:3001/admin/login` | `staff@hotel.com` |

Trang `/login` chỉ có form đăng nhập (không có đăng ký — đây là bản demo, dùng thẳng các tài
khoản mẫu ở trên).

## Claude Code skills cho project này

Repo có sẵn 4 skill (scoped riêng cho project, nằm ở `.claude/skills/`) hỗ trợ đúng luồng làm
việc mô tả ở [`phan_cong_cong_viec.md`](phan_cong_cong_viec.md) — Claude Code tự nhận diện và gợi
ý dùng khi thấy phù hợp, không cần gõ lệnh đặc biệt, chỉ cần mô tả việc muốn làm bằng lời:

| Skill | Dùng khi |
|---|---|
| `wire-frontend-page` | Nối 1 trang trong `apps/web` từ `mock-data` sang gọi API thật — tự tra đúng endpoint theo task trong `phan_cong_cong_viec.md`, giữ nguyên UI/layout |
| `add-feature-endpoint` | Thêm/hiện thực 1 endpoint FastAPI mới — tự theo đúng convention model/schema/router/auth đã có, không tạo bảng mới ngoài ý muốn |
| `task-scope-check` | Kiểm tra nhanh 1 task (A/B/C/D) hoặc 1 thành viên đã làm xong phần nào, còn stub chỗ nào, có lỡ đụng phạm vi người khác không — chỉ đọc, không tự sửa code |
| `seed-reset` | Reset nhanh môi trường dev khi DB/container bị lệch state (hỏi xác nhận trước khi dừng container) |
| `add-unit-tests` | Viết pytest cho code backend vừa thêm/sửa — tự theo đúng fixture/convention có sẵn trong `backend/tests/`, dựa vào checklist Definition of Done của từng task để test đúng nghiệp vụ chứ không chỉ CRUD chung chung; frontend chưa có test runner nên sẽ hỏi trước khi cài |

## Current scaffold

- Public landing page at `/`
- Admin placeholder at `/admin`
- API health endpoint at `/health`
- Pages router at `/api/pages`
- Initial Alembic migration for the `pages` table

## Pencil.dev (thiết kế UI bằng AI)

[Pencil.dev](https://pencil.dev) là công cụ thiết kế dạng canvas chạy ngay trong editor, lưu thiết kế thành file `.pen` (có thể commit cùng repo) và tích hợp AI (qua MCP) để sinh/đồng bộ code React từ thiết kế. Phù hợp để dựng nhanh giao diện cho `apps/web`.

### Cài đặt

Chọn một trong hai cách:

- **Extension cho VS Code / Cursor**
  1. Mở editor, vào Extensions (`Cmd/Ctrl + Shift + X`)
  2. Tìm và cài extension **pen.dev**
  3. Tạo thử một file `test.pen` — nếu thấy icon pen.dev ở góc trên bên phải editor là cài thành công

- **Ứng dụng desktop**
  - macOS: tải file `.dmg`, kéo vào `Applications` rồi mở
  - Linux: cài qua gói `.deb` hoặc `.AppImage`
  - Windows: dùng app desktop hoặc cài qua extension VS Code/Cursor

Sau khi cài, hoàn tất kích hoạt bằng email và đăng nhập Claude Code CLI (`claude`) nếu muốn dùng tính năng AI.

### Kết nối AI (MCP) với Claude Code

Pencil.dev tự khởi động MCP server khi ứng dụng chạy, không cần tự cấu hình `MCP.json`.

1. Cài và đăng nhập Claude Code CLI: chạy `claude` trong terminal
2. Đảm bảo pen.dev đang chạy (extension hoặc app desktop)
3. Mở một file `.pen` trong editor
4. Với Cursor, kiểm tra kết nối tại Settings → Tools & MCP, thấy server `pencil` xuất hiện là đã hoạt động

Nếu MCP không kết nối được: kiểm tra lại `claude` đã đăng nhập, khởi động lại pen.dev và editor, và đảm bảo pen.dev đang chạy trước khi mở file `.pen`.

### Sử dụng

1. Tạo file thiết kế mới, ví dụ `apps/web/design/home.pen`
2. Mở prompt panel bằng `Cmd/Ctrl + K` và mô tả yêu cầu, ví dụ: "Tạo form đăng nhập với email và mật khẩu"
3. Theo dõi thay đổi hiển thị trực tiếp trên canvas, tinh chỉnh bằng cách yêu cầu thêm
4. Khi ưng ý bố cục, nhờ AI (Claude Code) sinh component React tương ứng để đưa vào `apps/web`

Mẹo: mô tả càng cụ thể (màu sắc, kích thước, tên component) và tham chiếu design system sẵn có sẽ cho kết quả nhất quán hơn.
