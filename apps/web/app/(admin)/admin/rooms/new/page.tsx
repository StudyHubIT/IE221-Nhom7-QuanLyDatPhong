"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomForm } from "@/components/admin/room-form";
import { useAdminSession } from "@/components/auth/session-provider";

export default function NewRoomPage() {
  const { session } = useAdminSession();
  if (!session) return null;
  return <div className="space-y-6"><AdminPageHeader title="Thêm phòng" subtitle="Tạo phòng vật lý mới" /><RoomForm submitLabel="Lưu phòng" token={session.token} /></div>;
}
