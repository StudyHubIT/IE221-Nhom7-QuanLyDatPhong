"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomForm } from "@/components/admin/room-form";
import { useAdminSession } from "@/components/auth/session-provider";
import { ApiError, apiFetch } from "@/lib/api";
import type { Room } from "@/lib/room-api-types";

export default function EditRoomPage() {
  const { session } = useAdminSession(); const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!session) return; apiFetch<Room>(`/api/v1/admin/rooms/${params.id}`, { token: session.token }).then(setRoom).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : "Không tìm thấy phòng.")); }, [params.id, session]);
  if (!session) return null;
  return <div className="space-y-6"><AdminPageHeader title={room ? `Sửa phòng ${room.so_phong}` : "Sửa phòng"} subtitle="Cập nhật loại phòng và trạng thái" />{error ? <p className="text-sm text-destructive">{error}</p> : null}{room ? <RoomForm submitLabel="Cập nhật" token={session.token} roomId={room.id} defaultRoom={room} /> : !error ? <p>Đang tải...</p> : null}</div>;
}
