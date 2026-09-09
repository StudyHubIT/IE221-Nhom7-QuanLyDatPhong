"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { StaffRowActions } from "@/components/admin/staff-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type AdminAccount = {
  id: number;
  full_name: string | null;
  email: string;
  role: string;
  status: "ACTIVE" | "LOCKED";
};

type Role = {
  code: string;
  name: string | null;
  permissions: string[];
};

type PaginatedAdmins = {
  items: AdminAccount[];
  total: number;
  page: number;
  page_size: number;
};

export default function AdminStaffPage() {
  const { session } = useAdminSession();
  const [data, setData] = useState<PaginatedAdmins | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAdmins() {
    if (!session?.token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (q) params.append("q", q);
      
      const res = await apiFetch<PaginatedAdmins>(`/api/v1/admin/admins?${params.toString()}`, {
        token: session.token,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    if (!session?.token) return;
    try {
      const res = await apiFetch<Role[]>(`/api/v1/admin/roles`, {
        token: session.token,
      });
      setRoles(res);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, [page, q, session?.token]);

  useEffect(() => {
    loadRoles();
  }, [session?.token]);

  async function toggleStatus(id: number, currentStatus: string) {
    if (!session?.token) return;
    const newStatus = currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    try {
      await apiFetch(`/api/v1/admin/admins/${id}/status`, {
        method: "PATCH",
        token: session.token,
        body: JSON.stringify({ status: newStatus }),
      });
      if (data) {
        setData({
          ...data,
          items: data.items.map(a => a.id === id ? { ...a, status: newStatus } : a)
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const admins = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

  return (
    <div className="flex flex-col space-y-6 min-h-[calc(100vh-8rem)]">
      <AdminPageHeader
        title="Quản lý tài khoản admin"
        subtitle="Tạo, sửa, khóa tài khoản nội bộ và gán vai trò"
        actionLabel="Thêm admin"
        actionHref="/admin/staff/new"
      />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1); }}
        placeholder="Tìm email / tên admin" 
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.full_name || "Chưa cập nhật"}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>
                  <Badge variant={admin.status === "ACTIVE" ? "success" : "destructive"}>
                    {admin.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <StaffRowActions id={admin.id} status={admin.status} onToggleStatus={toggleStatus} />
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Không tìm thấy nhân viên nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <AdminPagination 
          info={`Hiển thị ${admins.length} / ${data?.total || 0} tài khoản`} 
          page={page}
          hasPrevious={page > 1}
          hasNext={page < totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>
      <Card className="mt-auto">
        <CardHeader>
          <CardTitle>Vai trò & quyền (xem)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {roles.map((role) => (
            <p key={role.code}>
              {role.code} — {role.permissions.join(", ")}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
