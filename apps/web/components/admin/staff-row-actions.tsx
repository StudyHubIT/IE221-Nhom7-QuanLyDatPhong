"use client";

import Link from "next/link";
import { Lock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

type StaffRowActionsProps = {
  id: number;
};

export function StaffRowActions({ id }: StaffRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/admin/staff/${id}/edit`}>
          <Pencil />
          Sửa
        </Link>
      </Button>
      <Button variant="outline" size="sm">
        <Lock />
        Khóa
      </Button>
    </div>
  );
}
