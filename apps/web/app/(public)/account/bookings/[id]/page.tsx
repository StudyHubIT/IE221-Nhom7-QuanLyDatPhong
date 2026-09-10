"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  CreditCard,
  DoorOpen,
  Hotel,
  Lock,
  LogIn,
  MapPin,
  Printer,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Wifi,
} from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import {
  formatDate,
  formatDateRange,
  formatVnd,
  nightCount,
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
  user_name?: string;
  user_email?: string;
  user_phone?: string;
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
  const [copied, setCopied] = useState(false);

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

  const handleCopyCode = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nights = booking ? nightCount(booking.check_in, booking.check_out) : 1;

  // Nếu người dùng chưa đăng nhập -> Hiển thị Auth Guard Banner
  if (!session) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6">
        <Card className="border-border/80 shadow-2xl overflow-hidden rounded-[32px] bg-card/90 backdrop-blur-xl text-center p-8 md:p-12">
          <CardContent className="space-y-6 p-0 max-w-lg mx-auto">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner border border-primary/20">
              <Lock className="size-10 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldAlert className="size-3.5" /> YÊU CẦU ĐĂNG NHẬP
              </span>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Vui lòng đăng nhập để xem chi tiết đơn phòng
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bạn cần đăng nhập tài khoản của mình để truy cập chi tiết đơn đặt phòng #{id}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-extrabold px-8 shadow-lg shadow-primary/25">
                <Link href={`/login?redirect=/account/bookings/${id}`}>
                  <LogIn className="mr-2 size-4" /> Đăng nhập ngay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl font-bold px-6 border-border/80">
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
      <main className="mx-auto w-full max-w-6xl px-6 py-16 text-center text-muted-foreground animate-pulse flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-semibold">Đang tải thông tin chi tiết vé lưu trú...</span>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-16 text-center">
        <Hotel className="mx-auto size-12 text-muted-foreground stroke-[1.5]" />
        <h1 className="text-xl font-bold">Không tìm thấy đơn đặt phòng</h1>
        <p className="text-sm text-muted-foreground">
          Đơn đặt phòng này không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button asChild variant="outline" className="rounded-2xl border-border/80">
          <Link href="/account/bookings">
            <ChevronLeft className="mr-1 size-4" /> Quay lại danh sách đơn của tôi
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-6">
      {/* Nút quay lại */}
      <Link
        href="/account/bookings"
        className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="mr-1 size-4" /> Quay lại danh sách đơn lưu trú của tôi
      </Link>

      {/* Thẻ Vé Đặt Phòng Resort (Resort Ticket Voucher Card) */}
      <Card className="border-border/80 shadow-2xl overflow-hidden rounded-[32px] bg-card/90 backdrop-blur-xl">
        {/* Banner Header Vé Kim Loại Metallic */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border-b p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" /> Mã Vé Đặt Phòng (Booking Pass Code)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-primary font-mono tracking-wider">
                {booking.code}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={handleCopyCode}
                className="h-8 rounded-xl px-2.5 text-xs font-semibold gap-1.5 border-border/80"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Sao chép
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.trang_thai} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs font-semibold h-9"
            >
              <Printer className="mr-1.5 size-3.5" /> In cuống vé
            </Button>
            {booking.trang_thai === "CONFIRMED" || booking.trang_thai === "PENDING" ? (
              <CancelBookingDialog bookingId={booking.id} />
            ) : null}
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Lịch Lưu Trú 2 Cột Check-in / Check-out */}
          <div className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-5 rounded-2xl border border-border/50">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                <Calendar className="size-3.5 text-primary" /> Ngày nhận phòng (Check-in)
              </span>
              <span className="font-extrabold text-foreground block text-base sm:text-lg">
                {booking.check_in} (Từ 14:00)
              </span>
            </div>
            <div className="space-y-1 sm:border-l sm:pl-4 border-border/60">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                <Clock className="size-3.5 text-primary" /> Ngày trả phòng (Check-out)
              </span>
              <span className="font-extrabold text-foreground block text-base sm:text-lg">
                {booking.check_out} (Trước 12:00)
              </span>
            </div>
          </div>

          {/* Thông tin Khách hàng */}
          <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/15">
            <span className="font-bold text-foreground text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <UserCheck className="size-4" /> Thông tin chủ đơn đặt phòng
            </span>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-muted-foreground">Tài khoản đặt: </span>
                <span className="font-bold text-foreground">{session.user.full_name || booking.user_name || "Khách hàng"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email đăng ký: </span>
                <span className="font-bold text-foreground">{session.user.email || booking.user_email || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Thời gian nghỉ: </span>
                <span className="font-bold text-primary">{nights} đêm lưu trú</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày khởi tạo: </span>
                <span className="font-bold text-foreground">{formatDate(booking.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Grid 2 Cột: Danh sách phòng & Thanh toán */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Cột 1: Danh sách phòng */}
            <div className="space-y-3">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Danh sách phòng ({booking.rooms.length} phòng)</span>
                <span className="text-[11px] font-normal text-muted-foreground">Miễn phí hủy trước 24h</span>
              </span>
              <div className="space-y-2.5">
                {booking.rooms.map((r) => (
                  <div
                    key={r.phong_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/70 bg-card/80 hover:border-primary/40 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 shrink-0">
                        <DoorOpen className="size-3.5" /> Phòng {r.so_phong}
                      </span>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{r.ten_loai}</h4>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-2 pt-0.5">
                          <Wifi className="size-3 text-primary" /> Wifi 5G
                          <span>·</span>
                          <span>Bữa sáng Buffets</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs text-muted-foreground block">{nights} đêm × {formatVnd(r.don_gia)}</span>
                      <span className="font-extrabold text-primary text-base">{formatVnd(r.don_gia * nights)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột 2: Giao dịch thanh toán */}
            <div className="space-y-3">
              <span className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-4 text-primary" /> Thông tin giao dịch thanh toán
              </span>
              <div className="space-y-3 p-4 rounded-2xl border border-border/70 bg-card/80 text-xs">
                <div className="flex justify-between items-center border-b pb-2.5">
                  <span className="text-muted-foreground">Phương thức</span>
                  <span className="font-bold text-foreground">
                    {booking.payment
                      ? paymentMethodLabel[booking.payment.method] ?? booking.payment.method
                      : "Thanh toán tại Lễ tân"}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b pb-2.5">
                  <span className="text-muted-foreground">Trạng thái giao dịch</span>
                  {booking.payment ? (
                    <PaymentStatusBadge status={booking.payment.status} />
                  ) : (
                    <Badge variant="outline" className="rounded-full text-[10px]">Chưa thanh toán</Badge>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-foreground text-sm">Tổng tiền đơn</span>
                  <span className="text-xl font-black text-primary">
                    {formatVnd(booking.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mã QR Check-in Tự động & Hướng dẫn nhận phòng */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-muted/30 border border-border/60">
            <div className="relative size-28 shrink-0 rounded-2xl bg-white p-2 border shadow-md flex items-center justify-center">
              <QrCode className="size-24 text-slate-900" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="font-extrabold text-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="size-4 text-primary" /> Mã QR Thủ Tục Nhận Phòng Nhanh
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vui lòng trình mã QR này hoặc cung cấp Mã Đặt Phòng <span className="font-bold text-foreground">{booking.code}</span> tại quầy Lễ Tân khi đến khách sạn để nhận chìa khóa phòng tức thì.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground border-t pt-4">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Thông tin lưu trú được bảo mật an toàn 100% trên hệ thống HotelBook</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
