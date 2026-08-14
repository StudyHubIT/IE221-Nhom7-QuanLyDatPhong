import type { BookingStatus, PaymentStatus, RefundStatus } from "@/lib/mock-data";

export function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateRange(checkIn: string, checkOut: string) {
  return `${formatDate(checkIn)} – ${formatDate(checkOut)}`;
}

export function nightCount(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export const bookingStatusLabel: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "PENDING",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
};

export const refundStatusLabel: Record<RefundStatus, string> = {
  REQUESTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export const paymentMethodLabel = {
  BANKING: "Chuyển khoản",
  CASH: "Tiền mặt",
} as const;

export const roomStatusLabel = {
  AVAILABLE: "Còn trống",
  OCCUPIED: "Đang sử dụng",
  MAINTENANCE: "Bảo trì",
} as const;
