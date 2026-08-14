import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/format";
import type { Room, RoomType } from "@/lib/mock-data";

type RoomResultCardProps = {
  room: Room;
  roomType: RoomType;
};

export function RoomResultCard({ room, roomType }: RoomResultCardProps) {
  return (
    <article className="flex gap-4 rounded-xl border bg-card p-3">
      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={roomType.image}
          alt={roomType.ten_loai}
          fill
          className="object-cover"
          sizes="144px"
        />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Phòng {room.so_phong}</h3>
            <Badge variant="success">Còn trống</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{roomType.ten_loai}</p>
          <p className="text-sm font-medium">
            {formatVnd(roomType.gia_co_ban)}
            <span className="ml-1 font-normal text-muted-foreground">/ đêm</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/rooms/${roomType.id}`}>Chi tiết</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cart">Thêm vào giỏ</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
