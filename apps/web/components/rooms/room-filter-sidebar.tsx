"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Check, Hash, Layers, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomType } from "@/lib/room-api-types";
import { cn } from "@/lib/utils";

type RoomFilterSidebarProps = {
  checkIn: string;
  checkOut: string;
  type: string;
  count: string;
  roomTypes: RoomType[];
};

export function RoomFilterSidebar({
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  type: initialType,
  count: initialCount,
  roomTypes,
}: RoomFilterSidebarProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [type, setType] = useState(initialType);
  const [count, setCount] = useState(initialCount);

  function handleTypeSelect(selectedTypeId: string) {
    setType(selectedTypeId);
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      type: selectedTypeId,
      count,
    });
    // Scroll: false prevents the page from jumping back up to top header
    router.push(`/rooms?${params.toString()}`, { scroll: false });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      type,
      count,
    });
    router.push(`/rooms?${params.toString()}`, { scroll: false });
  }

  return (
    <aside className="h-fit space-y-6 rounded-3xl border border-border/60 bg-card/85 p-6 shadow-xl backdrop-blur-md sticky top-[5rem]">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          <h2 className="font-bold text-foreground text-xs uppercase tracking-wider">
            Bộ lọc & Tìm kiếm
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            handleTypeSelect("all");
            setCount("1");
          }}
          className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <RefreshCw className="size-3" /> Đặt lại
        </button>
      </div>

      {/* Form thời gian lưu trú */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="sidebar-checkin" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" /> Ngày nhận phòng
          </Label>
          <Input
            id="sidebar-checkin"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-10 rounded-xl font-medium text-xs border-border/80 bg-background/80"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sidebar-checkout" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" /> Ngày trả phòng
          </Label>
          <Input
            id="sidebar-checkout"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-10 rounded-xl font-medium text-xs border-border/80 bg-background/80"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sidebar-count" className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Hash className="size-3.5 text-primary" /> Số lượng phòng
          </Label>
          <Input
            id="sidebar-count"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="h-10 rounded-xl font-medium text-xs border-border/80 bg-background/80 text-center"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all hover:shadow-lg"
        >
          <Search className="mr-1.5 size-4" /> Tìm Kiếm
        </Button>
      </form>

      {/* Danh sách Thẻ chọn Hạng Phòng Tương Tác Trực Quan */}
      <div className="space-y-3 border-t pt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layers className="size-3.5 text-primary" /> Hạng phòng nghỉ
        </p>
        <div className="space-y-2">
          {/* Thẻ Tất cả */}
          <button
            type="button"
            onClick={() => handleTypeSelect("all")}
            className={cn(
              "w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all border text-left",
              type === "all"
                ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30"
                : "border-border/60 hover:bg-muted/70 text-foreground"
            )}
          >
            <span>Tất cả hạng phòng</span>
            {type === "all" && <Check className="size-4 text-primary shrink-0" />}
          </button>

          {/* Danh sách từng loại phòng */}
          {roomTypes.map((rt) => {
            const isSelected = type === String(rt.id);
            return (
              <button
                key={rt.id}
                type="button"
                onClick={() => handleTypeSelect(String(rt.id))}
                className={cn(
                  "w-full flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all border text-left",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30"
                    : "border-border/60 hover:bg-muted/70 text-foreground"
                )}
              >
                <span className="truncate pr-2">{rt.ten_loai}</span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {rt.room_count} phòng
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Khoảng giá / đêm */}
      <div className="space-y-3 border-t pt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Khoảng giá / đêm
        </p>
        <div className="space-y-2.5">
          {[
            "Dưới 600.000đ",
            "600.000đ – 1.000.000đ",
            "1.000.000đ – 2.000.000đ",
            "Trên 2.000.000đ",
          ].map((label) => (
            <label key={label} className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-foreground hover:text-primary transition-colors">
              <Checkbox className="rounded-md" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Tiện nghi phòng */}
      <div className="space-y-3 border-t pt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Tiện nghi nổi bật
        </p>
        <div className="space-y-2.5">
          {[
            "Có ban công / View phố",
            "Miễn phí bữa sáng",
            "Bồn tắm nằm",
            "Giường King-size",
          ].map((label) => (
            <label key={label} className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-foreground hover:text-primary transition-colors">
              <Checkbox className="rounded-md" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
