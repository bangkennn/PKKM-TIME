import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmManagement } from "@/components/dosen/pkm-management";

export default function DosenPengabdianPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pengabdian kepada Masyarakat (PKM)"
      subtitle="Kelola dan pantau seluruh siklus usulan pengabdian masyarakat."
    >
      <PkmManagement />
    </DashboardLayout>
  );
}

