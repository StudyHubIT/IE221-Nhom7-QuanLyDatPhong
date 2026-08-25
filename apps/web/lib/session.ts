export type UserProfile = {
  id: number;
  email: string;
  phone: string | null;
  full_name: string | null;
};
export type UserSession = { token: string; user: UserProfile };

export type AdminProfile = {
  id: number;
  email: string;
  full_name: string | null;
  role: "SUPER_ADMIN" | "STAFF";
};
export type AdminSession = { token: string; admin: AdminProfile };

const USER_KEY = "hotelbook_user_session";
const ADMIN_KEY = "hotelbook_admin_session";

function readSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSession<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function clearSession(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export const readUserSession = () => readSession<UserSession>(USER_KEY);
export const writeUserSession = (session: UserSession) =>
  writeSession(USER_KEY, session);
export const clearUserSession = () => clearSession(USER_KEY);

export const readAdminSession = () => readSession<AdminSession>(ADMIN_KEY);
export const writeAdminSession = (session: AdminSession) =>
  writeSession(ADMIN_KEY, session);
export const clearAdminSession = () => clearSession(ADMIN_KEY);
