"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Room } from "@/lib/mock-data";
import { roomTypes } from "@/lib/mock-data";

type RoomFormProps = {
  submitLabel: string;
  defaultRoom?: Pick<Room, "so_phong" | "loai_phong_id" | "trang_thai">;
};

export function RoomForm({
  submitLabel,
  defaultRoom = {
    so_phong: "103",
    loai_phong_id: 1,
    trang_thai: "AVAILABLE",
  },
}: RoomFormProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin/rooms");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-xl">
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="so-phong">Số phòng</Label>
            <Input
              id="so-phong"
              name="so_phong"
              defaultValue={defaultRoom.so_phong}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="loai-phong">Loại phòng</Label>
            <Select
              name="loai_phong_id"
              defaultValue={String(defaultRoom.loai_phong_id)}
            >
              <SelectTrigger id="loai-phong" className="w-full">
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.ten_loai}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="trang-thai">Trạng thái</Label>
            <Select name="trang_thai" defaultValue={defaultRoom.trang_thai}>
              <SelectTrigger id="trang-thai" className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/rooms">Hủy</Link>
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
