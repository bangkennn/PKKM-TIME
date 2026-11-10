import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProgressReportManagement } from "@/components/dosen/progress-report-management";

export default function DosenKemajuanPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Laporan Kemajuan Penelitian (Tahap 2)"
      subtitle="Pantau usulan riset yang telah lolos Tahap 1, unggah berkas kemajuan pelaksanaan, dan laporkan capaian luaran kepada LPPM."
    >
      <ProgressReportManagement />
    </DashboardLayout>
  );
}

