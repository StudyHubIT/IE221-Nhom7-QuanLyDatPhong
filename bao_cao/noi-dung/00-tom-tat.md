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
