"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  DoorOpen,
  FileText,
  Home,
  MapPin,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wifi,
} from "lucide-react";

import { BookingStepper } from "@/components/booking/booking-stepper";
import { useUserSession } from "@/components/auth/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, apiFetch } from "@/lib/api";
import { formatVnd, nightCount } from "@/lib/format";
import type { Booking } from "@/lib/room-api-types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { session } = useUserSession();
  const id = searchParams.get("id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || !session?.token) {
      setIsLoading(false);
      return;
    }

    apiFetch<Booking>(`/api/v1/bookings/${id}`, { token: session.token })
      .then((data) => setBooking(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id, session?.token]);

  const bookingCode = booking
    ? booking.code
    : id
      ? `DP-${Number(id).toString().padStart(4, "0")}`
      : "DP-0001";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nights = booking ? nightCount(booking.check_in, booking.check_out) : 1;

  return (
    <div className="space-y-8">
      {/* Hero Header Xác Nhận Đặt Phòng Thành Công */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
          <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/20" />
          <span>ĐẶT PHÒNG THÀNH CÔNG · HOTELBOOK RESORT 5 SAO</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Xác Nhận Đơn Lưu Trú Của Bạn
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Cảm ơn bạn đã lựa chọn HotelBook. Chúng tôi đã ghi nhận đơn và sẵn sàng phục vụ kỳ nghỉ tuyệt vời của bạn.
        </p>
      </div>

      {/* Thẻ Vé Đặt Phòng Resort (Resort Booking Ticket Card) */}
      <Card className="max-w-3xl mx-auto border-border/80 shadow-2xl overflow-hidden rounded-[32px] bg-card/90 backdrop-blur-xl">
        {/* Banner Header Vé Kim Loại Metallic */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border-b p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" /> Mã Đặt Phòng (Booking Code)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-primary font-mono tracking-wider">
                {bookingCode}
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

          <div className="flex items-center gap-2">
            <Badge variant="success" className="rounded-full px-3.5 py-1 text-xs font-extrabold shadow-xs">
              ● ĐÃ XÁC NHẬN & GIỮ PHÒNG
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs font-semibold h-9"
            >
              <Printer className="mr-1.5 size-3.5" /> In cuống vé
            </Button>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse flex flex-col items-center gap-2">
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>Đang tải thông tin vé phòng thực tế...</span>
            </div>
          ) : booking ? (
            <div className="space-y-6 text-sm">
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

              {/* Thông tin Khách nhận phòng */}
              <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/15">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <UserCheck className="size-4" /> Thông tin khách hàng nhận phòng
                </span>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Họ và tên khách: </span>
                    <span className="font-bold text-foreground">{booking.user_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email liên hệ: </span>
                    <span className="font-bold text-foreground">{booking.user_email}</span>
                  </div>
                  {booking.user_phone && (
                    <div>
                      <span className="text-muted-foreground">Số điện thoại: </span>
                      <span className="font-bold text-foreground">{booking.user_phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Thời gian nghỉ: </span>
                    <span className="font-bold text-primary">{nights} đêm nghỉ dưỡng</span>
                  </div>
                </div>
              </div>

              {/* Danh sách các phòng trong đơn */}
              <div className="space-y-3">
                <span className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Danh sách phòng đã chọn ({booking.rooms.length} phòng)</span>
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
                    Vui lòng trình mã QR này hoặc cung cấp Mã Đặt Phòng <span className="font-bold text-foreground">{bookingCode}</span> tại quầy Lễ Tân khi đến khách sạn để nhận chìa khóa phòng tức thì.
                  </p>
                </div>
              </div>

              {/* Tổng tiền & Trạng thái */}
              <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-muted-foreground">Trạng thái xác thực</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ● ĐÃ ĐƯỢC XÁC NHẬN TRÊN HỆ THỐNG
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-muted-foreground">Tổng chi phí thanh toán</span>
                  <span className="text-2xl font-black text-primary">
                    {formatVnd(booking.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Đơn đặt phòng #{id} đã được lưu an toàn trên hệ thống.</p>
              <p className="text-xs">Bạn có thể kiểm tra danh sách và xem lại lịch sử đặt phòng bất kỳ lúc nào trong trang cá nhân.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground border-t pt-4">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Thông tin lưu trú được mã hóa bảo mật 256-bit SSL</span>
          </div>
        </CardContent>
      </Card>

      {/* Cụm Nút Điều Huống Hành Động */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button asChild variant="outline" className="rounded-2xl px-6 h-11 font-bold text-xs">
          <Link href="/">
            <Home className="mr-2 size-4" /> Trở về trang chủ
          </Link>
        </Button>
        <Button asChild className="rounded-2xl px-6 h-11 font-bold text-xs shadow-lg shadow-primary/25">
          <Link href="/account/bookings">
            <FileText className="mr-2 size-4" /> Quản lý đơn phòng của tôi
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <BookingStepper currentStep={3} />
      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Đang tải kết quả đặt phòng...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
