import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomForm } from "@/components/admin/room-form";

export default function NewRoomPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thêm phòng"
        subtitle="Tạo phòng vật lý mới"
      />
      <RoomForm submitLabel="Lưu phòng" />
    </div>
  );
}
