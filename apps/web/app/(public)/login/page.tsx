"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserPlus,
} from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserProfile } from "@/lib/session";
import { cn } from "@/lib/utils";

// Danh sách slide ảnh resort 5 sao thượng hạng
const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85",
    tagline: "KHÁCH SẠN & RESORT THƯỢNG HẠNG",
    title: "Kỳ nghỉ mơ ước bắt đầu từ đây.",
    desc: "Tận hưởng không gian nghỉ dưỡng tinh tế, tiện nghi 5 sao và ưu đãi độc quyền dành riêng cho thành viên.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85",
    tagline: "DỊCH VỤ LƯU TRÚ TẬN TÂM",
    title: "Trải nghiệm không gian sống thượng lưu.",
    desc: "Hệ thống đặt phòng thông minh tự động lựa chọn những hạng phòng cao cấp phù hợp nhất cho kỳ nghỉ của bạn.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85",
    tagline: "ĐẶT PHÒNG NHANH CHÓNG",
    title: "Bảo mật 100% & Hủy phòng linh hoạt.",
    desc: "Quản lý các mã đơn DP-xxxx, theo dõi ngày nhận phòng/trả phòng và gửi yêu cầu hoàn tiền chỉ với 1 chạm.",
  },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-white/70">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUserSession();
  const redirectTo = searchParams.get("redirect") ?? "/account/bookings";
  const defaultTab =
    searchParams.get("tab") === "register" ? "register" : "login";

  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form Đăng nhập
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form Đăng ký
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Tự động chuyển Slide mỗi 4.5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const { access_token } = await apiFetch<{ access_token: string }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        },
      );
      const user = await apiFetch<UserProfile>("/api/v1/auth/me", {
        token: access_token,
      });
      login({ token: access_token, user });
      router.push(redirectTo);
    } catch (error) {
      setLoginError(
        error instanceof ApiError
          ? error.message
          : "Email hoặc mật khẩu không chính xác",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegError(null);
    setIsRegistering(true);
    try {
      const { access_token } = await apiFetch<{ access_token: string }>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            full_name: regFullName,
            email: regEmail,
            password: regPassword,
            phone: regPhone || undefined,
          }),
        },
      );
      const user = await apiFetch<UserProfile>("/api/v1/auth/me", {
        token: access_token,
      });
      login({ token: access_token, user });
      router.push(redirectTo);
    } catch (error) {
      setRegError(
        error instanceof ApiError
          ? error.message
          : "Đăng ký thất bại. Email có thể đã được sử dụng.",
      );
    } finally {
      setIsRegistering(false);
    }
  }

  const slide = slides[currentSlide];

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
      {/* Background Image Tràn Màn Hình Tương Ứng Với Slide Hiện Tại */}
      {slides.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
          )}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority={index === 0}
            className="object-cover object-center scale-105 transition-transform duration-10000"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/70 backdrop-blur-[2px]" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col justify-center p-4 md:p-8">

        {/* Layout Split Screen: Cột Trái (Slideshow) + Cột Phải (Form Glassmorphism) */}
        <div className="grid w-full gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* CỘT BÊN TRÁI: Photo Slider Trình Chiếu Ảnh Resort & Đánh Giá */}
          <div className="hidden lg:flex flex-col justify-between space-y-8 pr-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-amber-300 border border-white/20 shadow-sm">
                <Sparkles className="size-3.5 text-amber-300" />
                {slide.tagline}
              </div>

              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md">
                {slide.title}
              </h2>

              <p className="text-sm leading-relaxed text-white/80 max-w-lg drop-shadow-sm">
                {slide.desc}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 stroke-none" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">4.9 / 5.0</span>
                <span className="text-xs text-white/70">
                  từ hơn 1,200+ đánh giá trải nghiệm thực tế
                </span>
              </div>
            </div>

            {/* Điều khiển Slide (Dots + Navigation Buttons) */}
            <div className="flex items-center gap-4 border-t border-white/15 pt-6">
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    )}
                    aria-label={`Chuyển tới slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="flex size-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white transition-all"
                  aria-label="Slide trước"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="flex size-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white transition-all"
                  aria-label="Slide tiếp theo"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CỘT BÊN PHẢI: Form Đăng Nhập / Đăng Ký Glassmorphism Không Khung Viền Thô */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Tab chuyển đổi Đăng nhập ↔ Đăng ký */}
              <div className="flex p-1 rounded-2xl bg-black/20 border border-white/15">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    activeTab === "login"
                      ? "bg-white text-black shadow-md"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <LogIn className="size-3.5" /> Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                    activeTab === "register"
                      ? "bg-white text-black shadow-md"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <UserPlus className="size-3.5" /> Đăng ký mới
                </button>
              </div>

              {/* Input Form Fields */}
              {activeTab === "login" ? (
                <form onSubmit={onLogin} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-white/90">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-white/90">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 backdrop-blur-md p-3 text-xs font-semibold text-rose-200">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoggingIn}
                    className="h-12 w-full rounded-2xl bg-white text-black font-extrabold text-base shadow-xl shadow-black/40 hover:bg-white/90 transition-all active:scale-[0.98]"
                  >
                    {isLoggingIn ? "Đang xử lý..." : "ĐĂNG NHẬP NGAY"}
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={onRegister} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name" className="text-xs font-semibold text-white/90">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg_email" className="text-xs font-semibold text-white/90">
                      Địa chỉ Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="reg_email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-white/90">
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0901234567"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg_password" className="text-xs font-semibold text-white/90">
                      Mật khẩu mới
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 size-4 text-white/60" />
                      <Input
                        id="reg_password"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="h-12 pl-11 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-md focus:border-white/50 focus:bg-white/15 focus:ring-0 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {regError && (
                    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 backdrop-blur-md p-3 text-xs font-semibold text-rose-200">
                      ⚠️ {regError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isRegistering}
                    className="h-12 w-full rounded-2xl bg-white text-black font-extrabold text-base shadow-xl shadow-black/40 hover:bg-white/90 transition-all active:scale-[0.98]"
                  >
                    {isRegistering ? "Đang tạo tài khoản..." : "ĐĂNG KÝ & ĐĂNG NHẬP"}
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bảo Mật Mờ Tinh Tế */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Bảo mật tuyệt đối 100% · Thông tin được mã hóa an toàn</span>
          </div>
          <p>© 2026 HotelBook Inc. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
