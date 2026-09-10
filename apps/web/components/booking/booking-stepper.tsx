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
  return (
    <div className="w-full py-4">
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 md:gap-6">
        {steps.map((item) => {
          const Icon = item.icon;
          const isCompleted = item.step < currentStep;
          const isActive = item.step === currentStep;

          return (
            <div
              key={item.step}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border p-3 text-center transition-all duration-300 md:p-4",
                isActive &&
                  "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/20",
                isCompleted && "border-emerald-500/30 bg-emerald-500/5",
                !isActive && !isCompleted && "border-border/60 bg-card/40 opacity-70"
              )}
            >
              <div
                className={cn(
                  "mb-2 flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition-all md:size-11",
                  isCompleted &&
                    "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20",
                  isActive &&
                    "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                  !isActive &&
                    !isCompleted &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-5 stroke-[2.5]" />
                ) : (
                  <Icon className="size-5 stroke-[1.75]" />
                )}
              </div>
              <div className="space-y-0.5">
                <span
                  className={cn(
                    "block text-xs font-semibold uppercase tracking-wider md:text-sm",
                    isActive && "text-primary font-bold",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {item.title}
                </span>
                <span className="hidden text-xs text-muted-foreground md:block">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
