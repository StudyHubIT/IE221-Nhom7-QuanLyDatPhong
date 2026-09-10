"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star } from "lucide-react";

import { RoomSearchForm } from "@/components/booking/room-search-form";
import type { RoomType } from "@/lib/room-api-types";
import { cn } from "@/lib/utils";

const heroSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85",
    tagline: "RESORT 5 SAO CAO CẤP",
    title: "Trải Nghiệm Lưu Trú Thượng Lưu & Hoàn Hảo",
    desc: "Khám phá không gian sang trọng, hòa mình vào thiên nhiên với dịch vụ tận tâm và ưu đãi độc quyền dành riêng cho bạn.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1920&q=85",
    tagline: "KHÔNG GIAN NGHỈ DƯỠNG ĐẮC ĐỊA",
    title: "Tận Hưởng Kỳ Nghỉ Tuyệt Vời Bên Gia Đình",
    desc: "Hệ thống tự động đề xuất những hạng phòng cao cấp hàng đầu với tầm nhìn biển tuyệt đẹp và dịch vụ phòng 24/7.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=85",
    tagline: "ĐẶT PHÒNG THÔNG MINH & MINH BẠCH",
    title: "Xác Nhận Tức Thì & Bảo Mật Tuyệt Đối",
    desc: "Dễ dàng tra cứu phòng trống theo thời gian thực, quản lý đơn đặt phòng và linh hoạt yêu cầu hủy/hoàn tiền.",
  },
];

type HomeHeroProps = {
  roomTypes: RoomType[];
};

export function HomeHero({ roomTypes }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex items-center justify-center py-12 lg:py-16 bg-black">
      {/* Background Slideshow Images - GPU Hardware Accelerated */}
      {heroSlides.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transform-gpu will-change-opacity transition-opacity duration-700 ease-in-out pointer-events-none",
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            className="object-cover object-center"
          />
          {/* Multi-layer Dark Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/50" />
        </div>
      ))}

      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Content Side */}
          <div key={currentSlide} className="space-y-6 lg:col-span-6 text-white animate-in fade-in-50 duration-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
              <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
              <span>{heroSlides[currentSlide].tagline}</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight drop-shadow-md">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="max-w-xl text-base text-gray-200 leading-relaxed drop-shadow">
              {heroSlides[currentSlide].desc}
            </p>

            {/* Feature Badges & Rating */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-200">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/15">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-white">5.0 / 5.0</span>
                <span className="text-gray-300">(500+ Đánh giá)</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3.5 py-2 border border-white/15">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span className="font-semibold text-white">Xác nhận đặt phòng 100%</span>
              </div>
            </div>

            {/* Carousel Navigation Buttons & Dots */}
            <div className="pt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === currentSlide
                        ? "w-8 bg-amber-400 shadow-md"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Glassmorphism Search Form Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-white/20 bg-background/85 p-6 md:p-8 backdrop-blur-xl shadow-2xl transition-all dark:border-white/10 dark:bg-card/85">
              <div className="mb-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Tìm kiếm nhanh chóng
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
                    GIÁ TỐT NHẤT
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  Tìm phòng nghỉ của bạn
                </h2>
                <p className="text-xs text-muted-foreground">
                  Chọn ngày lưu trú & loại phòng để xem số lượng phòng khả dụng tức thì.
                </p>
              </div>

              <RoomSearchForm roomTypes={roomTypes} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
