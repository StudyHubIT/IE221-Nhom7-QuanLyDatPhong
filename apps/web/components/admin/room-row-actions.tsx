"use client";

import Link from "next/link";
import { Pencil, Wrench } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { isRoomInActiveBooking } from "@/lib/mock-data";

type RoomRowActionsProps = {
  id: number;
  soPhong: string;
};

export function RoomRowActions({ id, soPhong }: RoomRowActionsProps) {
  const blocked = isRoomInActiveBooking(soPhong);

  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/rooms/${id}/edit`}>
          <Pencil />
          Sửa
        </Link>
      </Button>
      <Button variant="outline" size="sm">
        <Wrench />
        Bảo trì
      </Button>
      <ConfirmDeleteDialog
        title={`Xóa phòng ${soPhong}?`}
        blocked={blocked}
        description={
          blocked
            ? `Phòng ${soPhong} đang gắn với đơn chưa hoàn tất nên không xóa được.`
            : "Nếu đủ điều kiện, thao tác này không hoàn tác."
        }
      />
    </div>
  );
}
