"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Unlock } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
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
import { useAdminSession } from "@/components/auth/session-provider";

type Customer = {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "LOCKED";
};

type PaginatedCustomers = {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
};

export default function AdminCustomersPage() {
  const { session } = useAdminSession();
  const [data, setData] = useState<PaginatedCustomers | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      if (!session?.token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        if (status !== "all") params.append("status", status);
        if (q) params.append("q", q);
        
        const res = await apiFetch<PaginatedCustomers>(`/api/v1/admin/customers?${params.toString()}`, {
          token: session.token,
        });
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [page, status, q, session?.token]);

  async function toggleStatus(id: number, currentStatus: string) {
    if (!session?.token) return;
    const newStatus = currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await apiFetch(`/api/v1/admin/customers/${id}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({ status: newStatus }),
      });
      // reload data locally
      if (data) {
        setData({
          ...data,
          items: data.items.map(c => c.id === id ? { ...c, status: newStatus } : c)
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const customers = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý khách hàng"
        subtitle="Tra cứu và khóa / mở tài khoản khách"
      />
      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="LOCKED">LOCKED</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Tìm tên / email / SĐT"
        />
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.full_name || "Chưa cập nhật"}
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "Chưa cập nhật"}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === "ACTIVE" ? "success" : "destructive"}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button className="w-[100px]" variant="outline" size="sm" onClick={() => toggleStatus(customer.id, customer.status)}>
                      {customer.status === "ACTIVE" ? (
                        <><Lock className="mr-1 size-4" /> Khóa</>
                      ) : (
                        <><Unlock className="mr-1 size-4" /> Mở khóa</>
                      )}
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/bookings?user_id=${customer.id}`}>Xem đơn</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Không tìm thấy khách hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination 
          info={`Hiển thị ${customers.length} / ${data?.total || 0} khách hàng`} 
          page={page}
          hasPrevious={page > 1}
          hasNext={page < totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>
    </div>
  );
}
