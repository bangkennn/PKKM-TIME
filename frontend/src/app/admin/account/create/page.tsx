import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CreateAccountForm } from "@/components/admin/create-account-form";

export default function AdminCreateAccountPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Tambah Akun Pengguna"
      subtitle="Buat akun pengguna baru dengan konfigurasi peran grup (Dosen, LPMI, Admin) untuk sistem SiPANDU."
    >
      <CreateAccountForm />
    </DashboardLayout>
  );
}

