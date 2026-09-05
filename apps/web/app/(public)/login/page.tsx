"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useUserSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserProfile } from "@/lib/session";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUserSession();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const { access_token } = await apiFetch<{ access_token: string }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        },
      );
      const user = await apiFetch<UserProfile>("/api/v1/auth/me", {
        token: access_token,
      });
      login({ token: access_token, user });
      router.push(redirectTo);
    } catch (error) {
      setLoginError(
        error instanceof ApiError ? error.message : "Đăng nhập thất bại",
      );
    } finally {
      setIsLoggingIn(false);
    }
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
          <form className="space-y-4" onSubmit={onLogin}>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            {loginError ? (
              <p className="text-sm text-destructive">{loginError}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
