"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVnd, nightCount } from "@/lib/format";
import type { RoomTypeDetail } from "@/lib/room-api-types";

type RoomBookingSidebarProps = {
  roomType: RoomTypeDetail;
  stay: { checkIn: string; checkOut: string } | null;
};

export function RoomBookingSidebar({
  roomType,
  stay,
}: RoomBookingSidebarProps) {
  const router = useRouter();
  const availableCount = roomType.available_rooms.length;
  const [quantity, setQuantity] = useState(1);

  const nights = stay ? nightCount(stay.checkIn, stay.checkOut) : 1;
  const totalPrice = roomType.gia_co_ban * nights * quantity;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < availableCount) setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (availableCount === 0) return;

    // Tự động pick N phòng trống đầu tiên
    const selectedRooms = roomType.available_rooms.slice(0, quantity);
    console.log("Auto-assigned rooms:", selectedRooms);

    // Chuyển hướng sang giỏ hàng / checkout
    router.push("/cart");
  };

  return (
    <Card className="sticky top-20 border-border/80 shadow-md">
      <CardContent className="space-y-6 p-6">
        {/* Banner tình trạng phòng trống chuẩn Booking.com */}
        {availableCount > 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              {availableCount === 1
                ? "🔥 Chỉ còn 1 phòng trống duy nhất trong thời gian này!"
                : `● Còn ${availableCount} phòng khả dụng sẵn sàng phục vụ`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-bold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>❌ Đã hết phòng thuộc hạng này trong khoảng thời gian chọn</span>
          </div>
        )}

        {/* Đơn giá niêm yết */}
        <div className="border-b pb-4">
          <span className="block text-xs text-muted-foreground">Đơn giá theo đêm</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-primary">
              {formatVnd(roomType.gia_co_ban)}
            </span>
            <span className="text-xs text-muted-foreground">/ đêm / phòng</span>
          </div>
        </div>

        {/* Lịch lưu trú đã chọn */}
        {stay && (
          <div className="rounded-xl bg-muted/50 p-3 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Calendar className="size-3.5 text-primary" />
              <span>Thời gian lưu trú dự kiến:</span>
            </div>
            <span className="font-semibold text-foreground block">
              {stay.checkIn} đến {stay.checkOut} ({nights} đêm)
            </span>
          </div>
        )}

        {/* Bộ chọn số lượng phòng (Quantity Stepper [1-N]) */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Số lượng phòng đặt
            </span>
            <span className="text-xs text-muted-foreground">
              (Tối đa {availableCount} phòng)
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/80 p-1.5 bg-card">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity <= 1 || availableCount === 0}
              className="size-9 rounded-lg"
              title="Giảm số lượng"
            >
              <Minus className="size-4" />
            </Button>

            <div className="text-center">
              <span className="text-base font-extrabold text-foreground">{quantity}</span>
              <span className="text-xs text-muted-foreground ml-1">phòng</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              disabled={quantity >= availableCount || availableCount === 0}
              className="size-9 rounded-lg"
              title="Tăng số lượng"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        {/* Tổng tiền tính toán real-time */}
        <div className="border-t pt-4 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-foreground">Tổng cộng chi phí</span>
            <span className="text-2xl font-extrabold text-primary">
              {formatVnd(totalPrice)}
            </span>
          </div>
          <span className="block text-[11px] text-muted-foreground text-right">
            ({nights} đêm x {quantity} phòng)
          </span>
        </div>

        {/* Nút Đặt phòng & Bảo mật */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={availableCount === 0}
            className="w-full rounded-xl text-base font-bold shadow-md shadow-primary/25 transition-all hover:shadow-lg"
          >
            {availableCount > 0 ? (
              <span className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Đặt {quantity} phòng ngay <ArrowRight className="size-4" />
              </span>
            ) : (
              <span>Hết phòng khả dụng</span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Giữ phòng tức thì · Hủy miễn phí linh hoạt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
