# Prompt dựng wireframe trong Pencil (pen.dev)

Pencil MCP hiện chưa xuất hiện trong danh sách MCP server của môi trường này (`GetMcpTools` không tìm thấy server `pencil`), nên không thể thao tác trực tiếp lên [`design.pen`](../design.pen). File này chứa 12 prompt đã soạn sẵn cho MVP luồng chính (9 màn hình Public P1–P9 + 3 màn hình Admin cốt lõi A2, A5, A6), nguồn nội dung từ [`documents/screens.md`](./screens.md).

**Cách dùng**: mở `design.pen` trong Cursor/VS Code (extension Pencil kích hoạt tự động), tạo một frame mới cho mỗi màn hình, dán nguyên văn prompt tương ứng vào ô yêu cầu AI của Pencil. Nên dựng theo đúng thứ tự bên dưới để Pencil tái dùng nhất quán component/navigation giữa các màn hình. Design system: **Shadcn/ui mặc định**.

Sau khi dựng xong mỗi màn hình, đối chiếu lại với mục 4.2/5.2 của `screens.md` để đảm bảo không thiếu dữ liệu/hành động chính đã liệt kê.

---

## 1. P1 — Trang chủ / Tìm phòng trống

```
Thiết kế trang chủ cho hệ thống đặt phòng khách sạn, dùng Shadcn/ui.
Bố cục: hero section giới thiệu hệ thống, bên dưới là form tìm phòng gồm: input chọn ngày check-in, input chọn ngày check-out, select loại phòng (tùy chọn, có option "Tất cả"), input số lượng phòng cần, nút "Tìm phòng" nổi bật.
Bên dưới form, hiển thị danh sách các loại phòng dạng card (3 card: Phòng Đơn, Phòng Đôi, Phòng VIP), mỗi card có tên loại phòng và giá cơ bản mỗi đêm.
Không yêu cầu đăng nhập để xem trang này. Có nút "Đăng nhập" ở góc trên bên phải header.
```

## 2. P2 — Danh sách kết quả phòng trống

```
Thiết kế trang danh sách kết quả tìm phòng, dùng Shadcn/ui, kế thừa header giống trang chủ.
Đầu trang hiển thị lại tiêu chí tìm kiếm đã chọn (ngày check-in, check-out, loại phòng) dạng thanh tóm tắt có thể bấm để sửa lại.
Bên dưới là danh sách card phòng, mỗi card gồm: số phòng, tên loại phòng, giá cơ bản, trạng thái còn trống, nút "Xem chi tiết" và nút "Thêm vào giỏ".
Có sidebar bộ lọc bên trái: lọc theo loại phòng, khoảng giá.
Thiết kế thêm một trạng thái rỗng (empty state) hiển thị khi không có phòng trống: icon, thông báo "Không tìm thấy phòng trống phù hợp", gợi ý đổi ngày hoặc loại phòng.
```

## 3. P3 — Chi tiết loại phòng

```
Thiết kế trang chi tiết một loại phòng, dùng Shadcn/ui.
Bố cục 2 cột: cột trái là placeholder ảnh phòng lớn, cột phải gồm tên loại phòng, giá cơ bản mỗi đêm, mô tả ngắn, và danh sách các phòng cụ thể còn trống thuộc loại này (số phòng, trạng thái) dạng danh sách hoặc badge.
Có nút "Thêm vào giỏ đặt phòng" nổi bật; nút này ở trạng thái disabled kèm chú thích "Hiện không còn phòng trống" khi không còn phòng nào thuộc loại này còn trống trong khoảng ngày đã chọn.
```

## 4. P4 — Giỏ đặt phòng / Checkout

```
Thiết kế trang giỏ đặt phòng / checkout, dùng Shadcn/ui.
Bố cục 2 cột: cột trái là bảng danh sách phòng đã chọn (số phòng, loại phòng, đơn giá, nút xóa từng dòng), có thể chỉnh lại ngày check-in/check-out ở đầu bảng.
Cột phải là khối tóm tắt đơn hàng (order summary) dạng card: số đêm, tổng số phòng, tổng tiền tạm tính, nút "Tiếp tục" nổi bật ở cuối.
Thiết kế thêm trạng thái giỏ hàng rỗng: thông báo "Giỏ đặt phòng đang trống" kèm nút quay lại trang tìm phòng.
```

## 5. P5 — Đăng ký / Đăng nhập

```
Thiết kế trang đăng ký / đăng nhập cho khách hàng, dùng Shadcn/ui, dạng card căn giữa màn hình với 2 tab "Đăng nhập" và "Đăng ký".
Tab Đăng nhập: input email, input mật khẩu, nút "Đăng nhập" nổi bật, link "Quên mật khẩu?".
Tab Đăng ký: input họ tên, input email, input số điện thoại, input mật khẩu, input xác nhận mật khẩu, nút "Đăng ký" nổi bật.
Phía trên form có dòng chú thích ngữ cảnh: "Đăng nhập để hoàn tất đặt phòng của bạn".
```

## 6. P6 — Thanh toán giả lập

