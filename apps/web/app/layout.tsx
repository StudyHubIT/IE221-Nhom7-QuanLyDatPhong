import type { Metadata } from "next";
import { Inter } from "next/font/google";

import {
  AdminSessionProvider,
  UserSessionProvider,
} from "@/components/auth/session-provider";
import { cn } from "@/lib/utils";

import "./globals.css";

import { CartProvider } from "@/components/booking/cart-provider";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HotelBook",
  description: "Hệ thống quản lý đặt phòng khách sạn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen antialiased">
        <UserSessionProvider>
          <AdminSessionProvider>
            <CartProvider>{children}</CartProvider>
          </AdminSessionProvider>
        </UserSessionProvider>
      </body>
    </html>
  );
}
