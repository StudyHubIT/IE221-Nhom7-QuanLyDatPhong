"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";

type RoomTypeRowActionsProps = { id: number; name: string; token: string; onDeleted: () => void };

export function RoomTypeRowActions({ id, name, token, onDeleted }: RoomTypeRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function deleteRoomType() {
    setIsDeleting(true); setError(null);
    try { await apiFetch<void>(`/api/v1/admin/room-types/${id}`, { method: "DELETE", token }); onDeleted(); }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Không thể xóa loại phòng."); }
    finally { setIsDeleting(false); }
  }
  return <div className="flex justify-end gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/admin/room-types/${id}/edit`}><Pencil />Sửa</Link></Button><ConfirmDeleteDialog title="Xóa loại phòng?" description={`Xóa ${name}? Thao tác này không hoàn tác.`} onConfirm={deleteRoomType} isSubmitting={isDeleting} error={error} /></div>;
}
