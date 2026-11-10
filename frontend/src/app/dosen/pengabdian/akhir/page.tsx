import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmFinalReportManagement } from "@/components/dosen/pkm-final-report-management";

export default function DosenPkmAkhirPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Laporan Akhir PKM (Tahap 3)"
      subtitle="Kelola dan unggah naskah laporan akhir pengabdian masyarakat beserta tautan bukti capaian luaran untuk mendapatkan pengesahan resmi LPPM."
    >
      <PkmFinalReportManagement />
    </DashboardLayout>
  );
}

