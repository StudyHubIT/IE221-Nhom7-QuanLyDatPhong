import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomForm } from "@/components/admin/room-form";
import { getRoom, rooms } from "@/lib/mock-data";

type EditRoomPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return rooms.map((room) => ({ id: String(room.id) }));
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Sửa phòng ${room.so_phong}`}
        subtitle="Cập nhật loại phòng và trạng thái"
      />
      <RoomForm submitLabel="Cập nhật" defaultRoom={room} />
    </div>
  );
}
