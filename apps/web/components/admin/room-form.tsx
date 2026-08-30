"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import type { Paginated, Room, RoomType } from "@/lib/room-api-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoomFormProps = { submitLabel: string; token: string; roomId?: number; defaultRoom?: Room };
const statuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const;

export function RoomForm({ submitLabel, token, roomId, defaultRoom }: RoomFormProps) {
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [soPhong, setSoPhong] = useState(defaultRoom?.so_phong ?? "");
  const [roomTypeId, setRoomTypeId] = useState(defaultRoom ? String(defaultRoom.loai_phong_id) : "");
  const [status, setStatus] = useState<Room["trang_thai"]>(defaultRoom?.trang_thai ?? "AVAILABLE");
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<RoomType>>("/api/v1/admin/room-types?page=1&page_size=100", { token })
      .then((response) => setRoomTypes(response.items))
      .catch((requestError) => setError(requestError instanceof ApiError ? requestError.message : "Không thể tải loại phòng."))
      .finally(() => setIsLoadingTypes(false));
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loai_phong_id = Number(roomTypeId);
    if (!soPhong.trim()) return setError("Số phòng là bắt buộc.");
    if (!Number.isInteger(loai_phong_id) || loai_phong_id <= 0) return setError("Hãy chọn loại phòng.");
    if (!statuses.includes(status)) return setError("Trạng thái phòng không hợp lệ.");
    setIsSaving(true); setError(null);
    try {
      await apiFetch(roomId ? `/api/v1/admin/rooms/${roomId}` : "/api/v1/admin/rooms", {
        method: roomId ? "PUT" : "POST", token,
        body: JSON.stringify({ so_phong: soPhong.trim(), loai_phong_id, trang_thai: status }),
      });
      router.push("/admin/rooms"); router.refresh();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Không thể lưu phòng.");
    } finally { setIsSaving(false); }
  }

  return <form onSubmit={handleSubmit}><Card className="max-w-xl"><CardContent className="space-y-4">
    <div className="grid gap-1.5"><Label htmlFor="so-phong">Số phòng</Label><Input id="so-phong" name="so_phong" value={soPhong} onChange={(event) => setSoPhong(event.target.value)} required /></div>
    <div className="grid gap-1.5"><Label htmlFor="loai-phong">Loại phòng</Label><Select value={roomTypeId} onValueChange={setRoomTypeId} disabled={isLoadingTypes}><SelectTrigger id="loai-phong" className="w-full"><SelectValue placeholder={isLoadingTypes ? "Đang tải..." : "Chọn loại phòng"} /></SelectTrigger><SelectContent>{roomTypes.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.ten_loai}</SelectItem>)}</SelectContent></Select></div>
    <div className="grid gap-1.5"><Label htmlFor="trang-thai">Trạng thái</Label><Select value={status} onValueChange={(value) => setStatus(value as Room["trang_thai"])}><SelectTrigger id="trang-thai" className="w-full"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger><SelectContent>{statuses.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </CardContent><CardFooter className="justify-end gap-2"><Button asChild variant="outline"><Link href="/admin/rooms">Hủy</Link></Button><Button type="submit" disabled={isSaving || isLoadingTypes}>{isSaving ? "Đang lưu..." : submitLabel}</Button></CardFooter></Card></form>;
}
