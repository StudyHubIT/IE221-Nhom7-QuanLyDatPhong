"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { useAdminSession } from "@/components/auth/session-provider";
import { ApiError, apiFetch } from "@/lib/api";
import type { RoomType } from "@/lib/room-api-types";

export default function EditRoomTypePage() {
  const { session } = useAdminSession(); const params = useParams<{ id: string }>();
  const [roomType, setRoomType] = useState<RoomType | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!session) return; apiFetch<RoomType>(`/api/v1/admin/room-types/${params.id}`, { token: session.token }).then(setRoomType).catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : "Không tìm thấy loại phòng.")); }, [params.id, session]);
  if (!session) return null;
  return <div className="space-y-6"><AdminPageHeader title="Sửa loại phòng" subtitle={roomType ? `Cập nhật ${roomType.ten_loai}` : "Đang tải loại phòng"} />{error ? <p className="text-sm text-destructive">{error}</p> : null}{roomType ? <RoomTypeForm submitLabel="Cập nhật" token={session.token} roomTypeId={roomType.id} defaultName={roomType.ten_loai} defaultPrice={roomType.gia_co_ban} /> : !error ? <p>Đang tải...</p> : null}</div>;
}
