import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";

export default function NewStaffPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thêm tài khoản admin"
        subtitle="Tạo admin nội bộ và gán vai trò"
      />
      <StaffForm mode="create" submitLabel="Lưu admin" />
    </div>
  );
}
