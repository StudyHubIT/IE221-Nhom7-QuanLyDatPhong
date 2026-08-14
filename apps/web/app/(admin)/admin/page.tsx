import Link from "next/link";

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
import { bookings, kpis, pendingRefunds } from "@/lib/mock-data";
import { formatDateRange, formatVnd } from "@/lib/format";

export default function AdminDashboardPage() {
  const latestBookings = bookings.slice(0, 2);

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
                {pendingRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell>{refund.id}</TableCell>
                    <TableCell>{refund.customer_name}</TableCell>
                    <TableCell>{formatVnd(refund.refund_amount)}</TableCell>
                    <TableCell>
                      <RefundStatusBadge status={refund.status} />
                    </TableCell>
                  </TableRow>
                ))}
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
                {latestBookings.map((booking) => (
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
                      <BookingStatusBadge status={booking.trang_thai} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
