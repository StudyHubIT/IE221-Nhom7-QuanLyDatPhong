"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { useAdminSession } from "@/components/auth/session-provider";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RefundStatusBadge } from "@/components/booking/status-badge";
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
import { apiFetch, ApiError } from "@/lib/api";
import { formatVnd } from "@/lib/format";
import type { RefundStatus } from "@/lib/mock-data";

type Refund = {
  id: number;
  code: string;
  booking_id: number;
  booking_code: string | null;
  refund_amount: number;
  status: RefundStatus;
  reason: string | null;
  customer_name: string | null;
};

type PaginatedRefunds = {
  items: Refund[];
  total: number;
};

export default function AdminRefundsPage() {
  const { session } = useAdminSession();
  const token = session?.token;

  const [status, setStatus] = useState("REQUESTED");
  const [keyword, setKeyword] = useState("");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRefunds = useCallback(async () => {
    if (!token) return;
    setError(null);
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (keyword.trim() !== "") params.set("q", keyword.trim());
      const data = await apiFetch<PaginatedRefunds>(
        `/api/v1/admin/refunds?${params.toString()}`,
        { token },
      );
      setRefunds(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Không tải được danh sách hoàn tiền",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, status, keyword]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  async function handleDecision(refundId: number, decision: "approve" | "reject") {
    setError(null);
    try {
      await apiFetch(`/api/v1/admin/refunds/${refundId}/${decision}`, {
        method: "POST",
        token,
      });
      await loadRefunds();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xử lý thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý yêu cầu hoàn tiền"
        subtitle="Duyệt hoặc từ chối yêu cầu hủy / hoàn tiền của khách"
      />
      <div className="grid gap-3 md:grid-cols-[200px_1fr]">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="REQUESTED">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm khách / mã hoàn tiền"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Khách</TableHead>
              <TableHead>Đơn</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : refunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Chưa có yêu cầu hoàn tiền nào.
                </TableCell>
              </TableRow>
            ) : (
              refunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-medium">{refund.code}</TableCell>
                  <TableCell>{refund.customer_name}</TableCell>
                  <TableCell>{refund.booking_code}</TableCell>
                  <TableCell>{formatVnd(refund.refund_amount)}</TableCell>
                  <TableCell>{refund.reason}</TableCell>
                  <TableCell>
                    <RefundStatusBadge status={refund.status} />
                  </TableCell>
                  <TableCell>
                    {refund.status === "REQUESTED" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDecision(refund.id, "approve")}
                        >
                          <Check />
                          Duyệt
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDecision(refund.id, "reject")}
                        >
                          <X />
                          Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Đã xử lý
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <AdminPagination
          info={`Hiển thị ${refunds.length} / ${total} yêu cầu`}
        />
      </div>
    </div>
  );
}
