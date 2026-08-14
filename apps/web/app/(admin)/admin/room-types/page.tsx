import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RoomTypeRowActions } from "@/components/admin/room-type-row-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVnd } from "@/lib/format";
import { rooms, roomTypes } from "@/lib/mock-data";

export default function AdminRoomTypesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý loại phòng"
        subtitle="Tạo, sửa, xóa loại phòng và giá cơ bản"
        actionLabel="Thêm loại phòng"
        actionHref="/admin/room-types/new"
      />
      <div className="grid gap-1.5">
        <Label htmlFor="room-type-search">Tìm loại phòng</Label>
        <Input id="room-type-search" defaultValue="Phòng Đôi" />
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên loại</TableHead>
              <TableHead>Giá cơ bản</TableHead>
              <TableHead>Số phòng</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.ten_loai}</TableCell>
                <TableCell>{formatVnd(type.gia_co_ban)}</TableCell>
                <TableCell>
                  {rooms.filter((room) => room.loai_phong_id === type.id).length}
                </TableCell>
                <TableCell className="text-right">
                  <RoomTypeRowActions id={type.id} name={type.ten_loai} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminPagination info="Hiển thị 1–3 / 3 loại phòng" />
      </div>
    </div>
  );
}
