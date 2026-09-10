"use client";

import Link from "next/link";
import { Lock, Unlock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

type StaffRowActionsProps = {
  id: number;
  status: string;
  onToggleStatus: (id: number, currentStatus: string) => void;
};

export function StaffRowActions({ id, status, onToggleStatus }: StaffRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/staff/${id}/edit`}>
          <Pencil className="mr-1 size-4" />
          Sửa
        </Link>
      </Button>
      <Button className="w-[100px]" variant="outline" size="sm" onClick={() => onToggleStatus(id, status)}>
        {status === "ACTIVE" ? (
          <><Lock className="mr-1 size-4" /> Khóa</>
        ) : (
          <><Unlock className="mr-1 size-4" /> Mở khóa</>
        )}
      </Button>
    </div>
  );
}
