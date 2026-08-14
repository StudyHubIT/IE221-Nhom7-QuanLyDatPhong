"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoomTypeFormProps = {
  submitLabel: string;
  defaultName?: string;
  defaultPrice?: string;
};

export function RoomTypeForm({
  submitLabel,
  defaultName = "Phòng Gia đình",
  defaultPrice = "1200000",
}: RoomTypeFormProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin/room-types");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-xl">
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ten-loai">Tên loại</Label>
            <Input id="ten-loai" name="ten_loai" defaultValue={defaultName} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="gia-co-ban">Giá cơ bản (đ/đêm)</Label>
            <Input
              id="gia-co-ban"
              name="gia_co_ban"
              inputMode="numeric"
              defaultValue={defaultPrice}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/room-types">Hủy</Link>
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
