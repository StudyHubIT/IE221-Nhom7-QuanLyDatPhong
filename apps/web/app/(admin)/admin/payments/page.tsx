"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { useAdminSession } from "@/components/auth/session-provider";
import { PaymentStatusBadge } from "@/components/booking/status-badge";
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
import { formatDate, formatVnd, paymentMethodLabel } from "@/lib/format";
import type { PaymentMethod, PaymentStatus } from "@/lib/room-api-types";

type PaymentRecord = {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  booking_id: number;
  booking_code: string;
  customer_name: string;
};

type PaginatedPayments = {
  items: PaymentRecord[];
  total: number;
  page: number;
  page_size: number;
};

export default function AdminPaymentsPage() {
  const { session } = useAdminSession();
  const [status, setStatus] = useState<string>("all");
  const [method, setMethod] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [data, setData] = useState<PaginatedPayments | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPayments = useCallback(async () => {
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
    if (method !== "all") params.set("method", method);
    if (query.trim()) params.set("q", query.trim());

    try {
      const res = await apiFetch<PaginatedPayments>(
        `/api/v1/admin/payments?${params}`,
        { token: session.token },
      );
      setData(res);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, page, status, method, query]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const first = data?.total ? (data.page - 1) * data.page_size + 1 : 0;
  const last = data ? Math.min(data.total, data.page * data.page_size) : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý thanh toán"
        subtitle="Theo dõi các giao dịch thanh toán"
      />
      <div className="grid gap-3 md:grid-cols-[180px_180px_1fr]">
        <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={(val) => { setMethod(val); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Phương thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phương thức</SelectItem>
            <SelectItem value="BANKING">Chuyển khoản</SelectItem>
            <SelectItem value="CASH">Tiền mặt</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Tìm khách / mã đơn"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Đang tải danh sách thanh toán...
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Không tìm thấy giao dịch nào
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.booking_code || `DP-${payment.booking_id}`}
                  </TableCell>
                  <TableCell>{payment.customer_name || "Khách hàng"}</TableCell>
                  <TableCell>{formatVnd(payment.amount)}</TableCell>
                  <TableCell>
                    {paymentMethodLabel[payment.method] ?? payment.method}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{formatDate(payment.created_at)}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/bookings/${payment.booking_id}`}>
                        Xem đơn
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <AdminPagination
          info={`Hiển thị ${first}–${last} / ${data?.total ?? 0} giao dịch`}
          page={data?.page}
          hasPrevious={Boolean(data && data.page > 1)}
          hasNext={Boolean(data && data.page * data.page_size < data.total)}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
