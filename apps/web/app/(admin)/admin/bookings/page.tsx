import Link from "next/link";

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
import { bookingTotal, bookings } from "@/lib/mock-data";
import { formatDate, formatVnd } from "@/lib/format";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quản lý đặt phòng</h1>
        <p className="text-sm text-muted-foreground">
          Toàn bộ đơn đặt phòng trong hệ thống
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_160px_160px_1fr]">
        <Select defaultValue="all">
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
        <Input type="date" defaultValue="2026-01-01" />
        <Input type="date" defaultValue="2026-12-31" />
        <Input placeholder="Tìm mã đơn hoặc tên khách" />
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
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.user_name}</TableCell>
                <TableCell>{formatDate(booking.check_in)}</TableCell>
                <TableCell>{formatDate(booking.check_out)}</TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.trang_thai} />
                </TableCell>
                <TableCell>{formatVnd(bookingTotal(booking))}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/bookings/${booking.id}`}>Chi tiết</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>Hiển thị 1–{bookings.length} / {bookings.length} đơn</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
