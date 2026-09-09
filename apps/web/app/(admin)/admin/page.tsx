"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KpiCard } from "@/components/admin/kpi-card";
import {
  BookingStatusBadge,
  RefundStatusBadge,
} from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateRange,
  formatVnd,
  bookingStatusLabel,
  refundStatusLabel,
  roomStatusLabel,
} from "@/lib/format";
import { useAdminSession } from "@/components/auth/session-provider";
import { apiFetch } from "@/lib/api";

type Refund = {
  id: number;
  customer_name: string;
  refund_amount: number;
  status: string;
};

type Booking = {
  id: number;
  user_name: string;
  check_in: string;
  check_out: string;
  trang_thai: string;
};

type DashboardData = {
  pending_count: number;
  confirmed_count: number;
  monthly_revenue: number;
  rooms_available: number;
  rooms_occupied: number;
  pending_refunds_count: number;
  pending_refunds: Refund[];
  latest_bookings: Booking[];
};

export default function AdminDashboardPage() {
  const { session } = useAdminSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!session?.token) return;
      try {
        const result = await apiFetch<DashboardData>("/api/v1/admin/dashboard", {
          token: session.token,
        });
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [session?.token]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  const kpis = data ? [
    { label: bookingStatusLabel.PENDING, value: data.pending_count.toString() },
    { label: bookingStatusLabel.CONFIRMED, value: data.confirmed_count.toString() },
    { 
      label: "Doanh thu tháng này", 
      value: data.monthly_revenue >= 1000000 
        ? `${(data.monthly_revenue / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr` 
        : formatVnd(data.monthly_revenue) 
    },
    { label: "Phòng trống / sử dụng", value: `${data.rooms_available} / ${data.rooms_occupied}` },
    { label: `Hoàn tiền ${refundStatusLabel.REQUESTED.toLowerCase()}`, value: data.pending_refunds_count.toString() },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tổng quan vận hành khách sạn
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Yêu cầu hoàn tiền cần xử lý</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/refunds">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Khách</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.pending_refunds.length ? (
                  data.pending_refunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>{refund.id}</TableCell>
                      <TableCell>{refund.customer_name}</TableCell>
                      <TableCell>{formatVnd(refund.refund_amount)}</TableCell>
                      <TableCell>
                        <RefundStatusBadge status={refund.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Đơn đặt phòng mới nhất</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/bookings">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Khách</TableHead>
                  <TableHead>Ngày ở</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.latest_bookings.length ? (
                  data.latest_bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="font-medium hover:underline"
                        >
                          {booking.id}
                        </Link>
                      </TableCell>
                      <TableCell>{booking.user_name}</TableCell>
                      <TableCell>
                        {formatDateRange(booking.check_in, booking.check_out)}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.trang_thai as any} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
