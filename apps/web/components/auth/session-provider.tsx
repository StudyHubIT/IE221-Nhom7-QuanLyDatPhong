"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "@/lib/api";
import {
  clearAdminSession,
  clearUserSession,
  readAdminSession,
  readUserSession,
  writeAdminSession,
  writeUserSession,
  type AdminSession,
  type UserSession,
} from "@/lib/session";

type UserAuthContextValue = {
  session: UserSession | null;
  isHydrated: boolean;
  login: (session: UserSession) => void;
  logout: () => void;
};

type AdminAuthContextValue = {
  session: AdminSession | null;
  isHydrated: boolean;
  login: (session: AdminSession) => void;
  logout: () => void;
};

const UserAuthContext = createContext<UserAuthContextValue | null>(null);
const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSession(readUserSession());
    setIsHydrated(true);
  }, []);

  function login(next: UserSession) {
    writeUserSession(next);
    setSession(next);
  }

  function logout() {
    const token = session?.token;
    clearUserSession();
    setSession(null);
    if (token) {
      // Token is stateless server-side, nothing to actually revoke — this
      // call is best-effort only, failures are ignored.
      apiFetch("/api/v1/auth/logout", { method: "POST", token }).catch(
        () => {},
      );
    }
  }

  return (
    <UserAuthContext.Provider value={{ session, isHydrated, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserSession() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserSession must be used within UserSessionProvider");
  }
  return ctx;
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setSession(readAdminSession());
    setIsHydrated(true);
  }, []);

  function login(next: AdminSession) {
    writeAdminSession(next);
    setSession(next);
  }

  function logout() {
    const token = session?.token;
    clearAdminSession();
    setSession(null);
    if (token) {
      apiFetch("/api/v1/admin/auth/logout", { method: "POST", token }).catch(
        () => {},
      );
    }
  }

  return (
    <AdminAuthContext.Provider value={{ session, isHydrated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error(
      "useAdminSession must be used within AdminSessionProvider",
    );
  }
  return ctx;
}
