import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";

export default function NewRoomTypePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thêm loại phòng"
        subtitle="Nhập tên loại và giá cơ bản"
      />
      <RoomTypeForm submitLabel="Lưu loại phòng" />
    </div>
  );
}
