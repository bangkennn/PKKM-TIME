import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FinalReportManagement } from "@/components/dosen/final-report-management";

export default function DosenAkhirPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Laporan Akhir Penelitian (Tahap 3)"
      subtitle="Pantau usulan riset yang telah menyelesaikan laporan kemajuan, unggah laporan pertanggungjawaban akhir, dan lampirkan bukti luaran final untuk pengesahan penutupan riset LPPM."
    >
      <FinalReportManagement />
    </DashboardLayout>
  );
}

