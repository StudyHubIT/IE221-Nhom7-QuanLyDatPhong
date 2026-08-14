import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
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
import { formatDate, formatVnd, paymentMethodLabel } from "@/lib/format";
import { payments } from "@/lib/mock-data";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý thanh toán"
        subtitle="Theo dõi các giao dịch thanh toán giả lập"
      />
      <div className="grid gap-3 md:grid-cols-[180px_180px_1fr]">
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Phương thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="BANKING">Chuyển khoản</SelectItem>
            <SelectItem value="CASH">Tiền mặt</SelectItem>
          </SelectContent>
        </Select>
        <Input defaultValue="Nguyễn Văn A" placeholder="Tìm khách / mã đơn" />
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
            {payments.map((payment) => (
              <TableRow key={payment.booking_id}>
                <TableCell className="font-medium">
                  {payment.booking_id}
                </TableCell>
                <TableCell>{payment.customer_name}</TableCell>
                <TableCell>{formatVnd(payment.amount)}</TableCell>
                <TableCell>{paymentMethodLabel[payment.method]}</TableCell>
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
            ))}
          </TableBody>
        </Table>
        <AdminPagination info="Hiển thị 1–4 / 4 giao dịch" />
      </div>
    </div>
  );
}
