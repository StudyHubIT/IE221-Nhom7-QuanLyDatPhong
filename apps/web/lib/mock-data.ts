export type RoomType = {
  id: number;
  ten_loai: string;
  gia_co_ban: number;
  description: string;
  image: string;
};

export type Room = {
  id: number;
  so_phong: string;
  loai_phong_id: number;
  trang_thai: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
};

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentMethod = "BANKING" | "CASH";
export type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export type BookingRoom = {
  so_phong: string;
  ten_loai: string;
  don_gia: number;
};

export type Payment = {
  amount: number;
  method: "BANKING" | "CASH";
  status: PaymentStatus;
};

export type Refund = {
  id: string;
  booking_id: string;
  refund_amount: number;
  status: RefundStatus;
  reason: string;
  customer_name: string;
};

export type Customer = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "LOCKED";
};

export type AdminAccount = {
  id: number;
  full_name: string;
  email: string;
  role: "SUPER_ADMIN" | "STAFF";
  status: "ACTIVE" | "LOCKED";
};

export type PaymentRecord = {
  booking_id: string;
  customer_name: string;
  amount: number;
  method: "BANKING" | "CASH";
  status: PaymentStatus;
  created_at: string;
};

export type Booking = {
  id: string;
  numericId: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  check_in: string;
  check_out: string;
  created_at: string;
  trang_thai: BookingStatus;
  rooms: BookingRoom[];
  payment?: Payment;
  refund?: Refund;
};

