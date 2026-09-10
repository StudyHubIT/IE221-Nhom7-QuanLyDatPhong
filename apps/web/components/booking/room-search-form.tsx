"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BedDouble, Calendar, Hash, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultStay, type RoomType } from "@/lib/room-api-types";
import { cn } from "@/lib/utils";

type RoomSearchFormProps = {
  compact?: boolean;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultType?: string;
  defaultCount?: string;
  className?: string;
  roomTypes: RoomType[];
};

export function RoomSearchForm({
  compact = false,
  defaultCheckIn = defaultStay.checkIn,
  defaultCheckOut = defaultStay.checkOut,
  defaultType = "all",
  defaultCount = String(defaultStay.count),
  className,
  roomTypes,
}: RoomSearchFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [type, setType] = useState(defaultType);
  const [count, setCount] = useState(defaultCount);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      type,
      count,
    });
    router.push(`/rooms?${params.toString()}`);
  }

  // Chế độ Compact (Thanh tìm kiếm siêu gọn nhẹ dạng Pill Floating)
  if (compact) {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex flex-wrap items-center gap-2 md:flex-nowrap text-xs",
          className
        )}
      >
        <div className="flex-1 min-w-[130px] space-y-1">
          <Label htmlFor="check-in-compact" className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            <Calendar className="size-3 text-primary" /> Nhận phòng
          </Label>
          <Input
            id="check-in-compact"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-8 rounded-lg font-medium text-xs border-border/70 bg-background/80"
          />
        </div>

        <div className="flex-1 min-w-[130px] space-y-1">
          <Label htmlFor="check-out-compact" className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            <Calendar className="size-3 text-primary" /> Trả phòng
          </Label>
          <Input
            id="check-out-compact"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-8 rounded-lg font-medium text-xs border-border/70 bg-background/80"
          />
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <Label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            <BedDouble className="size-3 text-primary" /> Loại phòng
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 rounded-lg font-medium text-xs border-border/70 bg-background/80">
              <SelectValue placeholder="Tất cả loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              {roomTypes.map((rt) => (
                <SelectItem key={rt.id} value={String(rt.id)}>
                  {rt.ten_loai}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-20 shrink-0 space-y-1">
          <Label htmlFor="count-compact" className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            <Hash className="size-3 text-primary" /> Số lượng
          </Label>
          <Input
            id="count-compact"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="h-8 rounded-lg font-medium text-xs border-border/70 bg-background/80 text-center"
          />
        </div>

        <div className="flex items-end self-end pt-1">
          <Button
            type="submit"
            size="sm"
            className="h-8 rounded-lg px-3.5 font-semibold text-xs shadow-sm shrink-0"
          >
            <Search className="mr-1 size-3.5" /> Tìm ngay
          </Button>
        </div>
      </form>
    );
  }

  // Chế độ Standard (Bố cục 2x2 cho Hero Card trang chủ)
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b pb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
          <Sparkles className="size-4 text-primary" /> Tìm kiếm phòng trống
        </span>
        <span className="text-xs text-muted-foreground">Giá tốt nhất đảm bảo</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="check-in" className="flex items-center gap-1.5 text-xs font-semibold text-foreground whitespace-nowrap">
            <Calendar className="size-3.5 text-primary" /> Ngày nhận phòng
          </Label>
          <Input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-11 rounded-xl font-medium text-sm border-border/80 focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="check-out" className="flex items-center gap-1.5 text-xs font-semibold text-foreground whitespace-nowrap">
            <Calendar className="size-3.5 text-primary" /> Ngày trả phòng
          </Label>
          <Input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-11 rounded-xl font-medium text-sm border-border/80 focus:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground whitespace-nowrap">
            <BedDouble className="size-3.5 text-primary" /> Loại phòng mong muốn
          </Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11 rounded-xl font-medium text-sm border-border/80">
              <SelectValue placeholder="Tất cả loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              {roomTypes.map((rt) => (
                <SelectItem key={rt.id} value={String(rt.id)}>
                  {rt.ten_loai}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="count" className="flex items-center gap-1.5 text-xs font-semibold text-foreground whitespace-nowrap">
            <Hash className="size-3.5 text-primary" /> Số lượng phòng
          </Label>
          <Input
            id="count"
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="h-11 rounded-xl font-medium text-sm border-border/80 text-center"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base font-bold shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30"
      >
        <Search className="mr-2 size-5" /> TÌM PHÒNG NGAY
      </Button>
    </form>
  );
}
