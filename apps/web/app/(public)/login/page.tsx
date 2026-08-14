"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();

  function continueToCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/checkout");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-6 py-12">
      <Card>
        <CardHeader>
          <CardDescription>
            Đăng nhập để hoàn tất đặt phòng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
              <form className="space-y-4" onSubmit={continueToCheckout}>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="user1@gmail.com"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" defaultValue="password" />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-muted-foreground">
                    Quên mật khẩu?
                  </button>
                </div>
                <Button type="submit" className="w-full">
                  Đăng nhập
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="pt-4">
              <form className="space-y-4" onSubmit={continueToCheckout}>
                <div className="grid gap-1.5">
                  <Label htmlFor="full-name">Họ và tên</Label>
                  <Input id="full-name" defaultValue="Nguyễn Văn A" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    defaultValue="user1@gmail.com"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" defaultValue="0900000001" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <Input
                    id="register-password"
                    type="password"
                    defaultValue="password"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    defaultValue="password"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Đăng ký
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
