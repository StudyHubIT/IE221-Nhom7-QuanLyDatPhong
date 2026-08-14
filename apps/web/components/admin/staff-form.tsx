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
import type { AdminAccount } from "@/lib/mock-data";

type StaffFormProps = {
  submitLabel: string;
  mode: "create" | "edit";
  defaultAdmin?: Pick<AdminAccount, "full_name" | "email" | "role">;
};

export function StaffForm({
  submitLabel,
  mode,
  defaultAdmin = {
    full_name: "Lê Văn C",
    email: "staff2@hotel.com",
    role: "STAFF",
  },
}: StaffFormProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin/staff");
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-xl">
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="full-name">Họ và tên</Label>
            <Input
              id="full-name"
              name="full_name"
              defaultValue={defaultAdmin.full_name}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultAdmin.email}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">
              {mode === "edit" ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              defaultValue={mode === "create" ? "password" : ""}
              required={mode === "create"}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role">Vai trò</Label>
            <Select name="role" defaultValue={defaultAdmin.role}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                <SelectItem value="STAFF">STAFF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/staff">Hủy</Link>
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
