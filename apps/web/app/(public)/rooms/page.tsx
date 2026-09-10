import { Hotel } from "lucide-react";

import { RoomResultCard } from "@/components/booking/room-result-card";
import { RoomFilterSidebar } from "@/components/rooms/room-filter-sidebar";
import { RoomPagination } from "@/components/rooms/room-pagination";
import { RoomsHero } from "@/components/rooms/rooms-hero";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import {
  defaultStay,
  type AvailabilityItem,
  type RoomType,
} from "@/lib/room-api-types";

type RoomsPageProps = {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    type?: string;
    count?: string;
    page?: string;
  }>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const query = await searchParams;
  const checkIn = query.checkIn ?? defaultStay.checkIn;
  const checkOut = query.checkOut ?? defaultStay.checkOut;
  const type = query.type ?? "all";
  const count = query.count ?? String(defaultStay.count);
  const currentPage = Math.max(1, Number(query.page ?? "1"));
  const pageSize = 6;

  const availabilityParams = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    count,
  });
  if (type !== "all") availabilityParams.set("loai_phong_id", type);

  const pagedParams = new URLSearchParams(availabilityParams);
  pagedParams.set("page", String(currentPage));
  pagedParams.set("page_size", String(pageSize));

  let roomTypes: RoomType[] = [];
  let totalAvailableRooms: AvailabilityItem[] = [];
  let pageResults: AvailabilityItem[] = [];
  let error = false;

  try {
    [roomTypes, totalAvailableRooms, pageResults] = await Promise.all([
      apiFetch<RoomType[]>("/api/v1/room-types", { cache: "no-store" }),
      apiFetch<AvailabilityItem[]>(
        `/api/v1/rooms/availability?${availabilityParams.toString()}`,
        { cache: "no-store" },
      ),
      apiFetch<AvailabilityItem[]>(
        `/api/v1/rooms/availability?${pagedParams.toString()}`,
        { cache: "no-store" },
      ),
    ]);
  } catch {
    error = true;
  }

  const totalItems = totalAvailableRooms.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <main className="w-full min-h-screen bg-background">
      {/* Full-Bleed Resort Hero Decor Header */}
      <RoomsHero />

      {/* Grid Bố cục chính Tràn lề tối đa max-w-[1600px] */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Bộ lọc & Tìm kiếm Tích hợp (Sticky Neo Cố định) */}
          <RoomFilterSidebar
            checkIn={checkIn}
            checkOut={checkOut}
            type={type}
            count={count}
            roomTypes={roomTypes}
          />

          {/* Danh sách phòng kết quả */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  Kết quả phòng khả dụng
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tìm thấy <span className="text-primary font-bold">{totalItems}</span> phòng trống phù hợp với khoảng thời gian bạn chọn.
                </p>
              </div>

              <p className="text-xs text-muted-foreground hidden sm:block">
                Sắp xếp theo: <span className="font-semibold text-foreground">Giá tăng dần</span>
              </p>
            </div>

            <div className="space-y-4">
              {error ? (
                <Card className="border-dashed py-12 text-center">
                  <CardContent className="space-y-2">
                    <p className="text-sm font-semibold text-destructive">
                      Không thể kết nối đến máy chủ tìm kiếm.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vui lòng làm mới trang hoặc thử lại sau vài phút.
                    </p>
                  </CardContent>
                </Card>
              ) : pageResults.length === 0 ? (
                <Card className="border-dashed py-12 text-center">
                  <CardContent className="space-y-4">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Hotel className="size-8 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold">Không tìm thấy phòng trống</h3>
                      <p className="text-sm text-muted-foreground">
                        Rất tiếc, tất cả các phòng đã được lấp đầy trong khoảng thời gian bạn chọn. Vui lòng thay đổi ngày trên bộ lọc bên trái.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {pageResults.map((room) => (
                    <RoomResultCard
                      key={room.id}
                      room={room}
                      detailHref={`/rooms/${room.loai_phong_id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`}
                    />
                  ))}

                  {/* Thanh phân trang Paging đàng hoàng */}
                  <RoomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
