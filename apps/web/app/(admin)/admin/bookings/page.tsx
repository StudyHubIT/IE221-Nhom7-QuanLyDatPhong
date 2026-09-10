"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAdminSession } from "@/components/auth/session-provider";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { formatDate, formatVnd } from "@/lib/format";
import type { BookingStatus } from "@/lib/room-api-types";

type AdminBookingItem = {
  id: number;
  code: string;
  user_name: string;
  user_email: string;
  check_in: string;
  check_out: string;
  created_at: string;
  trang_thai: BookingStatus;
  total: number;
};

type PaginatedBookings = {
  items: AdminBookingItem[];
  total: number;
  page: number;
  page_size: number;
};

export default function AdminBookingsPage() {
  const { session } = useAdminSession();
  const [status, setStatus] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<PaginatedBookings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadBookings = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      page_size: "20",
    });
    if (status !== "all") params.set("status", status);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (query.trim()) params.set("q", query.trim());

    try {
      const res = await apiFetch<PaginatedBookings>(
        `/api/v1/admin/bookings?${params}`,
        { token: session.token },
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, page, status, fromDate, toDate, query]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const first = data?.total ? (data.page - 1) * data.page_size + 1 : 0;
  const last = data ? Math.min(data.total, data.page * data.page_size) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quản lý đặt phòng</h1>
        <p className="text-sm text-muted-foreground">
          Toàn bộ đơn đặt phòng trong hệ thống
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_160px_160px_1fr]">
        <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="CHECKED_IN">Đã nhận phòng</SelectItem>
            <SelectItem value="CHECKED_OUT">Đã trả phòng</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
          placeholder="Từ ngày"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
          placeholder="Đến ngày"
        />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Tìm mã đơn hoặc tên khách"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Đang tải danh sách...
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Không tìm thấy đơn nào
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.code}</TableCell>
                  <TableCell>{booking.user_name || booking.user_email}</TableCell>
                  <TableCell>{formatDate(booking.check_in)}</TableCell>
                  <TableCell>{formatDate(booking.check_out)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.trang_thai} />
                  </TableCell>
                  <TableCell>{formatVnd(booking.total)}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/bookings/${booking.id}`}>Chi tiết</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>
            Hiển thị {first}–{last} / {data?.total ?? 0} đơn
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span className="flex items-center px-2 font-medium text-foreground">
              Trang {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data || page * data.page_size >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
