import Link from "next/link";
import { CircleCheck } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bookings } from "@/lib/mock-data";
import { formatDateRange, formatVnd, nightCount } from "@/lib/format";

export default function CheckoutSuccessPage() {
  const booking = bookings[0];
  const nights = nightCount(booking.check_in, booking.check_out);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CircleCheck className="size-8" />
      </span>
      <h1 className="text-2xl font-semibold">Đặt phòng thành công</h1>
      <p className="mt-2 text-muted-foreground">Mã đơn: {booking.id}</p>

      <Card className="mt-8 w-full text-left">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tóm tắt đơn</CardTitle>
          <BookingStatusBadge status={booking.trang_thai} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày ở</span>
            <span>
              {formatDateRange(booking.check_in, booking.check_out)} · {nights}{" "}
              đêm
            </span>
          </div>
          {booking.rooms.map((room) => (
            <div key={room.so_phong} className="flex justify-between">
              <span className="text-muted-foreground">
                {room.so_phong} · {room.ten_loai}
              </span>
              <span>{formatVnd(room.don_gia)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Đã thanh toán</span>
            <span>{formatVnd(booking.payment?.amount ?? 0)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href={`/account/bookings/${booking.id}`}>Xem chi tiết đơn</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </main>
  );
}
