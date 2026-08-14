import Link from "next/link";
import { Trash2 } from "lucide-react";

import { CartSummary } from "@/components/booking/cart-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cartItems, defaultStay } from "@/lib/mock-data";
import { formatVnd, nightCount } from "@/lib/format";

export default function CartPage() {
  const nights = nightCount(defaultStay.checkIn, defaultStay.checkOut);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Giỏ đặt phòng</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Giỏ đặt phòng</h1>
          <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="grid gap-1.5">
              <Label htmlFor="cart-check-in">Ngày nhận phòng</Label>
              <Input
                id="cart-check-in"
                type="date"
                defaultValue={defaultStay.checkIn}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cart-check-out">Ngày trả phòng</Label>
              <Input
                id="cart-check-out"
                type="date"
                defaultValue={defaultStay.checkOut}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline">Áp dụng</Button>
            </div>
          </div>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.so_phong}>
                    <TableCell>{item.so_phong}</TableCell>
                    <TableCell>{item.ten_loai}</TableCell>
                    <TableCell>{formatVnd(item.don_gia)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-sm" aria-label="Xóa">
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <CartSummary
          nights={nights}
          rooms={cartItems}
          hint="Đăng nhập để hoàn tất đặt phòng"
          actionHref="/login"
          actionLabel="Tiếp tục"
        />
      </section>
    </main>
  );
}
