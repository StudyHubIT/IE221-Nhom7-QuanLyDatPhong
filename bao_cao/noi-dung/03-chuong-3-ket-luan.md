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
