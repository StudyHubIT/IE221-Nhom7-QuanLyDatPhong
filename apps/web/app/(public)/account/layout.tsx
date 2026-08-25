import { RequireUserSession } from "@/components/auth/require-session";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireUserSession>{children}</RequireUserSession>;
}
