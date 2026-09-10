"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronDown, LogOut, ShoppingBag, Sparkles, UserCheck } from "lucide-react";

import { useUserSession } from "@/components/auth/session-provider";
import { useCart } from "@/components/booking/cart-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/rooms", label: "Danh sách phòng" },
  { href: "/account/bookings", label: "Đặt phòng của tôi" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useUserSession();
  const { itemCount, isHydrated } = useCart();

  function onLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Thương Hiệu Luxury */}
        <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.01]">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30 transition-transform group-hover:rotate-3">
            <Building2 className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
              HotelBook
            </span>
          </div>
        </Link>

        {/* Thanh Navigation Pill Menu */}
        <nav className="hidden items-center gap-1.5 md:flex bg-muted/40 p-1 rounded-full border border-border/40 backdrop-blur-md">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300",
                  active
                    ? "bg-background text-primary font-extrabold shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Cụm Nút Giỏ Hàng & Tài Khoản */}
        <div className="flex items-center gap-3">
          {/* Nút Giỏ Hàng Glassmorphism với Badge Đêm Số Nổi Bật */}
          <Link
            href="/cart"
            className="relative flex size-10 items-center justify-center rounded-full border border-border/80 bg-card/60 text-foreground transition-all hover:bg-muted hover:scale-105 active:scale-95 shadow-xs"
            title="Giỏ phòng đã chọn"
          >
            <ShoppingBag className="size-4 text-foreground" />
            {isHydrated && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-black text-primary-foreground shadow-md shadow-primary/40 ring-2 ring-background animate-in zoom-in-75">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Profile / Button Đăng nhập */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 h-10 font-bold border-border/80 shadow-xs hover:border-primary/50 transition-all">
                  <UserCheck className="size-4 text-primary" />
                  <span className="max-w-[120px] truncate text-xs">
                    {session.user.full_name ?? session.user.email}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl bg-card/95 backdrop-blur-xl border-border/60">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Tài khoản của bạn
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 font-medium cursor-pointer">
                  <Link href="/account/bookings" className="flex items-center gap-2 text-xs">
                    <Sparkles className="size-4 text-primary" />
                    <span>Đặt phòng của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 font-medium cursor-pointer">
                  <Link href="/cart" className="flex items-center gap-2 text-xs">
                    <ShoppingBag className="size-4 text-primary" />
                    <span>Giỏ đặt phòng ({itemCount})</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={onLogout}
                  className="rounded-xl px-3 py-2 font-medium text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="h-10 rounded-full px-5 font-bold text-xs shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
