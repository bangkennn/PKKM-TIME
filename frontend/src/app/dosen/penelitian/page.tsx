import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ResearchManagement } from "@/components/dosen/research-management";

export default function DosenPenelitianPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Penelitian Dosen"
      subtitle="Kelola usulan penelitian, pantau status persetujuan LPPM, dan lanjutkan tahapan laporan riset Anda."
    >
      <ResearchManagement />
    </DashboardLayout>
  );
}

