"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DoorOpen,
  FileText,
  Home,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BookingStepper } from "@/components/booking/booking-stepper";
import { useUserSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError, apiFetch } from "@/lib/api";
import { formatVnd } from "@/lib/format";
import type { Booking } from "@/lib/room-api-types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { session } = useUserSession();
  const id = searchParams.get("id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const bookingCode = booking ? booking.code : id ? `DP-${Number(id).toString().padStart(4, "0")}` : "DP-XXXX";

  return (
    <div className="space-y-8">
      {/* Hero Badge Thành công */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-10 stroke-[2]" />
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-3.5" /> ĐẶT PHÒNG THÀNH CÔNG
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Cảm ơn bạn đã đặt phòng!
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hệ thống đã ghi nhận đơn lưu trú của bạn. Nhân viên lễ tân đã chuẩn bị sẵn sàng chào đón bạn.
          </p>
        </div>
      </div>

      {/* Card Thông tin vé phòng */}
      <Card className="max-w-2xl mx-auto border-border/80 shadow-lg overflow-hidden">
        <div className="bg-primary/5 border-b p-4 md:p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Mã đặt phòng (Booking Code)
            </span>
            <span className="text-xl font-extrabold text-primary font-mono tracking-wide">
              {bookingCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs"
            >
              <Printer className="mr-1.5 size-3.5" /> In cuống vé
            </Button>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
              Đang tải thông tin xác nhận...
            </div>
          ) : booking ? (
            <div className="space-y-6 text-sm">
              <div className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-4 rounded-xl">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Calendar className="size-3.5 text-primary" /> Ngày nhận phòng
                  </span>
                  <span className="font-semibold text-foreground block text-base">
                    {booking.check_in}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="size-3.5 text-primary" /> Ngày trả phòng
                  </span>
                  <span className="font-semibold text-foreground block text-base">
                    {booking.check_out}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                  Chi tiết phòng lưu trú ({booking.rooms.length} phòng):
                </span>
                <div className="space-y-2">
                  {booking.rooms.map((r) => (
                    <div
                      key={r.phong_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          <DoorOpen className="size-3" /> Phòng {r.so_phong}
                        </span>
                        <span className="font-medium text-foreground">{r.ten_loai}</span>
                      </div>
                      <span className="font-semibold text-primary">{formatVnd(r.don_gia)}/đêm</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-muted-foreground">Trạng thái đơn</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ● ĐÃ XÁC NHẬN
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-muted-foreground">Tổng số tiền</span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatVnd(booking.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Đơn đặt phòng #{id} đã được khởi tạo thành công trên hệ thống.
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mã xác nhận bảo mật đã được gửi tới email của bạn</span>
          </div>
        </CardContent>
      </Card>

      {/* Điều hướng hành động */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button asChild variant="outline" className="rounded-xl px-6">
          <Link href="/">
            <Home className="mr-2 size-4" /> Trở về trang chủ
          </Link>
        </Button>
        <Button asChild className="rounded-xl px-6 shadow-md shadow-primary/20">
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
      <Suspense fallback={<div className="py-12 text-center">Đang tải kết quả...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
