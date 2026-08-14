"use client";

import Link from "next/link";
import { useState } from "react";

import { CartSummary } from "@/components/booking/cart-summary";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cartItems, defaultStay } from "@/lib/mock-data";
import { nightCount } from "@/lib/format";
import { cn } from "@/lib/utils";

const methods = [
  {
    value: "BANKING",
    title: "Chuyển khoản",
    description: "Giả lập thanh toán qua ngân hàng",
  },
  {
    value: "CASH",
    title: "Tiền mặt",
    description: "Thanh toán khi nhận phòng",
  },
];

export default function CheckoutPage() {
  const [method, setMethod] = useState("BANKING");
  const nights = nightCount(defaultStay.checkIn, defaultStay.checkOut);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/cart" className="hover:text-foreground">
          Giỏ đặt phòng
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Thanh toán</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">Thanh toán</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn phương thức thanh toán (giả lập, không qua cổng thanh toán
              thật).
            </p>
          </div>
          <RadioGroup value={method} onValueChange={setMethod}>
            {methods.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                  method === item.value && "border-primary bg-muted/40",
                )}
              >
                <RadioGroupItem value={item.value} className="mt-0.5" />
                <span>
                  <span className="block font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <Label className="sr-only">{item.title}</Label>
              </label>
            ))}
          </RadioGroup>
        </div>

        <CartSummary
          title="Tóm tắt đơn đặt phòng"
          nights={nights}
          rooms={cartItems}
          actionHref="/checkout/success"
          actionLabel="Xác nhận thanh toán"
        />
      </section>
    </main>
  );
}
