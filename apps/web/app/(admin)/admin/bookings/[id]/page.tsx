"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/components/auth/session-provider";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
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
import { ApiError, apiFetch } from "@/lib/api";
import {
  formatDateRange,
  formatVnd,
  paymentMethodLabel,
} from "@/lib/format";
import type { BookingStatus, PaymentMethod, PaymentStatus } from "@/lib/room-api-types";

type AdminBookingDetail = {
  id: number;
  code: string;
  user_id: number;
  user_name: string;
  user_email: string;
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

export default function AdminBookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { session } = useAdminSession();

  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    if (!id || !session) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch<AdminBookingDetail>(
        `/api/v1/admin/bookings/${id}`,
        { token: session.token },
      );
      setBooking(res);
    } catch {
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, session]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const handleUpdateStatus = async (nextStatus: BookingStatus) => {
    if (!session || !booking) return;
    setIsUpdating(true);
    setError(null);
    try {
      const updated = await apiFetch<AdminBookingDetail>(
        `/api/v1/admin/bookings/${booking.id}/status`,
        {
          method: "PATCH",
          token: session.token,
          body: JSON.stringify({ trang_thai: nextStatus }),
        },
      );
      setBooking(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Cập nhật trạng thái thất bại",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Đang tải thông tin đơn đặt phòng...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Không tìm thấy đơn đặt phòng</h1>
        <Button asChild variant="outline">
          <Link href="/admin/bookings">Quay lại quản lý đơn</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{booking.code}</h1>
            <BookingStatusBadge status={booking.trang_thai} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Khách: {booking.user_name || booking.user_email} ·{" "}
            {formatDateRange(booking.check_in, booking.check_out)}
          </p>
        </div>

        <div className="flex gap-2">
          {booking.trang_thai === "PENDING" && (
            <Button
              onClick={() => handleUpdateStatus("CONFIRMED")}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang xử lý..." : "Xác nhận đơn"}
            </Button>
          )}
          {booking.trang_thai === "CONFIRMED" && (
            <Button
              onClick={() => handleUpdateStatus("CHECKED_IN")}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang xử lý..." : "Nhận phòng"}
            </Button>
          )}
          {booking.trang_thai === "CHECKED_IN" && (
            <Button
              onClick={() => handleUpdateStatus("CHECKED_OUT")}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang xử lý..." : "Trả phòng"}
            </Button>
          )}
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phòng trong đơn</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Đơn giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.rooms.map((room) => (
                  <TableRow key={room.so_phong}>
                    <TableCell>{room.so_phong}</TableCell>
                    <TableCell>{room.ten_loai}</TableCell>
                    <TableCell>{formatVnd(room.don_gia)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phương thức</span>
              <span>
                {booking.payment
                  ? paymentMethodLabel[booking.payment.method] ?? booking.payment.method
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền</span>
              <span>{formatVnd(booking.payment?.amount ?? booking.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              {booking.payment ? (
                <PaymentStatusBadge status={booking.payment.status} />
              ) : (
                "—"
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