export const roomTypes: RoomType[] = [
  {
    id: 1,
    ten_loai: "Phòng Đơn",
    gia_co_ban: 500_000,
    description:
      "Phòng gọn gàng cho 1 khách, giường đơn, bàn làm việc và ánh sáng tự nhiên.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    ten_loai: "Phòng Đôi",
    gia_co_ban: 800_000,
    description:
      "Rộng rãi, lý tưởng cho cặp đôi hay gia đình nhỏ. Giường đôi, bàn làm việc và cửa sổ nhìn ra thành phố.",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    ten_loai: "Phòng VIP",
    gia_co_ban: 1_500_000,
    description:
      "Suite cao cấp với không gian rộng, khu tiếp khách riêng và tầm nhìn thoáng.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  },
];

export const rooms: Room[] = [
  { id: 1, so_phong: "101", loai_phong_id: 1, trang_thai: "AVAILABLE" },
  { id: 2, so_phong: "102", loai_phong_id: 1, trang_thai: "AVAILABLE" },
  { id: 3, so_phong: "201", loai_phong_id: 2, trang_thai: "AVAILABLE" },
  { id: 4, so_phong: "202", loai_phong_id: 2, trang_thai: "AVAILABLE" },
  { id: 5, so_phong: "VIP01", loai_phong_id: 3, trang_thai: "AVAILABLE" },
];

export const defaultStay = {
  checkIn: "2026-08-14",
  checkOut: "2026-08-16",
  count: 1,
};

export const bookings: Booking[] = [
  {
    id: "DP-0002",
    numericId: 2,
    user_id: 1,
    user_name: "Nguyễn Văn A",
    user_email: "user1@gmail.com",
    user_phone: "0900000001",
    check_in: "2026-08-14",
    check_out: "2026-08-16",
    created_at: "2026-08-10",
    trang_thai: "CONFIRMED",
    rooms: [
      { so_phong: "101", ten_loai: "Phòng Đơn", don_gia: 500_000 },
      { so_phong: "201", ten_loai: "Phòng Đôi", don_gia: 800_000 },
    ],
    payment: { amount: 2_600_000, method: "BANKING", status: "PAID" },
  },
  {
    id: "DP-0001",
    numericId: 1,
    user_id: 1,
    user_name: "Nguyễn Văn A",
    user_email: "user1@gmail.com",
    user_phone: "0900000001",
    check_in: "2025-04-01",
    check_out: "2025-04-03",
    created_at: "2025-03-20",
    trang_thai: "CHECKED_OUT",
    rooms: [{ so_phong: "201", ten_loai: "Phòng Đôi", don_gia: 800_000 }],
    payment: { amount: 1_600_000, method: "BANKING", status: "PAID" },
    refund: {
      id: "RF-00",
      booking_id: "DP-0001",
      refund_amount: 1_600_000,
      status: "APPROVED",
      reason: "Hủy trước 24h",
      customer_name: "Nguyễn Văn A",
    },
  },
  {
    id: "DP-0003",
    numericId: 3,
    user_id: 2,
    user_name: "Trần Thị B",
    user_email: "user2@gmail.com",
    user_phone: "0900000002",
    check_in: "2026-07-10",
    check_out: "2026-07-12",
    created_at: "2026-07-01",
    trang_thai: "PENDING",
    rooms: [
      { so_phong: "201", ten_loai: "Phòng Đôi", don_gia: 800_000 },
      { so_phong: "202", ten_loai: "Phòng Đôi", don_gia: 800_000 },
    ],
    payment: { amount: 1_600_000, method: "BANKING", status: "PENDING" },
  },
  {
    id: "DP-0004",
    numericId: 4,
    user_id: 2,
    user_name: "Trần Thị B",
    user_email: "user2@gmail.com",
    user_phone: "0900000002",
    check_in: "2026-02-20",
    check_out: "2026-02-22",
    created_at: "2026-02-10",
    trang_thai: "CANCELLED",
    rooms: [{ so_phong: "101", ten_loai: "Phòng Đơn", don_gia: 500_000 }],
    payment: { amount: 500_000, method: "CASH", status: "PAID" },
  },
];

export const refunds: Refund[] = [
  {
    id: "RF-01",
    booking_id: "DP-0002",
    refund_amount: 1_600_000,
    status: "REQUESTED",
    reason: "Đổi lịch trình",
    customer_name: "Nguyễn Văn A",
  },
  {
    id: "RF-00",
    booking_id: "DP-0001",
    refund_amount: 1_600_000,
    status: "APPROVED",
    reason: "Hủy trước 24h",
    customer_name: "Nguyễn Văn A",
  },
];

export const pendingRefunds = refunds.filter(
  (refund) => refund.status === "REQUESTED",
);

export const payments: PaymentRecord[] = [
  {
    booking_id: "DP-0002",
    customer_name: "Nguyễn Văn A",
    amount: 2_600_000,
    method: "BANKING",
    status: "PAID",
    created_at: "2026-08-10",
  },
  {
    booking_id: "DP-0003",
    customer_name: "Trần Thị B",
    amount: 1_600_000,
    method: "BANKING",
    status: "PENDING",
    created_at: "2026-07-01",
  },
  {
    booking_id: "DP-0001",
    customer_name: "Nguyễn Văn A",
    amount: 1_600_000,
    method: "BANKING",
    status: "PAID",
    created_at: "2025-03-20",
  },
  {
    booking_id: "DP-0004",
    customer_name: "Trần Thị B",
    amount: 500_000,
    method: "CASH",
    status: "PAID",
    created_at: "2026-02-10",
  },
];

export const customers: Customer[] = [
  {
    id: 1,
    full_name: "Nguyễn Văn A",
    email: "user1@gmail.com",
    phone: "0900000001",
    status: "ACTIVE",
  },
  {
    id: 2,
    full_name: "Trần Thị B",
    email: "user2@gmail.com",
    phone: "0900000002",
    status: "ACTIVE",
  },
];

export const adminAccounts: AdminAccount[] = [
  {
    id: 1,
    full_name: "Super Admin",
    email: "admin@hotel.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  },
  {
    id: 2,
    full_name: "Nhân viên",
    email: "staff@hotel.com",
    role: "STAFF",
    status: "ACTIVE",
  },
];

export const rolePermissions = [
  {
    code: "SUPER_ADMIN",
    permissions: "MANAGE_ROOM, MANAGE_BOOKING, MANAGE_PAYMENT, APPROVE_REFUND",
  },
  {
    code: "STAFF",
    permissions: "MANAGE_ROOM, MANAGE_BOOKING",
  },
];

export const kpis = [
  { label: "Chờ xác nhận", value: "3" },
  { label: "Đã xác nhận", value: "12" },
  { label: "Doanh thu tháng này", value: "24,5tr" },
  { label: "Phòng trống / sử dụng", value: "3 / 2" },
  { label: "Hoàn tiền chờ duyệt", value: "1" },
];

export const cartItems: BookingRoom[] = [
  { so_phong: "101", ten_loai: "Phòng Đơn", don_gia: 500_000 },
  { so_phong: "201", ten_loai: "Phòng Đôi", don_gia: 800_000 },
];

export function getRoomType(id: number | string) {
  const numericId = Number(id);
  return roomTypes.find((type) => type.id === numericId);
}

export function getRoom(id: number | string) {
  const numericId = Number(id);
  return rooms.find((room) => room.id === numericId);
}

export function getAdminAccount(id: number | string) {
  const numericId = Number(id);
  return adminAccounts.find((admin) => admin.id === numericId);
}

export function roomCountByType(typeId: number) {
  return rooms.filter((room) => room.loai_phong_id === typeId).length;
}

const activeBookingStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
];

export function isRoomInActiveBooking(soPhong: string) {
  return bookings.some(
    (booking) =>
      activeBookingStatuses.includes(booking.trang_thai) &&
      booking.rooms.some((room) => room.so_phong === soPhong),
  );
}

export function getRoomsByType(typeId: number) {
  return rooms.filter((room) => room.loai_phong_id === typeId);
}

export function getBooking(id: string) {
  return bookings.find((booking) => booking.id === id);
}

export function bookingTotal(booking: Booking) {
  const nights = Math.max(
    1,
    Math.round(
      (new Date(booking.check_out).getTime() -
        new Date(booking.check_in).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  return booking.rooms.reduce((sum, room) => sum + room.don_gia, 0) * nights;
}

export function cartSubtotal(nights = 2) {
  return cartItems.reduce((sum, item) => sum + item.don_gia, 0) * nights;
}
