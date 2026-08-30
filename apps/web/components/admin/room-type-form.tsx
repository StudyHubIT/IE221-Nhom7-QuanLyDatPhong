"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoomTypeFormProps = {
  submitLabel: string;
  token: string;
  roomTypeId?: number;
  defaultName?: string;
  defaultPrice?: number;
};

export function RoomTypeForm({ submitLabel, token, roomTypeId, defaultName = "", defaultPrice }: RoomTypeFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [price, setPrice] = useState(defaultPrice === undefined ? "" : String(defaultPrice));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gia_co_ban = Number(price);
    if (!name.trim()) return setError("Tên loại phòng là bắt buộc.");
    if (!Number.isFinite(gia_co_ban) || gia_co_ban < 0) return setError("Giá cơ bản phải là số không âm.");
    setIsSaving(true); setError(null);
    try {
      await apiFetch(roomTypeId ? `/api/v1/admin/room-types/${roomTypeId}` : "/api/v1/admin/room-types", {
        method: roomTypeId ? "PUT" : "POST", token,
        body: JSON.stringify({ ten_loai: name.trim(), gia_co_ban }),
      });
      router.push("/admin/room-types"); router.refresh();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "Không thể lưu loại phòng.");
    } finally { setIsSaving(false); }
  }

  return <form onSubmit={handleSubmit}><Card className="max-w-xl"><CardContent className="space-y-4">
    <div className="grid gap-1.5"><Label htmlFor="ten-loai">Tên loại</Label><Input id="ten-loai" name="ten_loai" value={name} onChange={(event) => setName(event.target.value)} required /></div>
    <div className="grid gap-1.5"><Label htmlFor="gia-co-ban">Giá cơ bản (đ/đêm)</Label><Input id="gia-co-ban" name="gia_co_ban" inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} required /></div>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
  </CardContent><CardFooter className="justify-end gap-2"><Button asChild variant="outline"><Link href="/admin/room-types">Hủy</Link></Button><Button type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : submitLabel}</Button></CardFooter></Card></form>;
}
