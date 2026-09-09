"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { apiFetch } from "@/lib/api";
import { useAdminSession } from "@/components/auth/session-provider";

type StaffFormProps = {
  submitLabel: string;
  mode: "create" | "edit";
  adminId?: number;
  defaultAdmin?: {
    full_name: string | null;
    email: string;
    role: string;
  };
};

export function StaffForm({
  submitLabel,
  mode,
  adminId,
  defaultAdmin = {
    full_name: "",
    email: "",
    role: "STAFF",
  },
}: StaffFormProps) {
  const router = useRouter();
  const { session } = useAdminSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.token) return;
    
    setError(null);
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const body: Record<string, any> = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      role: formData.get("role"),
    };
    const password = formData.get("password") as string;
    if (password) {
      body.password = password;
    }

    try {
      if (mode === "create") {
        await apiFetch("/api/v1/admin/admins", {
          method: "POST",
          token: session.token,
          body: JSON.stringify(body)
        });
      } else if (mode === "edit" && adminId) {
        await apiFetch(`/api/v1/admin/admins/${adminId}`, {
          method: "PUT",
          token: session.token,
          body: JSON.stringify(body)
        });
      }
      router.push("/admin/staff");
      router.refresh(); // Tell Next.js router to refresh the current route if needed
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
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
              defaultValue={defaultAdmin.full_name || ""}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultAdmin.email}
              required
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
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/staff">Hủy</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
