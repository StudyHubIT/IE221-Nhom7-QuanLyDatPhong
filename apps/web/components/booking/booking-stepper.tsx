"use client";

import { Check, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepperProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  {
    step: 1,
    title: "Giỏ phòng & Lịch lưu trú",
    subtitle: "Chọn phòng và ngày lưu trú",
    icon: ShoppingBag,
  },
  {
    step: 2,
    title: "Thanh toán & Xác nhận",
    subtitle: "Chọn phương thức thanh toán",
    icon: CreditCard,
  },
  {
    step: 3,
    title: "Hoàn tất đặt phòng",
    subtitle: "Nhận mã vé & thông tin đơn",
    icon: Sparkles,
  },
];

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const progressPercent = currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%";

  return (
    <div className="w-full py-4">
      <div className="relative mx-auto max-w-3xl px-4">
        {/* Đường ray kết nối (Connected Progress Track) */}
        <div className="absolute top-5 left-12 right-12 hidden h-0.5 bg-border/60 sm:block" />
        <div
          className="absolute top-5 left-12 hidden h-0.5 bg-gradient-to-r from-emerald-500 via-primary to-primary transition-all duration-500 sm:block"
          style={{ width: `calc(${progressPercent} - 3rem)` }}
        />

        <div className="relative z-10 flex items-start justify-between">
          {steps.map((item) => {
            const Icon = item.icon;
            const isCompleted = item.step < currentStep;
            const isActive = item.step === currentStep;

            return (
              <div
                key={item.step}
                className="flex flex-1 flex-col items-center text-center sm:flex-initial"
              >
                {/* Step Node Circle */}
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted &&
                      "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-500/10",
                    isActive &&
                      "scale-110 bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                    !isActive &&
                      !isCompleted &&
                      "border-2 border-border/80 bg-card text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="size-4 stroke-[2]" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-2.5 space-y-0.5">
                  <span
                    className={cn(
                      "block text-xs font-bold tracking-tight md:text-sm",
                      isActive && "text-primary font-black",
                      isCompleted && "text-emerald-600 dark:text-emerald-400 font-bold",
                      !isActive && !isCompleted && "text-muted-foreground font-semibold"
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="hidden text-[11px] text-muted-foreground font-medium md:block">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
