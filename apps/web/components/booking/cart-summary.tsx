import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatVnd } from "@/lib/format";
import type { BookingRoom } from "@/lib/mock-data";

type CartSummaryProps = {
  title?: string;
  nights: number;
  rooms: BookingRoom[];
  hint?: string;
  actionHref: string;
  actionLabel: string;
};

export function CartSummary({
  title = "Tóm tắt đơn hàng",
  nights,
  rooms,
  hint,
  actionHref,
  actionLabel,
}: CartSummaryProps) {
  const roomCount = rooms.length;
  const subtotal = rooms.reduce((sum, room) => sum + room.don_gia, 0) * nights;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Số đêm</span>
          <span>{nights} đêm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Số phòng</span>
          <span>{roomCount} phòng</span>
        </div>
        {rooms.map((room) => (
          <div key={room.so_phong} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {room.so_phong} · {room.ten_loai}
            </span>
            <span>{formatVnd(room.don_gia)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Tổng</span>
          <span>{formatVnd(subtotal)}</span>
        </div>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
