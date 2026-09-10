"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, DoorOpen, Eye, Maximize2, Tv, Users, Wifi } from "lucide-react";

import { useCart } from "@/components/booking/cart-provider";
import { RoomDetailDialog } from "@/components/booking/room-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVnd } from "@/lib/format";
import type { AvailabilityItem } from "@/lib/room-api-types";

type RoomResultCardProps = {
  room: AvailabilityItem;
  detailHref?: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
];

export function RoomResultCard({ room }: RoomResultCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [openDetail, setOpenDetail] = useState(false);
  const imageUrl =
    room.image || fallbackImages[room.id % fallbackImages.length];

  const handleAddToCart = () => {
    addItem({
      phong_id: room.id,
      so_phong: String(100 + room.id),
      ten_loai: room.ten_loai,
      don_gia: room.gia_co_ban,
      suc_chua: 2,
      image: imageUrl,
      mo_ta: "Không gian nghỉ dưỡng sang trọng, tiện nghi cao cấp với thiết kế hiện đại.",
    });
    router.push("/cart");
  };

  return (
    <>
      <Card className="group overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Khung ảnh phòng */}
            <div
              onClick={() => setOpenDetail(true)}
              className="relative h-48 sm:h-auto sm:w-64 shrink-0 overflow-hidden bg-muted cursor-pointer"
            >
              <Image
                src={imageUrl}
                alt={room.ten_loai}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 256px, 100vw"
              />
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
                  <DoorOpen className="size-3.5" />
                  Phòng {room.so_phong}
                </span>
              </div>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/30 shadow-lg">
                  <Eye className="size-3.5" /> Xem nhanh
                </span>
              </div>
            </div>

              {/* Nội dung thông tin phòng */}
              <div className="flex flex-1 flex-col justify-between p-5 md:p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => setOpenDetail(true)}
                        className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                      >
                        {room.ten_loai}
                      </h3>
                      {/* Tag Phân Loại Hạng Phòng */}
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary border border-primary/20">
                        HẠNG {room.ten_loai.toUpperCase()}
                      </span>
                    </div>
                    <Badge variant="success" className="rounded-full px-3 py-1 text-[11px] font-bold shadow-xs">
                      ● Sẵn sàng đón khách
                    </Badge>
                  </div>

                  {/* Bộ Tags Tiện Nghi & Đặc Điểm Hẳn Hoi */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-muted/60 px-2.5 py-1 text-muted-foreground border border-border/40">
                      <Users className="size-3.5 text-primary" /> 2 Khách lớn
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-muted/60 px-2.5 py-1 text-muted-foreground border border-border/40">
                      <Maximize2 className="size-3.5 text-primary" /> 35 - 45 m²
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-muted/60 px-2.5 py-1 text-muted-foreground border border-border/40">
                      <DoorOpen className="size-3.5 text-primary" /> Giường King Size
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                      ☕ Miễn phí bữa sáng
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-muted/60 px-2.5 py-1 text-muted-foreground border border-border/40">
                      <Wifi className="size-3.5 text-primary" /> Wifi 5G
                    </span>
                  </div>
                </div>

              {/* Chân trang giá phòng & Nút hành động */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t pt-4">
                <div>
                  <span className="block text-xs text-muted-foreground">Giá mỗi đêm từ</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-primary">
                      {formatVnd(room.gia_co_ban)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ đêm</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setOpenDetail(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border/80 text-xs"
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    size="sm"
                    className="rounded-xl text-xs shadow-sm shadow-primary/20"
                  >
                    Chọn phòng ngay <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Preview Popup Dialog */}
      <RoomDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        availabilityItem={room}
      />
    </>
  );
}
