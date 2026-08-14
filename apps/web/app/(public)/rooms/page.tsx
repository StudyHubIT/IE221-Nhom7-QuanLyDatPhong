import { Calendar, Hash, Layers, type LucideIcon } from "lucide-react";

import { RoomResultCard } from "@/components/booking/room-result-card";
import { RoomSearchForm } from "@/components/booking/room-search-form";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultStay, rooms, roomTypes } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

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
  const selectedType = roomTypes.find((roomType) => String(roomType.id) === type);

  const results = rooms
    .filter((room) => type === "all" || String(room.loai_phong_id) === type)
    .map((room) => ({
      room,
      roomType: roomTypes.find((item) => item.id === room.loai_phong_id)!,
    }));

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
            {results.map(({ room, roomType }) => (
              <RoomResultCard
                key={room.id}
                room={room}
                roomType={roomType}
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
