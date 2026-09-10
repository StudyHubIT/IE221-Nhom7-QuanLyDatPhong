"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Hotel,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { formatDate, formatDateRange, formatVnd } from "@/lib/format";
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
  { value: "CHECKED_IN", label: "Đã nhận phòng" },
  { value: "CHECKED_OUT", label: "Đã trả phòng" },
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

  // Nếu người dùng chưa đăng nhập -> Hiển thị Auth Guard Prompt sang trọng
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
                Vui lòng đăng nhập để xem đơn đặt phòng
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đăng nhập tài khoản của bạn để quản lý các mã vé phòng <code className="font-mono font-bold text-primary">DP-xxxx</code>, theo dõi thời gian lưu trú và xem thông tin thanh toán chi tiết.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-bold px-8 shadow-md shadow-primary/20">
                <Link href="/login?redirect=/account/bookings">
                  <LogIn className="mr-2 size-4" /> Đăng nhập ngay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-medium px-6">
                <Link href="/login?redirect=/account/bookings&tab=register">
                  <UserPlus className="mr-2 size-4" /> Tạo tài khoản mới
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border-t pt-4">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Bảo mật thông tin đơn hàng 100%</span>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Lịch sử đặt phòng của tôi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các đơn đặt phòng, theo dõi trạng thái lưu trú và thông tin hóa đơn.
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-sm">
          <Link href="/rooms">+ Đặt phòng mới</Link>
        </Button>
      </div>

      {/* Tabs lọc trạng thái */}
      <Tabs
        value={status}
        onValueChange={(value) =>
          setStatus(value as (typeof tabs)[number]["value"])
        }
      >
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg text-xs md:text-sm font-medium"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Danh sách thẻ đặt phòng */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse border-border/50 p-6">
                <div className="h-6 w-1/3 bg-muted rounded mb-4" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </Card>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Hotel className="size-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Chưa có đơn đặt phòng nào</h3>
                <p className="text-sm text-muted-foreground">
                  Bạn chưa có lịch sử đặt phòng nào ở trạng thái này.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/rooms">Khám phá danh sách phòng</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          data.items.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden border-border/60 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                      {booking.code}
                    </span>
                    <BookingStatusBadge status={booking.trang_thai} />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span>Ngày đặt: {formatDate(booking.created_at)}</span>
                  </div>
                </div>

                <div className="grid gap-4 pt-4 sm:grid-cols-3 sm:items-center">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      Thời gian lưu trú
                    </span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="size-4 text-primary" />
                      {formatDateRange(booking.check_in, booking.check_out)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      Tổng tiền thanh toán
                    </span>
                    <span className="text-base font-bold text-primary">
                      {formatVnd(booking.total)}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <Button asChild variant="outline" className="rounded-xl w-full sm:w-auto">
                      <Link href={`/account/bookings/${booking.id}`}>
                        Chi tiết đơn <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
