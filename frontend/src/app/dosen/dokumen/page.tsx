import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { GuideAndDocumentsView } from "@/components/dosen/guide-and-documents-view";

export default function DosenDokumenPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Panduan & Template Dokumen"
      subtitle="Pusat panduan tata kelola riset dan unduhan berkas resmi usulan proposal, laporan kemajuan, dan laporan akhir STMIK TIME."
    >
      <GuideAndDocumentsView />
    </DashboardLayout>
  );
}

