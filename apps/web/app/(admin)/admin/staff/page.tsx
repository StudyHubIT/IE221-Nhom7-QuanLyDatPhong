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
import { adminAccounts, rolePermissions } from "@/lib/mock-data";

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý tài khoản admin"
        subtitle="Tạo, sửa, khóa tài khoản nội bộ và gán vai trò"
        actionLabel="Thêm admin"
        actionHref="/admin/staff/new"
      />
      <Input defaultValue="admin@hotel.com" placeholder="Tìm email / tên admin" />
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
            {adminAccounts.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.full_name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>
                  <Badge variant="success">{admin.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <StaffRowActions id={admin.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminPagination info="Hiển thị 1–2 / 2 tài khoản" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vai trò & quyền (xem)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {rolePermissions.map((role) => (
            <p key={role.code}>
              {role.code} — {role.permissions}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
