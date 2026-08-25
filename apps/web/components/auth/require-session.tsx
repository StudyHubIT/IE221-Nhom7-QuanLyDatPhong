"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminSession, useUserSession } from "@/components/auth/session-provider";

// Client-side only gate: redirects if no session is found once localStorage
// has been read. This is not a server-enforced boundary (a user with
// JavaScript disabled could still briefly see the DOM) — acceptable for this
// demo project; real protection still lives on each API endpoint.

export function RequireUserSession({ children }: { children: ReactNode }) {
  const { session, isHydrated } = useUserSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !session) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, session, pathname, router]);

  if (!isHydrated || !session) return null;
  return <>{children}</>;
}

export function RequireAdminSession({ children }: { children: ReactNode }) {
  const { session, isHydrated } = useAdminSession();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !session) {
      router.replace("/admin/login");
    }
  }, [isHydrated, session, router]);

  if (!isHydrated || !session) return null;
  return <>{children}</>;
}
