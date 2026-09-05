import { RoomSearchForm } from "@/components/booking/room-search-form";
import { RoomTypeCard } from "@/components/booking/room-type-card";
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
    <main>
      <section className="border-b bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
              Đặt phòng khách sạn nhanh chóng, dễ dàng
            </h1>
            <p className="max-w-lg text-muted-foreground">
              Tìm và đặt phòng phù hợp chỉ trong vài bước, giá tốt nhất đảm bảo
            </p>
          </div>
          <Card>
            <CardContent>
              <RoomSearchForm roomTypes={roomTypes} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="loai-phong" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold">Loại phòng của chúng tôi</h2>
          <p className="text-muted-foreground">
            Chọn loại phòng phù hợp với nhu cầu của bạn
          </p>
        </div>
        {error ? (
          <p className="text-muted-foreground">
            Không thể tải danh sách loại phòng. Vui lòng thử lại sau.
          </p>
        ) : roomTypes.length === 0 ? (
          <p className="text-muted-foreground">Hiện chưa có loại phòng nào.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {roomTypes.map((roomType) => (
              <RoomTypeCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <p>© 2026 HotelBook. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Liên hệ</span>
            <span>Điều khoản</span>
            <span>Chính sách</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
