import Link from "next/link";
import { notFound } from "next/navigation";

import { CancelBookingDialog } from "@/components/booking/cancel-booking-dialog";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/status-badge";
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
  formatDate,
  formatDateRange,
  formatVnd,
  paymentMethodLabel,
} from "@/lib/format";

type BookingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return bookings.map((booking) => ({ id: booking.id }));
}

export default async function MyBookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/account/bookings" className="hover:text-foreground">
          Đặt phòng của tôi
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{booking.id}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Đơn {booking.id}</h1>
            <BookingStatusBadge status={booking.trang_thai} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ngày đặt: {formatDate(booking.created_at)} ·{" "}
            {formatDateRange(booking.check_in, booking.check_out)}
          </p>
        </div>
        {booking.trang_thai === "CONFIRMED" || booking.trang_thai === "PENDING" ? (
          <CancelBookingDialog bookingId={booking.numericId} />
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
    </main>
  );
}