```
Thiết kế trang thanh toán (giả lập, không tích hợp cổng thanh toán thật), dùng Shadcn/ui.
Bố cục 2 cột: cột trái là form chọn phương thức thanh toán dạng radio card (ví dụ: Chuyển khoản ngân hàng, Tiền mặt tại quầy), nút "Xác nhận thanh toán" nổi bật ở cuối.
Cột phải là tóm tắt đơn đặt phòng: danh sách phòng, ngày ở, tổng tiền cần thanh toán.
Thêm một trạng thái loading/xử lý khi bấm xác nhận thanh toán (spinner trên nút).
```

## 7. P7 — Xác nhận đặt phòng thành công

```
Thiết kế trang xác nhận đặt phòng thành công, dùng Shadcn/ui.
Bố cục căn giữa: icon check thành công lớn, tiêu đề "Đặt phòng thành công", mã đơn đặt phòng.
Bên dưới là card tóm tắt đơn: danh sách phòng đã đặt, ngày check-in/check-out, tổng tiền đã thanh toán, badge trạng thái "Đã xác nhận" (CONFIRMED).
Hai nút hành động: "Xem chi tiết đơn" và "Về trang chủ".
```

## 8. P8 — Danh sách đặt phòng của tôi

```
Thiết kế trang "Đặt phòng của tôi" cho khách hàng đã đăng nhập, dùng Shadcn/ui.
Đầu trang có thanh tab/bộ lọc theo trạng thái: Tất cả, Chờ xác nhận, Đã xác nhận, Đã nhận phòng, Đã trả phòng, Đã hủy.
Bên dưới là bảng hoặc danh sách card, mỗi dòng gồm: mã đơn, ngày đặt, ngày ở (check-in - check-out), badge trạng thái, tổng tiền, nút "Xem chi tiết".
Thiết kế trạng thái rỗng khi khách chưa có đơn nào: thông báo và nút "Tìm phòng ngay".
```

## 9. P9 — Chi tiết đặt phòng của tôi

```
Thiết kế trang chi tiết một đơn đặt phòng của khách hàng, dùng Shadcn/ui.
Đầu trang: mã đơn, badge trạng thái hiện tại, ngày đặt.
Phần giữa: bảng danh sách phòng trong đơn (số phòng, loại phòng, đơn giá), thông tin thanh toán (phương thức, số tiền, trạng thái thanh toán).
Nếu đơn có yêu cầu hoàn tiền, hiển thị thêm khối trạng thái yêu cầu hoàn tiền (lý do, trạng thái: Đang chờ duyệt / Đã duyệt / Bị từ chối).
Cuối trang: nút "Hủy đặt phòng" màu cảnh báo (destructive) — chỉ hiển thị khi đơn ở trạng thái Chờ xác nhận hoặc Đã xác nhận và chưa có yêu cầu hoàn tiền nào đang xử lý; khi bấm mở dialog xác nhận yêu cầu nhập lý do hủy.
```

## 10. A2 — Dashboard tổng quan (Admin)

```
Thiết kế trang dashboard tổng quan cho admin quản lý khách sạn, dùng Shadcn/ui, có sidebar điều hướng bên trái (Dashboard, Đặt phòng, Phòng, Loại phòng, Thanh toán, Hoàn tiền, Khách hàng, Tài khoản admin).
Nội dung chính: hàng thẻ số liệu (KPI cards) gồm: Tổng đơn đang chờ xác nhận, Tổng đơn đã xác nhận, Doanh thu tháng này (từ thanh toán đã PAID), Số phòng đang trống / đang sử dụng, Số yêu cầu hoàn tiền đang chờ duyệt.
Bên dưới các thẻ, thêm một bảng "Yêu cầu hoàn tiền cần xử lý" rút gọn và một bảng "Đơn đặt phòng mới nhất" rút gọn, mỗi bảng có link "Xem tất cả".
```

## 11. A5 — Quản lý đặt phòng (Admin)

```
Thiết kế trang quản lý đặt phòng cho admin, dùng Shadcn/ui, giữ nguyên sidebar điều hướng như dashboard.
Đầu trang: thanh bộ lọc gồm select trạng thái (Chờ xác nhận, Đã xác nhận, Đã nhận phòng, Đã trả phòng, Đã hủy), date range picker theo ngày ở, ô tìm kiếm theo tên khách/mã đơn.
Nội dung chính: bảng dữ liệu (data table) với các cột: Mã đơn, Tên khách hàng, Ngày check-in, Ngày check-out, Trạng thái (badge màu theo trạng thái), Tổng tiền, nút "Xem chi tiết" ở cuối mỗi dòng.
Có phân trang (pagination) ở cuối bảng.
```

## 12. A6 — Chi tiết đặt phòng (Admin)

```
Thiết kế trang chi tiết đơn đặt phòng dành cho admin, dùng Shadcn/ui, giữ nguyên sidebar điều hướng.
Đầu trang: mã đơn, tên khách hàng, badge trạng thái hiện tại, các nút hành động chuyển trạng thái theo vòng đời (ví dụ nếu đang "Chờ xác nhận" thì hiện nút "Xác nhận đơn"; nếu "Đã xác nhận" thì hiện nút "Nhận phòng"; nếu "Đã nhận phòng" thì hiện nút "Trả phòng") — chỉ hiện nút hợp lệ với trạng thái hiện tại, không cho nhảy lùi trạng thái.
Nội dung chính chia 2 khối: bảng danh sách phòng trong đơn (số phòng, loại phòng, đơn giá) và khối thông tin thanh toán (phương thức, số tiền, trạng thái thanh toán).
```
