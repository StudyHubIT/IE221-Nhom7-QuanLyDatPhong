"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  DoorOpen,
  Hotel,
  Lock,
  LogIn,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { formatDate, formatDateRange, formatVnd, nightCount } from "@/lib/format";
import type { BookingStatus } from "@/lib/room-api-types";

type BookingItem = {
  id: number;
  code: string;
  check_in: string;
  check_out: string;
  created_at: string;
  trang_thai: BookingStatus;
  total: number;
  rooms?: { phong_id: number; so_phong: string; ten_loai: string; don_gia: number }[];
};

type PaginatedBookings = {
  items: BookingItem[];
  total: number;
  page: number;
  page_size: number;
};

const tabs: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "Tất cả đơn" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CHECKED_IN", label: "Đang lưu trú" },
  { value: "CHECKED_OUT", label: "Đã hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function MyBookingsPage() {
  const { session } = useUserSession();
  const [status, setStatus] = useState<(typeof tabs)[number]["value"]>("all");
  const [data, setData] = useState<PaginatedBookings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const params = new URLSearchParams({ page: "1", page_size: "50" });
    if (status !== "all") {
      params.set("status", status);
    }
    try {
      const res = await apiFetch<PaginatedBookings>(`/api/v1/bookings?${params}`, {
        token: session.token,
      });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  // Tính toán các chỉ số KPI nhanh
  const totalCount = data?.total || 0;
  const activeCount =
    data?.items.filter(
      (b) => b.trang_thai === "CONFIRMED" || b.trang_thai === "CHECKED_IN"
    ).length || 0;
  const completedCount =
    data?.items.filter((b) => b.trang_thai === "CHECKED_OUT").length || 0;

  // Nếu người dùng chưa đăng nhập -> Hiển thị Auth Guard Prompt sang trọng
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
                <ShieldAlert className="size-3.5" /> YÊU CẦU XÁC THỰC TÀI KHOẢN
              </span>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Vui lòng đăng nhập để xem đơn đặt phòng
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đăng nhập tài khoản của bạn để quản lý các mã vé phòng <code className="font-mono font-bold text-primary">DP-xxxx</code>, theo dõi thời gian lưu trú và xem thông tin thanh toán chi tiết.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-2xl font-extrabold px-8 shadow-lg shadow-primary/25">
                <Link href="/login?redirect=/account/bookings">
                  <LogIn className="mr-2 size-4" /> Đăng nhập ngay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-2xl font-bold px-6 border-border/80">
                <Link href="/login?redirect=/account/bookings&tab=register">
                  <UserPlus className="mr-2 size-4" /> Tạo tài khoản mới
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground border-t pt-4">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bảo mật thông tin đơn hàng 100% với mã hóa 256-bit SSL</span>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6">
      {/* Header Hồ Sơ & Quick KPI Stats */}
      <Card className="border-border/80 shadow-2xl overflow-hidden rounded-[32px] bg-gradient-to-r from-primary/10 via-card to-amber-500/5 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-lg shadow-primary/30 ring-4 ring-primary/10">
              {session.user.full_name ? session.user.full_name.charAt(0).toUpperCase() : <User className="size-8" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Crown className="size-3 text-amber-500" /> THÀNH VIÊN RESORT VIP
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {session.user.full_name || "Khách Hàng Quý Tộc"}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{session.user.email}</span>
                <span>·</span>
                <span className="text-primary font-bold">Hệ thống quản lý đơn đặt phòng 5 sao</span>
              </p>
            </div>
          </div>

          <Button asChild className="rounded-2xl px-6 h-11 font-extrabold shadow-lg shadow-primary/25 shrink-0">
            <Link href="/rooms">
              <Plus className="mr-1.5 size-4 stroke-[3]" /> Đặt thêm phòng mới
            </Link>
          </Button>
        </div>

        {/* 3 Thẻ Chỉ Số KPI Nhanh */}
        <div className="grid gap-3 sm:grid-cols-3 pt-6 mt-6 border-t border-border/60">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/60 border border-border/50">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hotel className="size-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">TỔNG ĐƠN ĐẶT</span>
              <span className="text-xl font-black text-foreground">{totalCount} đơn lưu trú</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/60 border border-border/50">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="size-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">ĐƠN SẮP LƯU TRÚ</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{activeCount} đơn giữ phòng</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-background/60 border border-border/50">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider block">ĐÃ HOÀN TẤT</span>
              <span className="text-xl font-black text-foreground">{completedCount} kỳ nghỉ</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Lọc Trạng Thái Đơn */}
      <div className="space-y-6">
        <Tabs
          value={status}
          onValueChange={(value) =>
            setStatus(value as (typeof tabs)[number]["value"])
          }
        >
          <TabsList className="bg-muted/70 p-1.5 rounded-2xl border border-border/60 flex flex-wrap gap-1 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Danh Sách Thẻ Vé Đặt Phòng (Resort Booking Ticket Cards) */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse border-border/50 p-6 rounded-3xl">
                  <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <Card className="border-dashed border-2 border-border/70 py-12 text-center rounded-3xl bg-card/40">
              <CardContent className="space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Hotel className="size-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-foreground">Chưa có đơn đặt phòng nào</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Bạn chưa có lịch sử đặt phòng nào ở mục lựa chọn này. Khám phá các hạng phòng Deluxe và Villa 5 sao ngay!
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-2xl font-bold border-border/80 px-6">
                  <Link href="/rooms">Khám phá danh sách phòng</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            data.items.map((booking) => {
              const nights = nightCount(booking.check_in, booking.check_out);

              return (
                <Card
                  key={booking.id}
                  className="overflow-hidden border-border/80 shadow-xs hover:shadow-lg transition-all duration-200 rounded-2xl bg-card/90 backdrop-blur-xl group hover:border-primary/40 p-4 sm:p-5 space-y-3"
                >
                  {/* Dòng 1: Mã đơn, Badge trạng thái, Ngày khởi tạo, Tổng tiền */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                        {booking.code}
                      </span>
                      <BookingStatusBadge status={booking.trang_thai} />
                      <span className="hidden sm:inline-flex text-[11px] text-muted-foreground font-medium items-center gap-1">
                        <Clock className="size-3 text-primary" />
                        <span>Ngày đặt: {formatDate(booking.created_at)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">
                        Tổng chi phí:
                      </span>
                      <span className="text-lg font-black text-primary">
                        {formatVnd(booking.total)}
                      </span>
                    </div>
                  </div>

                  {/* Dòng 2: Lịch lưu trú, Thông tin phòng & Nút Chi tiết */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground">
                      {/* Lịch lưu trú */}
                      <span className="flex items-center gap-1.5 font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
                        <Calendar className="size-3.5 text-primary" />
                        <span>{formatDateRange(booking.check_in, booking.check_out)}</span>
                        <span className="text-primary font-extrabold text-[11px]">({nights} đêm)</span>
                      </span>

                      {/* Danh sách phòng */}
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <DoorOpen className="size-3.5 text-primary shrink-0" />
                        {booking.rooms && booking.rooms.length > 0 ? (
                          <span>
                            {booking.rooms.map((r, idx) => (
                              <span key={r.phong_id}>
                                {idx > 0 && " · "}
                                Phòng {r.so_phong} ({r.ten_loai})
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Chi tiết trong đơn</span>
                        )}
                      </div>
                    </div>

                    {/* Nút Xem chi tiết đơn */}
                    <Button
                      asChild
                      variant="outline"
                      size="xs"
                      className="h-8 rounded-xl font-bold text-xs px-3 border-border/80 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all shrink-0 self-end sm:self-auto"
                    >
                      <Link href={`/account/bookings/${booking.id}`}>
                        Chi tiết đơn & Cuống vé <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
