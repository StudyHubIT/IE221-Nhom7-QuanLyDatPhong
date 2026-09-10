"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Coffee, Eye, Hotel, Users, Wifi } from "lucide-react";

import { RoomDetailDialog } from "@/components/booking/room-detail-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVnd } from "@/lib/format";
import type { RoomType } from "@/lib/room-api-types";

const fallbackRoomImages = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
];

export function RoomTypeCard({ roomType }: { roomType: RoomType }) {
  const [openDetail, setOpenDetail] = useState(false);
  const imageUrl =
    roomType.image || fallbackRoomImages[roomType.id % fallbackRoomImages.length];

  return (
    <>
      <Card className="group overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-xl flex flex-col justify-between">
        <div>
          {/* Khung ảnh loại phòng */}
          <div
            onClick={() => setOpenDetail(true)}
            className="relative h-56 w-full overflow-hidden bg-muted cursor-pointer"
          >
            <Image
              src={imageUrl}
              alt={roomType.ten_loai}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 380px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

            {/* Badge đếm số phòng khả dụng */}
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
                <Hotel className="size-3.5" />
                {roomType.room_count} phòng khả dụng
              </span>
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/30 shadow-lg">
                <Eye className="size-4" /> Xem nhanh chi tiết
              </span>
            </div>

            {/* Tiêu đề ghi chú đè trên ảnh */}
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                {roomType.ten_loai}
              </h3>
            </div>
          </div>

          {/* Nội dung mô tả và tiện nghi */}
          <CardContent className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {roomType.description ||
                "Không gian lưu trú được thiết kế hiện đại, đầy đủ tiện nghi cao cấp mang lại sự thoải mái nhất."}
            </p>

            {/* Tag tiện nghi nhanh */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-1">
                <Users className="size-3.5 text-primary" /> 2 Khách
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="size-3.5 text-primary" /> Wifi 5G
              </span>
              <span className="flex items-center gap-1">
                <Coffee className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Bữa sáng
              </span>
            </div>
          </CardContent>
        </div>

        {/* Footer Giá & Nút xem chi tiết */}
        <div className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
          <div>
            <span className="block text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              Giá từ
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-primary">
                {formatVnd(roomType.gia_co_ban)}
              </span>
              <span className="text-xs text-muted-foreground">/ đêm</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setOpenDetail(true)}
            variant="outline"
            className="rounded-xl border-border/80 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Khám phá <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </Card>

      {/* Quick Preview Popup Dialog */}
      <RoomDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        roomType={roomType}
      />
    </>
  );
}
