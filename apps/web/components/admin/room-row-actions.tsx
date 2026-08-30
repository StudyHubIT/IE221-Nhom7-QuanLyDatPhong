"use client";

import Link from "next/link";
import { Pencil, Wrench } from "lucide-react";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api";

type RoomRowActionsProps = { id: number; soPhong: string; token: string; onChanged: () => void };

export function RoomRowActions({ id, soPhong, token, onChanged }: RoomRowActionsProps) {
  const [isMaintaining, setIsMaintaining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function setMaintenance() {
    setIsMaintaining(true); setError(null);
    try { await apiFetch(`/api/v1/admin/rooms/${id}/status`, { method: "PATCH", token, body: JSON.stringify({ status: "MAINTENANCE" }) }); onChanged(); }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Không thể chuyển sang bảo trì."); }
    finally { setIsMaintaining(false); }
  }
  async function deleteRoom() {
    setIsDeleting(true); setError(null);
    try { await apiFetch<void>(`/api/v1/admin/rooms/${id}`, { method: "DELETE", token }); onChanged(); }
    catch (requestError) { setError(requestError instanceof ApiError ? requestError.message : "Không thể xóa phòng."); }
    finally { setIsDeleting(false); }
  }
  return <div className="space-y-1"><div className="flex justify-end gap-2"><Button asChild variant="ghost" size="sm"><Link href={`/admin/rooms/${id}/edit`}><Pencil />Sửa</Link></Button><Button variant="outline" size="sm" disabled={isMaintaining} onClick={setMaintenance}><Wrench />{isMaintaining ? "Đang chuyển..." : "Bảo trì"}</Button><ConfirmDeleteDialog title={`Xóa phòng ${soPhong}?`} description="Nếu đủ điều kiện, thao tác này không hoàn tác." onConfirm={deleteRoom} isSubmitting={isDeleting} error={error} /></div>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}
