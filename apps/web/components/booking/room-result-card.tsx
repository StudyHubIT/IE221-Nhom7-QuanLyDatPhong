import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import type { AvailabilityItem } from "@/lib/room-api-types";

type RoomResultCardProps = {
  room: AvailabilityItem;
  detailHref: string;
};

export function RoomResultCard({ room, detailHref }: RoomResultCardProps) {
  return (
    <article className="flex gap-4 rounded-xl border bg-card p-3">
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg">
        <div className="flex h-full items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground">
          Chưa có ảnh phòng
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Phòng {room.so_phong}</h3>
            <Badge variant="success">Còn trống</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{room.ten_loai}</p>
          <p className="text-sm font-medium">
            {formatVnd(room.gia_co_ban)}
            <span className="ml-1 font-normal text-muted-foreground">/ đêm</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={detailHref}>Chi tiết</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cart">Thêm vào giỏ</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
