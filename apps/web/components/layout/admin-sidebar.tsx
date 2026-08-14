"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BedDouble,
  Building2,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  Layers,
  Shield,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Đặt phòng", icon: CalendarCheck },
  { href: "/admin/rooms", label: "Phòng", icon: BedDouble },
  { href: "/admin/room-types", label: "Loại phòng", icon: Layers },
  { href: "/admin/payments", label: "Thanh toán", icon: CreditCard },
  { href: "/admin/refunds", label: "Hoàn tiền", icon: Banknote },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/staff", label: "Tài khoản admin", icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-accent">
          <Building2 className="size-4" />
        </span>
        <span className="font-semibold">HotelBook Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href !== "#" &&
            (item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-sidebar-border px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
          SA
        </span>
        <span className="text-sm">Super Admin</span>
      </div>
    </aside>
  );
}
