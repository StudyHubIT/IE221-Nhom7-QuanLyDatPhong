"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";
import { apiFetch } from "@/lib/api";
import { useAdminSession } from "@/components/auth/session-provider";

export default function EditStaffPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { session } = useAdminSession();
  const [admin, setAdmin] = useState<{ full_name: string | null; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      if (!session?.token || !id) return;
      try {
        const res = await apiFetch<any>(`/api/v1/admin/admins/${id}`, {
          token: session.token,
        });
        setAdmin(res);
      } catch (err) {
        console.error(err);
        router.push("/admin/staff");
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, [id, session?.token, router]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;
  }

  if (!admin) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy tài khoản</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sửa tài khoản admin"
        subtitle={`Cập nhật ${admin.full_name || admin.email} và vai trò`}
      />
      <StaffForm
        mode="edit"
        submitLabel="Cập nhật"
        adminId={id}
        defaultAdmin={admin}
      />
    </div>
  );
}
