import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatVnd } from "@/lib/format";
import type { RoomType } from "@/lib/room-api-types";

export function RoomTypeCard({ roomType }: { roomType: RoomType }) {
  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative h-44 w-full">
        {roomType.image ? (
          <Image
            src={roomType.image}
            alt={roomType.ten_loai}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 360px, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Chưa có ảnh phòng
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{roomType.ten_loai}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">
          {formatVnd(roomType.gia_co_ban)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            / đêm
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/rooms/${roomType.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
