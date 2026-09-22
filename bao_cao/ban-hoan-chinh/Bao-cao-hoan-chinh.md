<!-- File này được sinh tự động bởi refer_scripts/merge_bao_cao.py vào ngày 2026-09-22. KHÔNG chỉnh sửa trực tiếp file này - hãy sửa nội dung trong noi-dung/ hoặc loi-cam-on.md rồi chạy lại script. -->
# DANH MỤC HÌNH ẢNH

[Hình 1.1: Sơ đồ kiến trúc triển khai](#fig-1-1)

[Hình 1.2: Sơ đồ ERD hệ thống](#fig-1-2)

[Hình 2.1: Trang chủ](#fig-2-1)

[Hình 2.2: Danh sách phòng trống](#fig-2-2)

[Hình 2.3: Chi tiết loại phòng](#fig-2-3)

[Hình 2.4: Giỏ phòng](#fig-2-4)

[Hình 2.5: Thanh toán](#fig-2-5)

[Hình 2.6: Lịch sử đặt phòng](#fig-2-6)

[Hình 2.7: Dashboard quản trị](#fig-2-7)

[Hình 2.8: Quản lý loại phòng](#fig-2-8)

[Hình 2.9: Quản lý đơn đặt phòng](#fig-2-9)

[Hình 2.10: Quản lý thanh toán](#fig-2-10)

[Hình 2.11: Duyệt hoàn tiền](#fig-2-11)

[Hình 2.12: Quản lý khách hàng](#fig-2-12)

---

# DANH MỤC BẢNG BIỂU

[Bảng 1.1: Thư viện backend chính sử dụng trong đồ án](#tbl-1-1)

---

# Tóm tắt

Đồ án xây dựng hệ thống Quản lý Đặt phòng khách sạn gồm hai phía: trang web cho khách hàng tìm
và đặt phòng, và trang quản trị (CMS) cho nhân viên/quản lý vận hành khách sạn. Hệ thống dùng
Next.js cho giao diện, FastAPI (Python) cho tầng API, và PostgreSQL cho lưu trữ dữ liệu, toàn
bộ được đóng gói và chạy bằng Docker Compose.

Nhóm đã hiện thực đầy đủ luồng nghiệp vụ chính ở cả hai phía: phía khách hàng gồm đăng ký/đăng
nhập, tìm phòng trống theo ngày, đặt phòng kèm thanh toán giả lập, xem lịch sử đơn và tự hủy
đặt phòng. Phía quản trị gồm dashboard thống kê, quản lý loại phòng/phòng, quản lý đơn và thanh
toán, duyệt/từ chối yêu cầu hoàn tiền, cùng quản lý tài khoản khách hàng và nhân viên. Công việc
được phân chia cho 5 thành viên, mỗi người phụ trách trọn một cụm nghiệp vụ (cả API lẫn giao
diện liên quan) để đảm bảo hiểu rõ toàn bộ luồng thay vì chỉ một phần.

Báo cáo này trình bày thiết kế và cách triển khai hệ thống (Chương 1), phạm vi thực tế đã hoàn
thành (Chương 2), và kết luận cùng hướng phát triển tiếp theo (Chương 3).

---

# Chương 1: Thiết kế & triển khai

## 1.1. Kiến trúc tổng thể

Hệ thống được tổ chức thành ba service độc lập, chạy cùng lúc qua Docker Compose: `web`
(Next.js) phục vụ cả trang khách hàng lẫn trang quản trị, `api` (FastAPI) xử lý toàn bộ nghiệp
vụ và truy vấn dữ liệu, và `db` (PostgreSQL 16) lưu trữ dữ liệu. Tách riêng frontend và backend
cho phép hai tầng phát triển độc lập, đồng thời cho phép thử trực tiếp API qua Swagger UI trong
lúc phát triển mà không cần qua giao diện.

![Hình 1.1: Sơ đồ kiến trúc triển khai](../../slides/images/docker.jpg){#fig-1-1}

## 1.2. Công nghệ sử dụng

Phía backend dùng Python với các thư viện chính sau:

| Thư viện | Mục đích trong đồ án |
|---|---|
| FastAPI | Framework HTTP: định tuyến, dependency injection (`Depends`), CORS, tự sinh đặc tả OpenAPI |
| Swagger UI | Giao diện web để thử trực tiếp từng endpoint ngay trên trình duyệt, đăng nhập (Authorize) bằng token vừa lấy được |
| Uvicorn | ASGI server chạy ứng dụng, tự reload khi code thay đổi trong Docker |
| Poetry | Quản lý dependency và virtualenv qua `pyproject.toml` |
| Pydantic v2 | Validate dữ liệu vào/ra, serialize JSON, khớp đúng hợp đồng OpenAPI |
| pydantic-settings | Đọc cấu hình từ `.env` (CORS, chuỗi kết nối database) |
| SQLAlchemy 2 | ORM ánh xạ model Python sang bảng PostgreSQL, quản lý session theo từng request |
| Alembic | Sinh và áp dụng migration thay đổi schema database |
| psycopg | Driver kết nối PostgreSQL |

[]{#tbl-1-1}

: Bảng 1.1: Thư viện backend chính sử dụng trong đồ án

Phía frontend dùng Next.js (App Router) kết hợp Tailwind CSS, dựng chung trong một ứng dụng cho
cả hai vai trò khách hàng và quản trị, tách thành hai khu vực riêng biệt trong ứng dụng - khu
vực dành cho khách và khu vực quản trị - có cơ chế kiểm tra đăng nhập chặn truy cập khi chưa
đăng nhập đúng vai trò.

Về xác thực, hệ thống dùng cơ chế đơn giản phù hợp phạm vi đồ án: mật khẩu được băm trước khi
lưu, và token đăng nhập là chuỗi base64 mã hoá dạng `user:{id}` hoặc `admin:{id}` - không phải
JWT ký số như hệ thống production thực tế. Token không thể thu hồi phía server khi đăng xuất,
client tự xoá token là đủ để coi như đã đăng xuất.

## 1.3. Mô hình dữ liệu (ERD)

Cơ sở dữ liệu PostgreSQL được thiết kế thành ba nhóm bảng chính:

- **Người dùng & phân quyền**: `USERS` (khách hàng) và `ADMINS` (nhân viên/quản trị) là hai
  bảng độc lập, không kế thừa nhau, quyền của admin suy ra qua `ADMIN_ROLES` → `ROLES`, chi
  tiết quyền hạn nằm ở `ROLE_PERMISSIONS` → `PERMISSIONS`.
- **Phòng & đặt phòng**: `LOAIPHONG` (loại phòng) có nhiều `PHONG` (phòng cụ thể), một lượt đặt
  `DATPHONG` gồm nhiều dòng chi tiết `CT_DATPHONG`, mỗi dòng gắn với một `PHONG`.
- **Thanh toán**: mỗi `DATPHONG` có thể có `PAYMENTS` tương ứng, yêu cầu hoàn tiền được lưu ở
  `REFUNDS`, tham chiếu ngược lại `PAYMENTS`.

Luồng dữ liệu chính khi khách đặt phòng: `USERS → DATPHONG → CT_DATPHONG → PHONG`, sau đó
`PAYMENTS → REFUNDS` khi có yêu cầu hủy/hoàn tiền.

![Hình 1.2: Sơ đồ ERD hệ thống](../../slides/images/erd.png){#fig-1-2}

## 1.4. Thiết kế API

Quy trình xây dựng API đi theo hướng spec-first: đặc tả OpenAPI (`documents/openapi.yaml`)
được thống nhất trước, sau đó scaffold toàn bộ endpoint trả dữ liệu giả (`stubs.py`) để frontend
có thể phát triển song song, rồi thay dần dữ liệu giả bằng truy vấn PostgreSQL thật.

Toàn bộ endpoint được nhóm theo cụm tính năng - mỗi cụm gồm trọn vẹn cả API phía khách hàng lẫn
API phía quản trị liên quan tới cùng một nghiệp vụ:

- **Xác thực & tài khoản**: đăng ký và đăng nhập khách hàng, đăng nhập quản trị viên, lấy
  thông tin phiên đăng nhập hiện tại. Đây là nền tảng mà các cụm còn lại phụ thuộc vào - mọi
  chức năng khác đều yêu cầu đăng nhập trước khi sử dụng.
- **Loại phòng & phòng**: tìm loại phòng và phòng còn trống theo ngày (phía khách), CRUD loại
  phòng và phòng (phía quản trị).
- **Đặt phòng & thanh toán**: tạo và xem đơn đặt phòng (phía khách), quản lý đơn đặt phòng và
  thanh toán (phía quản trị).
- **Hủy đặt phòng & hoàn tiền**: khách tự hủy đơn đã đặt, quản trị viên duyệt hoặc từ chối yêu
  cầu hoàn tiền.
- **Khách hàng, tài khoản quản trị & dashboard**: quản lý khách hàng (khoá/mở tài khoản), quản
  lý tài khoản và vai trò nhân viên, tổng hợp số liệu cho dashboard KPI.

Cách chia này giúp mỗi cụm tính năng độc lập tương đối với nhau, chỉ chia sẻ chung tầng xác
thực - thuận tiện cho việc phát triển song song và kiểm thử từng cụm riêng biệt qua Swagger UI
trước khi nối vào giao diện.

## 1.5. Công cụ hỗ trợ phát triển: 4 skill Claude Code

Để giữ đúng quy ước code khi nhiều người cùng sửa chung một repo, nhóm định nghĩa sẵn 4 skill
cho Claude Code (nằm ở `.claude/skills/`), giúp AI agent tự nhận diện đúng việc cần làm và làm
theo đúng convention đã có, thay vì phải nhắc lại quy tắc mỗi lần:

- `add-feature-endpoint` - hiện thực một endpoint FastAPI: model → schema → router, thay dữ
  liệu giả bằng truy vấn SQLAlchemy thật, không tự thêm trường ngoài đặc tả OpenAPI.
- `wire-frontend-page` - nối một trang trong `apps/web` từ dữ liệu giả (`mock-data`) sang gọi
  API thật, giữ nguyên giao diện đã có.
- `task-scope-check` - kiểm tra nhanh một task đã làm tới đâu, còn stub chỗ nào, có lỡ đụng
  phạm vi của task khác không, chỉ đọc, không tự sửa code.
- `seed-reset` - reset môi trường phát triển khi database bị lệch trạng thái, có hỏi xác nhận
  trước khi dừng container.

Các skill này là hướng dẫn quy ước cho công cụ hỗ trợ phát triển, không phải thư viện chạy
trong sản phẩm cuối cùng.

---

# Chương 2: Phạm vi đã làm

Toàn bộ ảnh minh hoạ trong chương này được chụp trực tiếp trên giao diện thật đang chạy (không
phải bản dựng/mockup), dùng dữ liệu mẫu (seed) của hệ thống.

## 2.1. Trải nghiệm phía khách hàng

### 2.1.1. Trang chủ & tìm phòng trống

Trang chủ giới thiệu tổng quan (banner, đánh giá, cam kết xác nhận đặt phòng) kèm khung tìm
phòng nhanh ngay trên banner, và danh sách rút gọn các hạng phòng nổi bật bên dưới để khách xem
lướt trước khi tìm chi tiết.

![Hình 2.1: Trang chủ](../images/01-trang-chu.png){#fig-2-1}

Trang "Danh sách phòng" cho kết quả tìm kiếm đầy đủ hơn: bộ lọc theo hạng phòng, khoảng giá và
tiện nghi ở cột trái, danh sách phòng còn trống ở giữa - mỗi phòng hiển thị số phòng cụ thể
(ví dụ: `Phòng 102`), hạng phòng, sức chứa, diện tích, tiện nghi nổi bật và trạng thái sẵn sàng đón
khách, kèm giá theo đêm và nút xem chi tiết / chọn phòng ngay. Kết quả có phân trang khi số
lượng phòng trống lớn.

![Hình 2.2: Danh sách phòng trống](../images/02-tim-phong.png){#fig-2-2}

### 2.1.2. Chi tiết loại phòng

Trang chi tiết một loại phòng gồm thư viện ảnh, mô tả, các thông số chính (sức chứa, diện tích,
wifi, bữa sáng) và danh sách tiện nghi phòng tiêu chuẩn. Cột bên phải cho biết số phòng còn
trống, đơn giá theo đêm, ô chọn số lượng phòng muốn đặt (giới hạn theo số phòng trống thật) và
tổng chi phí tính sẵn trước khi bấm đặt phòng.

![Hình 2.3: Chi tiết loại phòng](../images/03-chi-tiet-loai-phong.png){#fig-2-3}

### 2.1.3. Giỏ phòng & lịch lưu trú

Giỏ phòng gom các phòng khách đã chọn (có thể từ nhiều loại phòng khác nhau trong cùng một lượt
đặt), cho chỉnh lại ngày nhận/trả phòng chung cho cả giỏ, và tính lại tổng tiền phòng theo số
đêm thực tế. Cột bên phải tóm tắt đơn: tiền phòng, thuế VAT & phí dịch vụ, và tổng thanh toán
cuối cùng - khách xác nhận đúng số tiền trước khi sang bước thanh toán.

![Hình 2.4: Giỏ phòng](../images/04-gio-hang.png){#fig-2-4}

### 2.1.4. Thanh toán

Luồng đặt phòng chia rõ 3 bước (giỏ phòng → thanh toán & xác nhận → hoàn tất), thể hiện bằng
thanh tiến trình ở đầu trang để khách biết đang ở bước nào. Bước thanh toán yêu cầu thông tin
khách nhận phòng (họ tên, số điện thoại, yêu cầu đặc biệt không bắt buộc) và cho chọn một trong
ba phương thức thanh toán mô phỏng: chuyển khoản/QR ngân hàng, thẻ tín dụng quốc tế, hoặc tiền
mặt tại khách sạn. Toàn bộ ba phương thức đều xác nhận thành công ngay lập tức, đúng với phạm vi
đã nêu - hệ thống chưa nối cổng thanh toán thật.

![Hình 2.5: Thanh toán](../images/05-thanh-toan.png){#fig-2-5}

### 2.1.5. Lịch sử đặt phòng & tự hủy

Trang "Đặt phòng của tôi" tổng hợp toàn bộ đơn của khách theo trạng thái (tất cả / đã xác nhận /
đang lưu trú / đã hoàn tất / đã hủy), kèm 3 số liệu nhanh ở đầu trang (tổng đơn, đơn sắp lưu
trú, kỳ nghỉ đã hoàn tất). Mỗi đơn hiển thị mã đơn, trạng thái, ngày đặt, tổng chi phí, khoảng
ngày lưu trú và phòng đã đặt. Khách bấm vào chi tiết đơn để xem đầy đủ và thực hiện tự hủy khi
cần, thao tác hủy sẽ tạo một yêu cầu hoàn tiền chờ quản trị viên duyệt (xem mục 2.2.5), bản
thân đơn vẫn giữ nguyên trạng thái cho tới khi yêu cầu đó được xử lý xong.

![Hình 2.6: Lịch sử đặt phòng](../images/06-lich-su-dat-phong.png){#fig-2-6}

## 2.2. Trang quản trị (CMS)

### 2.2.1. Dashboard

Dashboard cho quản trị viên cái nhìn tổng quan vận hành ngay khi đăng nhập: số đơn chờ xác
nhận, số đơn đã xác nhận, doanh thu trong tháng, tỉ lệ phòng trống/đang sử dụng, và số yêu cầu
hoàn tiền đang chờ duyệt. Bên dưới là hai bảng rút gọn - yêu cầu hoàn tiền cần xử lý và các đơn
đặt phòng mới nhất - giúp quản trị viên vào thẳng việc cần làm mà không phải tìm qua từng trang
riêng.

![Hình 2.7: Dashboard quản trị](../images/07-dashboard-admin.png){#fig-2-7}

### 2.2.2. Quản lý loại phòng & phòng

Trang quản lý loại phòng cho phép tạo, sửa, xoá từng hạng phòng (tên loại, giá cơ bản) và hiển thị
số phòng cụ thể thuộc mỗi loại, có ô tìm kiếm và phân trang khi danh sách dài. Quản lý phòng cụ
thể (không chụp riêng, cùng nhóm chức năng) cho phép cập nhật trạng thái từng phòng (sẵn sàng,
đang sử dụng, bảo trì…), phục vụ đúng dữ liệu hiển thị "còn trống" ở phía khách.

![Hình 2.8: Quản lý loại phòng](../images/08-quan-ly-loai-phong.png){#fig-2-8}

### 2.2.3. Quản lý đơn đặt phòng

Trang quản lý đơn tổng hợp toàn bộ đơn đặt phòng của khách trên toàn hệ thống - khác với trang
"lịch sử đặt phòng" phía khách chỉ thấy đơn của chính mình. Quản trị viên xem được người đặt,
khoảng ngày lưu trú, phòng đã đặt và trạng thái đơn, phục vụ đối soát vận hành hằng ngày.

![Hình 2.9: Quản lý đơn đặt phòng](../images/09-quan-ly-don.png){#fig-2-9}

### 2.2.4. Quản lý thanh toán

Trang thanh toán liệt kê từng giao dịch gắn với một đơn đặt phòng cụ thể: số tiền, phương thức
(chuyển khoản, thẻ, tiền mặt), trạng thái thanh toán và ngày giao dịch, có bộ lọc theo trạng
thái và phương thức để tra soát nhanh khi cần đối chiếu doanh thu.

![Hình 2.10: Quản lý thanh toán](../images/10-quan-ly-thanh-toan.png){#fig-2-10}

### 2.2.5. Duyệt yêu cầu hoàn tiền

Khi khách tự hủy đơn (mục 2.1.5), một yêu cầu hoàn tiền ở trạng thái "chờ duyệt" xuất hiện tại
đây, kèm mã đơn liên quan, số tiền cần hoàn và lý do khách khai báo lúc hủy. Quản trị viên duyệt
hoặc từ chối ngay trên dòng yêu cầu. Duyệt sẽ chuyển đơn đặt phòng gốc sang trạng thái đã hủy và
đóng yêu cầu hoàn tiền, từ chối giữ nguyên đơn như trước khi khách yêu cầu hủy.

![Hình 2.11: Duyệt hoàn tiền](../images/11-duyet-hoan-tien.png){#fig-2-11}

### 2.2.6. Quản lý khách hàng & tài khoản nhân viên

Trang quản lý khách hàng liệt kê toàn bộ tài khoản khách (họ tên, email, số điện thoại, trạng
thái) và cho phép khoá/mở khoá từng tài khoản khi cần - tài khoản bị khoá sẽ không đăng nhập
được ở phía khách. Quản lý tài khoản nhân viên (cùng nhóm chức năng, không chụp riêng) cho phép
tạo tài khoản quản trị mới và gán vai trò Super Admin hoặc Staff.

![Hình 2.12: Quản lý khách hàng](../images/12-quan-ly-khach-hang.png){#fig-2-12}

## 2.3. Ngoài phạm vi

Những hạng mục sau được nhóm chủ động khoanh vùng là chưa hiện thực, để không hiểu nhầm là phần
còn thiếu ngoài kế hoạch:

- Cổng thanh toán thật (VNPay, Momo, …) - cả ba phương thức ở bước thanh toán (mục 2.1.4) đều
  chỉ mô phỏng, xác nhận thành công ngay khi khách bấm xác nhận.
- Cơ chế xác thực JWT ký số theo chuẩn production: hệ thống hiện dùng token demo đơn giản (xem
  mục 1.2).
- Tách giao diện theo từng quyền chi tiết (`ROLE_PERMISSIONS`) - hiện quyền chỉ phân biệt ở mức
  vai trò (Super Admin / Staff), chưa ẩn/hiện chức năng theo từng quyền cụ thể.

---

# Chương 3: Kết luận

Đối chiếu với mục tiêu đề ra ban đầu, nhóm đã xây dựng thành công hệ thống Quản lý Đặt phòng
khách sạn chạy được trọn vẹn: từ tìm phòng, đặt phòng, thanh toán, đến hủy đặt phòng và xử lý
hoàn tiền, ở cả hai phía khách hàng và quản trị, trên nền Next.js + FastAPI +
PostgreSQL, đóng gói và chạy bằng Docker Compose. Việc chia công việc theo cụm nghiệp vụ (mỗi
thành viên phụ trách trọn một luồng thay vì chia theo tầng kỹ thuật) giúp cả nhóm hiểu rõ toàn
bộ hệ thống thay vì chỉ nắm một phần.

Hệ thống vẫn còn một số giới hạn đã nêu ở Chương 2: thanh toán mới ở mức giả lập chứ chưa nối
cổng thanh toán thật, cơ chế xác thực dùng token demo thay vì JWT ký số, và giao diện chưa tuỳ
biến theo từng quyền hạn cụ thể dù dữ liệu quyền hạn đã có sẵn trong schema.

Hướng phát triển tiếp theo, nếu tiếp tục hoàn thiện sản phẩm, nhóm đề xuất: tích hợp cổng thanh
toán thật (VNPay/Momo), thay token demo bằng JWT có ký số kèm cơ chế refresh token, và khai
thác bảng `ROLE_PERMISSIONS` đã có để phân quyền giao diện chi tiết hơn theo từng chức năng.
