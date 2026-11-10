import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Dashboard"
      subtitle="Ruang kendali utama pemantauan dan pengelolaan Sistem Penelitian dan Pengabdian Dosen Terpadu."
    >
      <AdminDashboardOverview />
    </DashboardLayout>
  );
}
