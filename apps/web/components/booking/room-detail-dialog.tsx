"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Coffee,
  DoorOpen,
  Maximize2,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
  Wifi,
} from "lucide-react";

import { useCart } from "@/components/booking/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { formatVnd } from "@/lib/format";
import type { AvailabilityItem, RoomType } from "@/lib/room-api-types";
import { defaultStay } from "@/lib/room-api-types";

type RoomDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomType?: RoomType | null;
  availabilityItem?: AvailabilityItem | null;
};

const fallbackGallery = [
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
];

export function RoomDetailDialog({
  open,
  onOpenChange,
  roomType,
  availabilityItem,
}: RoomDetailDialogProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const title = roomType?.ten_loai ?? availabilityItem?.ten_loai ?? "Hạng phòng cao cấp";
  const price = roomType?.gia_co_ban ?? availabilityItem?.gia_co_ban ?? 0;
  const description =
    roomType?.description ??
    "Không gian lưu trú được thiết kế hiện đại, tràn ngập ánh sáng tự nhiên với đầy đủ tiện nghi 5 sao, mang lại sự riêng tư và thoải mái nhất cho kỳ nghỉ của bạn.";
  const roomCountAvailable = roomType?.room_count ?? (availabilityItem ? 1 : 1);
  const mainImage =
    roomType?.image || availabilityItem?.image || fallbackGallery[0];
  const images = [mainImage, fallbackGallery[1], fallbackGallery[2]];

  const totalPrice = price * quantity;

  const handleQuickBook = () => {
    onOpenChange(false);
    const targetRoomTypeId = roomType?.id ?? availabilityItem?.loai_phong_id ?? 1;
    addItem({
      phong_id: targetRoomTypeId,
      so_phong: availabilityItem?.so_phong || String(100 + targetRoomTypeId),
      ten_loai: title,
      don_gia: price,
      suc_chua: 2,
      image: mainImage,
      mo_ta: description,
    });
    router.push("/cart");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl bg-background/95 backdrop-blur-2xl border border-white/20 p-0 overflow-hidden shadow-2xl sm:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col">
        {/* Main Image Header Gallery */}
        <div className="relative h-64 sm:h-72 w-full bg-muted shrink-0">
          <Image
            src={images[selectedImageIdx]}
            alt={title}
            fill
            className="object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-primary-foreground shadow-md">
              <Sparkles className="size-3.5 fill-amber-400 text-amber-400" />
              RESORT 5 SAO
            </span>
            {availabilityItem && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md">
                <DoorOpen className="size-3.5" />
                Mã phòng {availabilityItem.so_phong}
              </span>
            )}
          </div>

          {/* Thumbnail Selector Bar */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {title}
              </h2>
              <p className="text-xs text-gray-200 drop-shadow">
                Còn <span className="text-amber-400 font-bold">{roomCountAvailable}</span> phòng khả dụng
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative size-12 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImageIdx
                      ? "border-amber-400 scale-105 shadow-md"
                      : "border-white/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Price & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Giá niêm yết theo đêm
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-primary">
                  {formatVnd(price)}
                </span>
                <span className="text-xs text-muted-foreground">/ đêm</span>
              </div>
            </div>

            {/* Quantity Stepper [1-N] */}
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-2xl border border-border/60">
              <span className="text-xs font-bold text-foreground pl-2">Số phòng:</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="size-8 rounded-xl"
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-8 text-center font-bold text-sm text-foreground">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.min(roomCountAvailable, q + 1))}
                  disabled={quantity >= roomCountAvailable}
                  className="size-8 rounded-xl"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Mô tả không gian & dịch vụ
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Tiện nghi & Dịch vụ đi kèm
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <Users className="size-4 text-primary" />
                <span>Tối đa 2 Người lớn</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <Maximize2 className="size-4 text-primary" />
                <span>Diện tích 45 m²</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <Wifi className="size-4 text-primary" />
                <span>Wifi 5G tốc độ cao</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <Tv className="size-4 text-primary" />
                <span>Smart TV 4K 55 inch</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <Coffee className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Miễn phí bữa sáng</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-2.5 border border-border/40">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Hủy phòng linh hoạt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t bg-muted/30 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="block text-[11px] text-muted-foreground uppercase font-semibold">
              Tổng tiền ({quantity} phòng)
            </span>
            <span className="text-xl font-extrabold text-primary">
              {formatVnd(totalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Đóng
            </Button>
            <Button
              type="button"
              onClick={handleQuickBook}
              className="rounded-xl text-xs font-bold px-5 shadow-md shadow-primary/20"
            >
              ĐẶT PHÒNG NGAY <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
