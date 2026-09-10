"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star } from "lucide-react";

import { cn } from "@/lib/utils";

const roomHeroSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85",
    tagline: "RESORT 5 SAO CAO CẤP",
    title: "Khám Phá Phân Hạng Phòng Sang Trọng",
    desc: "Tận hưởng không gian lưu trúc tinh tế, tiện nghi 5 sao và tầm nhìn biển tuyệt đẹp cho kỳ nghỉ của bạn.",
    highlight: "Ocean View Suite",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=85",
    tagline: "VILLA HỒ BƠI RIÊNG TƯ",
    title: "Biệt Thự Nghỉ Dưỡng Thượng Lưu",
    desc: "Không gian riêng biệt với hồ bơi vô cực, hồ Jacuzzi và dịch vụ phục vụ tận phòng 24/7.",
    highlight: "Pool Villa Signature",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1920&q=85",
    tagline: "GARDEN BUNGALOW YÊN BÌNH",
    title: "Hòa Mình Cùng Thiên Nhiên Xanh Mát",
    desc: "Thiết kế mộc mạc tinh tế, nằm giữa khuôn viên bãi cỏ dừa mát rượi và hương hoa bách thảo.",
    highlight: "Garden Bungalow Deluxe",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=85",
    tagline: "PENTHOUSE VIP ĐẲNG CẤP",
    title: "Tầm Nhìn Toàn Cảnh Panorama Vô Cực",
    desc: "Căn hộ Penthouse áp mái đỉnh cao với nội thất nhập khẩu và đặc quyền VIP Lounge cao cấp.",
    highlight: "Presidential Penthouse",
  },
];

export function RoomsHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % roomHeroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % roomHeroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + roomHeroSlides.length) % roomHeroSlides.length);
  };

  return (
    <section className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] w-full overflow-hidden border-b border-border/40 bg-black">
      {/* Background Resort Image Slideshow - Hardware Accelerated GPU Smooth Transition */}
      {roomHeroSlides.map((slide, idx) => (
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
          {/* Multi-layer Gradient Overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
        </div>
      ))}

      <div className="relative z-20 mx-auto flex h-full min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] max-w-[1600px] items-center justify-between px-4 py-8 sm:px-8 lg:px-12 text-white">
        {/* Left Side typography & details with smooth cross-fade animation */}
        <div key={currentSlide} className="space-y-4 max-w-2xl animate-in fade-in-50 duration-500">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
            <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
            <span>{roomHeroSlides[currentSlide].tagline}</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight drop-shadow-md">
            {roomHeroSlides[currentSlide].title}
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-gray-200 leading-relaxed drop-shadow">
            {roomHeroSlides[currentSlide].desc}
          </p>

          {/* Badges & Rating */}
          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/15">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">5.0 / 5.0</span>
              <span className="text-gray-300 text-[11px]">(500+ Đánh giá)</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/15">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span className="font-semibold text-white">Cam kết phòng trống thực</span>
            </div>
          </div>

          {/* Slide Nav Buttons & Dots */}
          <div className="pt-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Slide trước"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Slide sau"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {roomHeroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Chuyển đến slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentSlide
                      ? "w-7 bg-amber-400 shadow-md"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Thumbnail Cards (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-3 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300 text-right">
            Bộ sưu tập Resort
          </p>
          <div className="grid grid-cols-2 gap-3 w-[340px]">
            {roomHeroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "relative h-20 overflow-hidden rounded-2xl border transition-all text-left group p-2 flex flex-col justify-end transform-gpu",
                  idx === currentSlide
                    ? "border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-102"
                    : "border-white/20 opacity-70 hover:opacity-100 hover:border-white/50"
                )}
              >
                <Image
                  src={slide.image}
                  alt={slide.highlight}
                  fill
                  className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <span className="relative z-10 text-[10px] font-extrabold text-white truncate drop-shadow">
                  {slide.highlight}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
