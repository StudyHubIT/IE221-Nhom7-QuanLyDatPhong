import Link from "next/link";
import { ArrowRight, Hotel } from "lucide-react";

import { RoomTypeCard } from "@/components/booking/room-type-card";
import { HomeHero } from "@/components/home/home-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import type { RoomType } from "@/lib/room-api-types";

export default async function HomePage() {
  let roomTypes: RoomType[] = [];
  let error = false;

  try {
    roomTypes = await apiFetch<RoomType[]>("/api/v1/room-types", {
      cache: "no-store",
    });
  } catch {
    error = true;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Full-bleed Luxury Hero Section with Auto-playing Slideshow & Glassmorphism Search */}
      <HomeHero roomTypes={roomTypes} />

      {/* Section #loai-phong */}
      <section id="loai-phong" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Hạng phòng nổi bật
            </span>
            <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
              Danh sách hạng phòng nghỉ dưỡng
            </h2>
            <p className="text-sm text-muted-foreground">
              Lựa chọn không gian nghỉ dưỡng lý tưởng được thiết kế riêng cho từng trải nghiệm.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-xl border-border/80 text-xs font-semibold hover:border-primary hover:text-primary transition-all">
            <Link href="/rooms">
              Xem tất cả phòng <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>

        {error ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold text-destructive">
                Không thể kết nối đến hệ thống máy chủ.
              </p>
              <p className="text-xs text-muted-foreground">
                Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.
              </p>
            </CardContent>
          </Card>
        ) : roomTypes.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardContent className="space-y-2">
              <Hotel className="mx-auto size-10 text-muted-foreground stroke-[1.5]" />
              <p className="text-sm text-muted-foreground">Hiện chưa có loại phòng nào được cập nhật.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roomTypes.map((roomType) => (
              <RoomTypeCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between sm:px-6 lg:px-8 text-xs text-muted-foreground">
          <p>© 2026 HotelBook. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-foreground transition-colors">Liên hệ</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
