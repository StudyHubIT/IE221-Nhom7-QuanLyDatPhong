"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { defaultStay, roomTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RoomSearchFormProps = {
  compact?: boolean;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultType?: string;
  defaultCount?: string;
  className?: string;
};

export function RoomSearchForm({
  compact = false,
  defaultCheckIn = defaultStay.checkIn,
  defaultCheckOut = defaultStay.checkOut,
  defaultType = "all",
  defaultCount = String(defaultStay.count),
  className,
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

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "grid gap-4",
        compact
          ? "md:grid-cols-[1fr_1fr_1fr_100px_auto]"
          : "md:grid-cols-[1fr_1fr_1fr_120px_auto]",
        className,
      )}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="check-in">Ngày nhận phòng</Label>
        <Input
          id="check-in"
          type="date"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="check-out">Ngày trả phòng</Label>
        <Input
          id="check-out"
          type="date"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Loại phòng</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {roomTypes.map((roomType) => (
              <SelectItem key={roomType.id} value={String(roomType.id)}>
                {roomType.ten_loai}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="count">Số phòng</Label>
        <Input
          id="count"
          type="number"
          min={1}
          value={count}
          onChange={(event) => setCount(event.target.value)}
        />
      </div>
      <div className={cn("flex", compact ? "items-end" : "items-end")}>
        <Button type="submit" size="lg" className="h-8 w-full px-5">
          Tìm phòng
        </Button>
      </div>
    </form>
  );
}
