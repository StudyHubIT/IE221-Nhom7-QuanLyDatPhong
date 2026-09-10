"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  Clock,
  CreditCard,
  DoorOpen,
  Hotel,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import {
  formatDate,
  formatDateRange,
  formatVnd,
  paymentMethodLabel,
} from "@/lib/format";
import type { BookingStatus, PaymentMethod, PaymentStatus } from "@/lib/room-api-types";

type BookingDetail = {
  id: number;
  code: string;
  check_in: string;
  check_out: string;
  created_at: string;
  trang_thai: BookingStatus;
  rooms: { phong_id: number; so_phong: string; ten_loai: string; don_gia: number }[];
  total: number;
  payment?: {
    id: number;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
  };
};

export default function MyBookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { session } = useUserSession();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !session) {
      setIsLoading(false);
      return;
    }
    apiFetch<BookingDetail>(`/api/v1/bookings/${id}`, {
      token: session.token,
    })
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setIsLoading(false));
  }, [id, session]);

  // Nếu người dùng chưa đăng nhập -> Hiển thị Auth Guard Banner
  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6">
        <Card className="border-border/80 shadow-xl overflow-hidden text-center p-8 md:p-12">
          <CardContent className="space-y-6 p-0 max-w-lg mx-auto">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <Lock className="size-10 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="size-3.5" /> YÊU CẦU ĐĂNG NHẬP
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Vui lòng đăng nhập để xem chi tiết đơn phòng
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bạn cần đăng nhập tài khoản của mình để truy cập chi tiết đơn đặt phòng #{id}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-bold px-8 shadow-md shadow-primary/20">
                <Link href={`/login?redirect=/account/bookings/${id}`}>
                  <LogIn className="mr-2 size-4" /> Đăng nhập ngay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-medium px-6">
                <Link href={`/login?redirect=/account/bookings/${id}&tab=register`}>
                  <UserPlus className="mr-2 size-4" /> Tạo tài khoản mới
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16 text-center text-muted-foreground animate-pulse">
        Đang tải thông tin chi tiết đơn đặt phòng...
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-16 text-center">
        <Hotel className="mx-auto size-12 text-muted-foreground stroke-[1.5]" />
        <h1 className="text-xl font-semibold">Không tìm thấy đơn đặt phòng</h1>
        <p className="text-sm text-muted-foreground">
          Đơn đặt phòng này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/account/bookings">
            <ChevronLeft className="mr-1 size-4" /> Quay lại danh sách đơn
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6">
      {/* Nút quay lại */}
      <Link
        href="/account/bookings"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 size-4" /> Quay lại danh sách đơn của tôi
      </Link>

      {/* Header chi tiết đơn */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-mono">
              Đơn đặt phòng {booking.code}
            </h1>
            <BookingStatusBadge status={booking.trang_thai} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> Ngày đặt: {formatDate(booking.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-primary" /> Lưu trú:{" "}
              {formatDateRange(booking.check_in, booking.check_out)}
            </span>
          </div>
        </div>

        {/* Nút Hủy đơn (Nếu ở trạng thái CONFIRMED hoặc PENDING) */}
        {booking.trang_thai === "CONFIRMED" || booking.trang_thai === "PENDING" ? (
          <CancelBookingDialog bookingId={booking.id} />
        ) : null}
      </div>

      {/* Grid thông tin chi tiết */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Card danh sách phòng */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DoorOpen className="size-5 text-primary" />
              Danh sách phòng lưu trú ({booking.rooms.length} phòng)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {booking.rooms.map((room) => (
              <div
                key={room.so_phong}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                    Phòng {room.so_phong}
                  </span>
                  <p className="text-sm font-semibold text-foreground">{room.ten_loai}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-muted-foreground">Đơn giá</span>
                  <span className="font-bold text-primary">{formatVnd(room.don_gia)}/đêm</span>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 flex items-baseline justify-between">
              <span className="text-sm font-bold text-foreground">Tổng cộng chi phí phòng</span>
              <span className="text-xl font-extrabold text-primary">{formatVnd(booking.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card giao dịch thanh toán */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-muted-foreground">Phương thức thanh toán</span>
              <span className="font-semibold text-foreground">
                {booking.payment
                  ? paymentMethodLabel[booking.payment.method] ?? booking.payment.method
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-muted-foreground">Số tiền thanh toán</span>
              <span className="font-extrabold text-primary text-base">
                {formatVnd(booking.payment?.amount ?? booking.total)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái giao dịch</span>
              {booking.payment ? (
                <PaymentStatusBadge status={booking.payment.status} />
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>

            <div className="rounded-xl bg-muted/40 p-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Chính sách hủy phòng & hoàn tiền
              </div>
              <p>
                Quý khách có thể gửi yêu cầu hủy phòng trước ngày nhận phòng. Tiền thanh toán sẽ được hệ thống xem xét và hoàn trả theo quy định của khách sạn.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
