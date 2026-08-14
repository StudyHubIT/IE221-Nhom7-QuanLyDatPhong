import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { getRoomType, roomTypes } from "@/lib/mock-data";

type EditRoomTypePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return roomTypes.map((type) => ({ id: String(type.id) }));
}

export default async function EditRoomTypePage({
  params,
}: EditRoomTypePageProps) {
  const { id } = await params;
  const roomType = getRoomType(id);
  if (!roomType) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sửa loại phòng"
        subtitle={`Cập nhật ${roomType.ten_loai}`}
      />
      <RoomTypeForm
        submitLabel="Cập nhật"
        defaultName={roomType.ten_loai}
        defaultPrice={String(roomType.gia_co_ban)}
      />
    </div>
  );
}
