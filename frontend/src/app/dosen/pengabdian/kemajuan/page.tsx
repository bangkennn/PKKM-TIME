import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmProgressReportManagement } from "@/components/dosen/pkm-progress-report-management";

export default function DosenPkmKemajuanPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Laporan Kemajuan PKM (Tahap 2)"
      subtitle="Kelola dan unggah naskah laporan kemajuan kegiatan pengabdian kepada masyarakat beserta bukti progres capaian bersama mitra."
    >
      <PkmProgressReportManagement />
    </DashboardLayout>
  );
}

