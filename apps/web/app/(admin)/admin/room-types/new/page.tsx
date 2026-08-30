"use client";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { useAdminSession } from "@/components/auth/session-provider";

export default function NewRoomTypePage() {
  const { session } = useAdminSession();
  if (!session) return null;
  return <div className="space-y-6"><AdminPageHeader title="Thêm loại phòng" subtitle="Nhập tên loại và giá cơ bản" /><RoomTypeForm submitLabel="Lưu loại phòng" token={session.token} /></div>;
}
