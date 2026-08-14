import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { defaultStay, getRoomsByType, getRoomType, roomTypes } from "@/lib/mock-data";
import { formatDateRange, formatVnd, nightCount } from "@/lib/format";

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return roomTypes.map((roomType) => ({ id: String(roomType.id) }));
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const roomType = getRoomType(id);
  if (!roomType) notFound();

  const availableRooms = getRoomsByType(roomType.id);
  const nights = nightCount(defaultStay.checkIn, defaultStay.checkOut);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <span className="px-2">/</span>
        <Link href="/rooms" className="hover:text-foreground">
          Kết quả tìm phòng
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{roomType.ten_loai}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="relative h-80 overflow-hidden rounded-xl">
            <Image
              src={roomType.image}
              alt={roomType.ten_loai}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 640px, 100vw"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative h-24 overflow-hidden rounded-lg">
                <Image
                  src={roomType.image}
                  alt={`${roomType.ten_loai} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-semibold">{roomType.ten_loai}</h1>
            <p className="mt-2 text-2xl font-semibold">
              {formatVnd(roomType.gia_co_ban)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / đêm
              </span>
            </p>
          </div>
          <p className="text-muted-foreground">{roomType.description}</p>
          <p className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            {formatDateRange(defaultStay.checkIn, defaultStay.checkOut)} · {nights}{" "}
            đêm
          </p>
          <div className="space-y-3 rounded-xl border p-4">
            <p className="font-medium">Phòng còn trống thuộc loại này</p>
            {availableRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between text-sm"
              >
                <span>Phòng {room.so_phong}</span>
                <Badge variant="success">Còn trống</Badge>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="h-10 w-full">
            <Link href="/cart">Thêm vào giỏ</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
