import { notFound } from "next/navigation";

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
import { bookings, getBooking } from "@/lib/mock-data";
import {
  formatDateRange,
  formatVnd,
  paymentMethodLabel,
} from "@/lib/format";

type AdminBookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return bookings.map((booking) => ({ id: booking.id }));
}

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{booking.id}</h1>
            <BookingStatusBadge status={booking.trang_thai} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Khách: {booking.user_name} ·{" "}
            {formatDateRange(booking.check_in, booking.check_out)}
          </p>
        </div>
        {booking.trang_thai === "PENDING" ? (
          <Button>Xác nhận đơn</Button>
        ) : null}
        {booking.trang_thai === "CONFIRMED" ? (
          <Button>Nhận phòng</Button>
        ) : null}
        {booking.trang_thai === "CHECKED_IN" ? (
          <Button>Trả phòng</Button>
        ) : null}
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
                  ? paymentMethodLabel[booking.payment.method]
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền</span>
              <span>{formatVnd(booking.payment?.amount ?? 0)}</span>
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
