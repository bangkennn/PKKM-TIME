import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ResetPasswordForm } from "@/components/dashboard/reset-password-form";

export default function AdminResetPasswordPage() {
  return (
    <DashboardLayout
      role="admin"
      title="Pengaturan Kata Sandi"
      subtitle="Perbarui kata sandi akun Administrator Anda untuk menjaga keamanan akses sistem SiPANDU."
    >
      <ResetPasswordForm role="admin" />
    </DashboardLayout>
  );
}

