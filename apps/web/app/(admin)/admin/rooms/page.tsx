import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPagination } from "@/components/admin/pagination";
import { RoomRowActions } from "@/components/admin/room-row-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roomStatusLabel } from "@/lib/format";
import { getRoomType, rooms, roomTypes } from "@/lib/mock-data";

export default function AdminRoomsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý phòng"
        subtitle="Tạo, sửa, xóa phòng vật lý và trạng thái vận hành"
        actionLabel="Thêm phòng"
        actionHref="/admin/rooms/new"
      />
      <div className="grid gap-3 md:grid-cols-[200px_200px_1fr]">
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Loại phòng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {roomTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.ten_loai}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="AVAILABLE">Còn trống</SelectItem>
            <SelectItem value="OCCUPIED">Đang sử dụng</SelectItem>
            <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
        <Input defaultValue="101" placeholder="Tìm số phòng" />
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Số phòng</TableHead>
              <TableHead>Loại phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.so_phong}</TableCell>
                <TableCell>{getRoomType(room.loai_phong_id)?.ten_loai}</TableCell>
                <TableCell>
                  <Badge variant="success">
                    {roomStatusLabel[room.trang_thai]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RoomRowActions id={room.id} soPhong={room.so_phong} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminPagination info="Hiển thị 1–5 / 5 phòng" />
      </div>
    </div>
  );
}
