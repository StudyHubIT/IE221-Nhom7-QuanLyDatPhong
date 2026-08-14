"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bookings, bookingTotal } from "@/lib/mock-data";
import { formatDate, formatDateRange, formatVnd } from "@/lib/format";
import type { BookingStatus } from "@/lib/mock-data";

const tabs: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "CHECKED_IN", label: "Đã nhận phòng" },
  { value: "CHECKED_OUT", label: "Đã trả phòng" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function MyBookingsPage() {
  const [status, setStatus] = useState<(typeof tabs)[number]["value"]>("all");
  const rows = useMemo(
    () =>
      status === "all"
        ? bookings
        : bookings.filter((booking) => booking.trang_thai === status),
    [status],
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold">Đặt phòng của tôi</h1>
      <Tabs
        value={status}
        onValueChange={(value) =>
          setStatus(value as (typeof tabs)[number]["value"])
        }
      >
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Ngày ở</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{formatDate(booking.created_at)}</TableCell>
                <TableCell>
                  {formatDateRange(booking.check_in, booking.check_out)}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.trang_thai} />
                </TableCell>
                <TableCell>{formatVnd(bookingTotal(booking))}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/bookings/${booking.id}`}>Xem</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
