"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  DoorOpen,
  Hotel,
  Maximize2,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Wifi,
} from "lucide-react";

import { BookingStepper } from "@/components/booking/booking-stepper";
import { useUserSession } from "@/components/auth/session-provider";
import { useCart } from "@/components/booking/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatVnd, nightCount } from "@/lib/format";
import { defaultStay } from "@/lib/room-api-types";

export default function CartPage() {
  const { session } = useUserSession();
  const { items, removeItem } = useCart();
  const [checkIn, setCheckIn] = useState(defaultStay.checkIn);
  const [checkOut, setCheckOut] = useState(defaultStay.checkOut);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const isValidDates = checkIn < checkOut;
  const nights = isValidDates ? nightCount(checkIn, checkOut) : 0;
  const rawSubtotal = items.reduce((acc, item) => acc + item.don_gia, 0) * nights;
  const vatTax = Math.round(rawSubtotal * 0.1);
  const total = Math.max(0, rawSubtotal + vatTax - appliedDiscount);

  const handleRemove = (phong_id: number) => {
    removeItem(phong_id);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (promoCode.trim().toUpperCase() === "RESORT10") {
      const discount = Math.round(rawSubtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoSuccess("Áp dụng mã giảm giá 10% thành công!");
    } else if (promoCode.trim().toUpperCase() === "VIP500K") {
      setAppliedDiscount(500000);
      setPromoSuccess("Áp dụng voucher VIP 500.000đ thành công!");
    } else {
      setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stepper Tiến trình Bước 1 */}
      <BookingStepper currentStep={1} />

      {/* Grid Bố cục chính Trang Giỏ Hàng */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Card Thời gian lưu trú */}
          <Card className="border-border/60 shadow-lg bg-card/85 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  <h2 className="font-bold text-foreground text-base">
                    Thời gian lưu trú dự kiến
                  </h2>
                </div>
                {isValidDates && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                    <Clock className="size-3.5 text-primary" />
                    {nights} đêm nghỉ dưỡng
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cart-check-in" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ngày nhận phòng (Check-in)
                  </Label>
                  <Input
                    id="cart-check-in"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-11 rounded-2xl font-medium text-sm border-border/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cart-check-out" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ngày trả phòng (Check-out)
                  </Label>
                  <Input
                    id="cart-check-out"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-11 rounded-2xl font-medium text-sm border-border/80"
                  />
                </div>
              </div>

              {!isValidDates && (
                <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danh sách phòng đã chọn trong giỏ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Danh sách phòng trong giỏ ({items.length})
              </h2>
              {items.length > 0 && (
                <Button asChild variant="outline" size="sm" className="rounded-xl border-border/80 text-xs font-semibold">
                  <Link href="/rooms">
                    <Plus className="mr-1 size-3.5" /> Thêm phòng khác
                  </Link>
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <Card className="border-dashed py-16 text-center rounded-3xl">
                <CardContent className="space-y-4">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Hotel className="size-10 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Giỏ đặt phòng của bạn đang trống</h3>
                    <p className="text-xs text-muted-foreground">
                      Hãy chọn cho mình một không gian nghỉ dưỡng lý tưởng để tiếp tục đơn đặt.
                    </p>
                  </div>
                  <Button asChild className="rounded-2xl px-6 font-bold text-xs shadow-md">
                    <Link href="/rooms">Khám phá danh sách phòng</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              items.map((room) => (
                <Card
                  key={room.phong_id}
                  className="group overflow-hidden border-border/60 shadow-lg bg-card/85 backdrop-blur-md rounded-3xl transition-all hover:border-primary/40"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Room Thumbnail Image */}
                      <div className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={
                            room.image ||
                            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={room.ten_loai}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
                            <DoorOpen className="size-3.5" />
                            Phòng {room.so_phong}
                          </span>
                        </div>
                      </div>

                      {/* Room Content */}
                      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {room.ten_loai}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemove(room.phong_id)}
                              className="size-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Xóa khỏi giỏ"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {room.mo_ta}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Users className="size-3.5 text-primary" /> {room.suc_chua} Khách
                            </span>
                            <span className="flex items-center gap-1">
                              <Wifi className="size-3.5 text-primary" /> Wifi 5G
                            </span>
                            <span className="flex items-center gap-1">
                              <Maximize2 className="size-3.5 text-primary" /> 35 m²
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            {nights} đêm × {formatVnd(room.don_gia)}
                          </span>
                          <span className="text-lg font-black text-primary">
                            {formatVnd(room.don_gia * nights)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cột Tóm tắt chi phí & Mã giảm giá */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-border/80 shadow-xl bg-card/90 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-extrabold text-foreground text-base">Đơn của bạn</h2>
              </div>

              {/* Form mã giảm giá / Voucher */}
              <form onSubmit={handleApplyPromo} className="space-y-2 border-b pb-4">
                <Label htmlFor="promo-input" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="size-3.5 text-primary" /> Mã ưu đãi / Voucher
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo-input"
                    placeholder="VD: RESORT10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="h-10 rounded-xl font-mono text-xs uppercase"
                  />
                  <Button type="submit" variant="outline" className="h-10 rounded-xl text-xs font-bold shrink-0">
                    Áp dụng
                  </Button>
                </div>
                {promoError && <p className="text-[11px] font-semibold text-destructive">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{promoSuccess}</p>}
              </form>

              {/* Chi tiết chi phí */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tiền phòng ({items.length} phòng × {nights} đêm)</span>
                  <span className="font-semibold text-foreground">{formatVnd(rawSubtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Thuế VAT & Phí dịch vụ (10%)</span>
                  <span className="font-semibold text-foreground">{formatVnd(vatTax)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Giảm giá Voucher</span>
                    <span>-{formatVnd(appliedDiscount)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-foreground">Tổng thanh toán</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">
                        {formatVnd(total)}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        (Đã bao gồm toàn bộ thuế & phí)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {!session && (
                <div className="rounded-2xl bg-amber-500/10 p-3.5 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span>⚠️ Vui lòng đăng nhập để lưu trữ đơn hàng & tích điểm thành viên.</span>
                </div>
              )}

              <Button
                asChild={isValidDates && items.length > 0}
                disabled={!isValidDates || items.length === 0}
                className="h-12 w-full rounded-2xl text-sm font-bold shadow-lg shadow-primary/25 transition-all"
              >
                {isValidDates && items.length > 0 ? (
                  <Link href={session ? "/checkout" : "/login?redirect=/checkout"}>
                    {session ? "TIẾN HÀNH THANH TOÁN" : "ĐĂNG NHẬP ĐỂ THANH TOÁN"}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                ) : (
                  <span>TIẾN HÀNH THANH TOÁN</span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Hủy phòng miễn phí trước 24 giờ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
