"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { roomCountByType } from "@/lib/mock-data";

type RoomTypeRowActionsProps = {
  id: number;
  name: string;
};

export function RoomTypeRowActions({ id, name }: RoomTypeRowActionsProps) {
  const roomCount = roomCountByType(id);
  const blocked = roomCount > 0;

  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/room-types/${id}/edit`}>
          <Pencil />
          Sửa
        </Link>
      </Button>
      <ConfirmDeleteDialog
        title="Xóa loại phòng?"
        blocked={blocked}
        description={
          blocked
            ? `Không thể xóa ${name} vì đang có ${roomCount} phòng tham chiếu. Hãy chuyển hoặc xóa các phòng thuộc loại này trước.`
            : `Xóa ${name}? Thao tác này không hoàn tác.`
        }
      />
    </div>
  );
}
