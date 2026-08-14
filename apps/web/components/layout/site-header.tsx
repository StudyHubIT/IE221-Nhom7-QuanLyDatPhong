"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown } from "lucide-react";

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
  { href: "/#loai-phong", label: "Loại phòng" },
  { href: "/account/bookings", label: "Đặt phòng của tôi" },
];

type SiteHeaderProps = {
  variant?: "guest" | "user";
};

export function SiteHeader({ variant }: SiteHeaderProps) {
  const pathname = usePathname();
  const resolvedVariant =
    variant ??
    (pathname.startsWith("/account") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout")
      ? "user"
      : "guest");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </span>
          HotelBook
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
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
                  "text-muted-foreground transition-colors hover:text-foreground",
                  active && "font-medium text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {resolvedVariant === "guest" ? (
          <Button asChild size="sm">
            <Link href="/login">Đăng nhập</Link>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                Nguyễn Văn A
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/account/bookings">Đặt phòng của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cart">Giỏ đặt phòng</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Đăng xuất</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
