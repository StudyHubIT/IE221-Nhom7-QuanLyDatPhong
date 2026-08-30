import { Calendar, Hash, Layers, type LucideIcon } from "lucide-react";

import { RoomResultCard } from "@/components/booking/room-result-card";
import { RoomSearchForm } from "@/components/booking/room-search-form";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
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
  }>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const query = await searchParams;
  const checkIn = query.checkIn ?? defaultStay.checkIn;
  const checkOut = query.checkOut ?? defaultStay.checkOut;
  const type = query.type ?? "all";
  const count = query.count ?? String(defaultStay.count);
  const availabilityParams = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    count,
  });
  if (type !== "all") availabilityParams.set("loai_phong_id", type);

  let roomTypes: RoomType[] = [];
  let results: AvailabilityItem[] = [];
  let error = false;

  try {
    [roomTypes, results] = await Promise.all([
      apiFetch<RoomType[]>("/api/v1/room-types", { cache: "no-store" }),
      apiFetch<AvailabilityItem[]>(
        `/api/v1/rooms/availability?${availabilityParams.toString()}`,
        { cache: "no-store" },
      ),
    ]);
  } catch {
    error = true;
  }

  const selectedType = roomTypes.find((roomType) => String(roomType.id) === type);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tìm kiếm:</span>
          <Chip icon={Calendar} label={formatDate(checkIn)} />
          <Chip icon={Calendar} label={formatDate(checkOut)} />
          <Chip icon={Layers} label={selectedType?.ten_loai ?? "Tất cả"} />
          <Chip icon={Hash} label={`${count} phòng`} />
        </div>
      </section>

      <RoomSearchForm
        compact
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
        defaultType={type}
        defaultCount={count}
        roomTypes={roomTypes}
      />

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit space-y-6 rounded-xl border bg-card p-4">
          <h2 className="font-semibold">Bộ lọc</h2>
          <div className="space-y-3">
            <p className="text-sm font-medium">Loại phòng</p>
            {["Tất cả", ...roomTypes.map((item) => item.ten_loai)].map(
              (label, index) => (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <Checkbox defaultChecked={index === 0} />
                  {label}
                </label>
              ),
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Khoảng giá / đêm</p>
            {["Dưới 600.000đ", "600.000đ – 1.000.000đ", "Trên 1.000.000đ"].map(
              (label) => (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <Checkbox />
                  {label}
                </label>
              ),
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{results.length} phòng trống</p>
            <p className="text-sm text-muted-foreground">
              Sắp xếp: Giá tăng dần
            </p>
          </div>
          <div className="space-y-3">
            {error ? (
              <p className="text-muted-foreground">
                Không thể tải phòng trống. Vui lòng thử lại sau.
              </p>
            ) : results.length === 0 ? (
              <p className="text-muted-foreground">
                Không có phòng trống phù hợp. Vui lòng thử ngày hoặc loại phòng khác.
              </p>
            ) : results.map((room) => (
              <RoomResultCard
                key={room.id}
                room={room}
                detailHref={`/rooms/${room.loai_phong_id}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Chip({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
      <Icon className="size-3.5 text-muted-foreground" />
      {label}
    </span>
  );
}
