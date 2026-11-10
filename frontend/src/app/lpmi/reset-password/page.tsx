import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ResetPasswordForm } from "@/components/dashboard/reset-password-form";

export default function LPMIResetPasswordPage() {
  return (
    <DashboardLayout
      role="lpmi"
      title="Pengaturan Kata Sandi"
      subtitle="Perbarui kata sandi akun Penjaminan Mutu Internal (LPMI) Anda untuk menjaga keamanan akses sistem SiPANDU."
    >
      <ResetPasswordForm role="lpmi" />
    </DashboardLayout>
  );
}

