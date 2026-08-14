import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";
import { adminAccounts, getAdminAccount } from "@/lib/mock-data";

type EditStaffPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return adminAccounts.map((admin) => ({ id: String(admin.id) }));
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params;
  const admin = getAdminAccount(id);
  if (!admin) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sửa tài khoản admin"
        subtitle={`Cập nhật ${admin.full_name} và vai trò`}
      />
      <StaffForm
        mode="edit"
        submitLabel="Cập nhật"
        defaultAdmin={admin}
      />
    </div>
  );
}
