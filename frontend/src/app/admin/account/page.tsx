import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AccountManagement } from "@/components/admin/account-management";

export default function AdminAccountPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Account Center"
      subtitle="Kelola data akun pengguna, peran akses (groups), dan kredensial sistem SiPANDU."
    >
      <AccountManagement />
    </DashboardLayout>
  );
}

