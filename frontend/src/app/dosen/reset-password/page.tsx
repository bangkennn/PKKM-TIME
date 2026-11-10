import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ResetPasswordForm } from "@/components/dashboard/reset-password-form";

export default function DosenResetPasswordPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pengaturan Kata Sandi"
      subtitle="Perbarui kata sandi akun Dosen Anda untuk menjaga keamanan akses sistem SiPANDU."
    >
      <ResetPasswordForm role="dosen" />
    </DashboardLayout>
  );
}

