export type RoomType = {
  id: number;
  ten_loai: string;
  gia_co_ban: number;
  description: string | null;
  image: string | null;
  room_count: number;
};

export type Room = {
  id: number;
  so_phong: string;
  loai_phong_id: number;
  trang_thai: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  ten_loai?: string | null;
  gia_co_ban?: number | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type AvailabilityItem = Room & {
  ten_loai: string;
  gia_co_ban: number;
  available: boolean;
  image?: string | null;
};

export type RoomTypeDetail = RoomType & {
  available_rooms: Room[];
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

export type BookingRoomItem = {
  phong_id: number;
  so_phong: string;
  ten_loai: string;
  don_gia: number;
};

export type Booking = {
  id: number;
  code: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone?: string | null;
  check_in: string;
  check_out: string;
  created_at: string;
  trang_thai: BookingStatus;
  rooms: BookingRoomItem[];
  total: number;
  payment?: {
    id: number;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
  } | null;
};

export const defaultStay = {
  checkIn: "2026-08-14",
  checkOut: "2026-08-16",
  count: 1,
};
