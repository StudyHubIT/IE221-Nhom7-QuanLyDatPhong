"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  DoorOpen,
  Lock,
  MessageSquare,
  Phone,
  QrCode,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react";

import { BookingStepper } from "@/components/booking/booking-stepper";
import { useUserSession } from "@/components/auth/session-provider";
import { useCart } from "@/components/booking/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";
import { formatVnd, nightCount } from "@/lib/format";
import { defaultStay } from "@/lib/room-api-types";
import { cn } from "@/lib/utils";

const paymentMethods = [
  {
    value: "BANKING",
    title: "Chuyển khoản Ngân hàng / Mã QR (VietQR)",
    description: "Quét mã QR tự động xác nhận tức thì qua hệ thống ngân hàng 24/7",
    icon: QrCode,
    badge: "Khuyên dùng",
  },
  {
    value: "CARD",
    title: "Thẻ Tín Dụng / Ghi Nợ (Visa, Mastercard, JCB)",
    description: "Cổng thanh toán bảo mật quốc tế 256-bit SSL",
    icon: CreditCard,
    badge: "Quốc tế",
  },
  {
    value: "CASH",
    title: "Thanh toán Tiền mặt tại Khách sạn",
    description: "Thanh toán trực tiếp tại quầy lễ tân khi làm thủ tục nhận phòng",
    icon: Banknote,
    badge: "Tại khách sạn",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { session } = useUserSession();
  const { items: cartItems, clearCart } = useCart();
  const [method, setMethod] = useState("BANKING");
  const [fullName, setFullName] = useState(session?.user.full_name || "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = nightCount(defaultStay.checkIn, defaultStay.checkOut);
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.don_gia, 0) * nights;
  const vatTax = Math.round(rawSubtotal * 0.1);
  const total = rawSubtotal + vatTax;

  const handleCheckout = async () => {
    if (isLoading) return;

    if (!session) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0) {
      setError("Giỏ hàng của bạn đang trống, vui lòng chọn phòng trước khi thanh toán.");
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setError("Vui lòng điền đầy đủ Họ tên và Số điện thoại khách nhận phòng.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch<{ id: number }>("/api/v1/bookings", {
        method: "POST",
        token: session.token,
        body: JSON.stringify({
          check_in: defaultStay.checkIn,
          check_out: defaultStay.checkOut,
          phong_ids: cartItems.map((c) => c.phong_id),
          method: method,
          ho_ten: fullName,
          so_dien_thoai: phone,
          ghi_chu: note,
        }),
      });

      clearCart();
      router.push(`/checkout/success?id=${res.id}`);
    } catch (err) {
      setIsLoading(false);
      setError(
        err instanceof ApiError
          ? err.message
          : "Có lỗi xảy ra khi xử lý đơn đặt phòng."
      );
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stepper Tiến trình Bước 2 */}
      <BookingStepper currentStep={2} />

      {/* Grid Bố cục chính Trang Thanh Toán */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Quay lại giỏ hàng */}
          <Link
            href="/cart"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 size-4" /> Quay lại xem lại giỏ phòng
          </Link>

          {/* Form thông tin khách hàng lưu trú */}
          <Card className="border-border/60 shadow-lg bg-card/85 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-5 text-primary" />
                  <h2 className="font-extrabold text-foreground text-base">
                    Thông tin khách hàng nhận phòng
                  </h2>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  * Yêu cầu bắt buộc
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <User className="size-3.5 text-primary" /> Họ và tên khách nhận phòng
                  </Label>
                  <Input
                    id="checkout-name"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 rounded-2xl font-medium text-sm border-border/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3.5 text-primary" /> Số điện thoại liên hệ
                  </Label>
                  <Input
                    id="checkout-phone"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-2xl font-medium text-sm border-border/80"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="checkout-note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="size-3.5 text-primary" /> Yêu cầu đặc biệt (Không bắt buộc)
                </Label>
                <Textarea
                  id="checkout-note"
                  placeholder="Ví dụ: Nhận phòng sớm, phòng tầng cao, giường King lớn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-2xl font-medium text-xs border-border/80 resize-none h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chọn phương thức thanh toán */}
          <Card className="border-border/60 shadow-lg bg-card/85 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" />
                  <h2 className="font-extrabold text-foreground text-base">
                    Phương thức thanh toán
                  </h2>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Lock className="size-3.5" />
                  Bảo mật SSL 256-bit
                </span>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <span className="font-bold">Không thể hoàn tất đơn đặt: </span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
                {paymentMethods.map((item) => {
                  const Icon = item.icon;
                  const isSelected = method === item.value;

                  return (
                    <label
                      key={item.value}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                          : "border-border/60 hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <RadioGroupItem value={item.value} className="mt-1" />
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-foreground text-sm">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>

                        {/* QR Instructions Preview Box */}
                        {isSelected && item.value === "BANKING" && (
                          <div className="mt-3 p-3.5 rounded-xl bg-background border border-primary/20 space-y-2 text-xs">
                            <span className="font-bold text-primary flex items-center gap-1.5">
                              <QrCode className="size-4" /> Hệ thống VietQR tự động
                            </span>
                            <p className="text-muted-foreground leading-relaxed">
                              Sau khi nhấn "Xác nhận & Đặt phòng", mã QR thanh toán sẽ tự động hiển thị với số tiền và nội dung chuyển khoản chuẩn xác.
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Cột Đơn của bạn & Thanh toán */}
        <div className="space-y-6">
          <Card className="sticky top-20 border-border/80 shadow-xl bg-card/90 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <Building2 className="size-5 text-primary" />
                <h2 className="font-extrabold text-foreground text-base">Đơn của bạn</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">Lưu trú {nights} đêm</span>
                  </div>
                  <span className="font-bold text-primary">
                    {defaultStay.checkIn} đến {defaultStay.checkOut}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-foreground block">Danh sách phòng chọn:</span>
                  {cartItems.map((room) => (
                    <div
                      key={room.so_phong}
                      className="flex items-center justify-between border-b border-border/40 pb-2.5 text-muted-foreground"
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <DoorOpen className="size-3.5 text-primary" />
                        Phòng {room.so_phong} ({room.ten_loai})
                      </span>
                      <span className="font-bold text-primary">{formatVnd(room.don_gia)}/đêm</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tiền phòng gốc</span>
                    <span className="font-semibold text-foreground">{formatVnd(rawSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Thuế VAT & Phí phục vụ</span>
                    <span className="font-semibold text-foreground">{formatVnd(vatTax)}</span>
                  </div>

                  <div className="border-t pt-3 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-foreground">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-primary">
                      {formatVnd(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-sm font-extrabold shadow-lg shadow-primary/25 transition-all"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Đang khởi tạo đơn đặt...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="size-5" />
                    XÁC NHẬN & ĐẶT PHÒNG
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cam kết không phát sinh phụ phí ẩn</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
