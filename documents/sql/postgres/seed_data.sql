-- ========================================
-- SEED DATA FOR ROOM BOOKING SYSTEM (PostgreSQL)
-- Converted from documents/sql/seed_data.sql (MSSQL)
-- ========================================

-- ===== ADMINS =====
INSERT INTO admins (email, password_hash, full_name, status)
VALUES
('admin@hotel.com', 'hashed_pw_1', 'Super Admin', 'ACTIVE'),
('staff@hotel.com', 'hashed_pw_2', 'Nhân viên', 'ACTIVE');

-- ===== ROLES =====
INSERT INTO roles (code, name)
VALUES
('SUPER_ADMIN', 'Super Administrator'),
('STAFF', 'Staff');

-- ===== PERMISSIONS =====
INSERT INTO permissions (code, description)
VALUES
('MANAGE_ROOM', 'Quản lý phòng'),
('MANAGE_BOOKING', 'Quản lý đặt phòng'),
('MANAGE_PAYMENT', 'Quản lý thanh toán'),
('APPROVE_REFUND', 'Duyệt hoàn tiền');

-- ===== ADMIN_ROLES =====
INSERT INTO admin_roles (admin_id, role_id)
VALUES
(1, 1),  -- Super Admin
(2, 2);  -- Staff

-- ===== ROLE_PERMISSIONS =====
INSERT INTO role_permissions (role_id, permission_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 2);

-- ===== USERS =====
INSERT INTO users (email, phone, password_hash, full_name, status)
VALUES
('user1@gmail.com', '0900000001', 'user_pw_1', 'Nguyễn Văn A', 'ACTIVE'),
('user2@gmail.com', '0900000002', 'user_pw_2', 'Trần Thị B', 'ACTIVE');

-- ===== LOAIPHONG =====
INSERT INTO loaiphong (ten_loai, gia_co_ban)
VALUES
('Phòng Đơn', 500000),
('Phòng Đôi', 800000),
('Phòng VIP', 1500000);

-- ===== PHONG =====
INSERT INTO phong (so_phong, loai_phong_id, trang_thai)
VALUES
('101', 1, 'AVAILABLE'),
('102', 1, 'AVAILABLE'),
('201', 2, 'AVAILABLE'),
('202', 2, 'AVAILABLE'),
('VIP01', 3, 'AVAILABLE');

-- ===== DATPHONG =====
INSERT INTO datphong (user_id, check_in, check_out, trang_thai)
VALUES
(1, '2025-04-01 14:00:00', '2025-04-03 12:00:00', 'CONFIRMED');

-- ===== CT_DATPHONG =====
INSERT INTO ct_datphong (datphong_id, phong_id, don_gia)
VALUES
(1, 3, 800000);

-- ===== PAYMENTS =====
INSERT INTO payments (booking_id, user_id, amount, method, status)
VALUES
(1, 1, 1600000, 'BANKING', 'PAID');

-- ===== REFUNDS =====
INSERT INTO refunds (payment_id, refund_amount, status, reason, approved_by)
VALUES
(1, 1600000, 'APPROVED', 'Hủy trước 24h', 1);
