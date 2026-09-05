import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateRange, formatVnd, nightCount } from "@/lib/format";
import type { RoomTypeDetail } from "@/lib/room-api-types";

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
};

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  const { id } = await params;
  const { checkIn, checkOut } = await searchParams;
  const detailParams = new URLSearchParams();
  if (checkIn && checkOut) {
    detailParams.set("check_in", checkIn);
    detailParams.set("check_out", checkOut);
  }

  let roomType: RoomTypeDetail;
  try {
    roomType = await apiFetch<RoomTypeDetail>(
      `/api/v1/room-types/${encodeURIComponent(id)}${detailParams.size ? `?${detailParams.toString()}` : ""}`,
      { cache: "no-store" },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="text-muted-foreground">
          Không thể tải chi tiết loại phòng. Vui lòng thử lại sau.
        </p>
      </main>
    );
  }

  const stay = checkIn && checkOut ? { checkIn, checkOut } : null;
  const nights = stay ? nightCount(stay.checkIn, stay.checkOut) : null;

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
            {roomType.image ? (
              <Image
                src={roomType.image}
                alt={roomType.ten_loai}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 640px, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                Chưa có ảnh phòng
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative h-24 overflow-hidden rounded-lg">
                {roomType.image ? (
                  <Image
                    src={roomType.image}
                    alt={`${roomType.ten_loai} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    Chưa có ảnh
                  </div>
                )}
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
          {roomType.description && (
            <p className="text-muted-foreground">{roomType.description}</p>
          )}
          {stay && (
            <p className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              {formatDateRange(stay.checkIn, stay.checkOut)} · {nights} đêm
            </p>
          )}
          <div className="space-y-3 rounded-xl border p-4">
            <p className="font-medium">Phòng còn trống thuộc loại này</p>
            {roomType.available_rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Hiện không còn phòng trống.</p>
            ) : roomType.available_rooms.map((room) => (
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
