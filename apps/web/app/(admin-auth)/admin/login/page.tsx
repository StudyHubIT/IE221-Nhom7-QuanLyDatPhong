"use client";

import { useRouter } from "next/navigation";
import { Building2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center border-b px-8">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </span>
          HotelBook Admin
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center font-medium">
            Đăng nhập tài khoản quản trị
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-1.5">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue="admin@hotel.com"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="admin-password">Mật khẩu</Label>
                <Input
                  id="admin-password"
                  type="password"
                  defaultValue="password"
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn />
                Đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
