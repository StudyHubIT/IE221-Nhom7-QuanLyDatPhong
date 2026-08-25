import { RequireAdminSession } from "@/components/auth/require-session";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-8">
        <RequireAdminSession>{children}</RequireAdminSession>
      </main>
    </div>
  );
}
