import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AdminTemplateManagement } from "@/components/admin/admin-template-management";

export default function AdminTemplateBerkasPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Manajemen Template Berkas"
      subtitle="Kelola dan sediakan berkas template resmi berformat Microsoft Word (.docx) untuk diunduh oleh dosen."
    >
      <AdminTemplateManagement />
    </DashboardLayout>
  );
}

