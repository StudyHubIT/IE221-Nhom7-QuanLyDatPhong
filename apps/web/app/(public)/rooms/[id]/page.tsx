import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  Coffee,
  Maximize2,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";

import { RoomBookingSidebar } from "@/components/booking/room-booking-sidebar";
import { ApiError, apiFetch } from "@/lib/api";
import { nightCount } from "@/lib/format";
import type { RoomTypeDetail } from "@/lib/room-api-types";

type RoomDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
};

// Bộ sưu tập ảnh minh họa chất lượng cao cho phòng resort
const fallbackGallery = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80",
];

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
      <main className="mx-auto w-full max-w-6xl px-6 py-12 text-center text-muted-foreground">
        Không thể tải thông tin chi tiết loại phòng. Vui lòng thử lại sau.
      </main>
    );
  }

  const stay = checkIn && checkOut ? { checkIn, checkOut } : null;
  const mainImage = roomType.image || fallbackGallery[0];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6">
      {/* Breadcrumb điều hướng */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/rooms" className="hover:text-foreground">
          Danh sách phòng
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">{roomType.ten_loai}</span>
      </nav>

      {/* Grid Bố cục chính */}
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          {/* Gallery Ảnh phòng */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 overflow-hidden rounded-2xl border bg-muted shadow-sm">
              <Image
                src={mainImage}
                alt={roomType.ten_loai}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 680px, 100vw"
              />
              <div className="absolute left-4 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
                  <Sparkles className="size-3.5" /> Hạng phòng cao cấp
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {fallbackGallery.slice(1, 4).map((imgUrl, index) => (
                <div key={index} className="relative h-24 overflow-hidden rounded-xl border bg-muted">
                  <Image
                    src={imgUrl}
                    alt={`${roomType.ten_loai} view ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="220px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tiêu đề & Mô tả phòng */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {roomType.ten_loai}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Không gian thiết kế sang trọng, view thoáng đãng và nội thất thượng hạng.
              </p>
            </div>

            {/* Thông số kỹ thuật nhanh */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border p-3 text-center space-y-1 bg-card/60">
                <Users className="size-5 text-primary mx-auto" />
                <span className="block text-[11px] text-muted-foreground">Sức chứa</span>
                <span className="text-xs font-bold text-foreground">Tối đa 2-3 khách</span>
              </div>
              <div className="rounded-xl border p-3 text-center space-y-1 bg-card/60">
                <Maximize2 className="size-5 text-primary mx-auto" />
                <span className="block text-[11px] text-muted-foreground">Diện tích</span>
                <span className="text-xs font-bold text-foreground">38 m²</span>
              </div>
              <div className="rounded-xl border p-3 text-center space-y-1 bg-card/60">
                <Wifi className="size-5 text-primary mx-auto" />
                <span className="block text-[11px] text-muted-foreground">Internet</span>
                <span className="text-xs font-bold text-foreground">Wifi 5G tốc độ cao</span>
              </div>
              <div className="rounded-xl border p-3 text-center space-y-1 bg-card/60">
                <Coffee className="size-5 text-primary mx-auto" />
                <span className="block text-[11px] text-muted-foreground">Bữa sáng</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Miễn phí Buffet</span>
              </div>
            </div>

            {roomType.description && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="text-sm font-semibold text-foreground">Mô tả tổng quan</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {roomType.description}
                </p>
              </div>
            )}

            {/* Danh sách tiện nghi bao gồm */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold text-foreground">Tiện nghi phòng tiêu chuẩn</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {[
                  "Điều hòa nhiệt độ 2 chiều",
                  "Smart TV 55-inch 4K Ultra HD",
                  "Phòng tắm riêng có bồn tắm nằm",
                  "Máy sấy tóc & Đồ vệ sinh cá nhân cao cấp",
                  "Két sắt an toàn bảo mật",
                  "Tủ lạnh Minibar & Đồ uống miễn phí",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Chọn phòng & Đặt ngay với RoomBookingSidebar */}
        <div className="space-y-6">
          <RoomBookingSidebar roomType={roomType} stay={stay} />
        </div>
      </section>
    </main>
  );
}
