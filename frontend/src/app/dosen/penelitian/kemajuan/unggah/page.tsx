import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProgressReportUploadForm } from "@/components/dosen/progress-report-upload-form";
import { Loader2 } from "lucide-react";

export default function DosenUnggahKemajuanPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Unggah Laporan Kemajuan & Luaran (Tahap 2)"
      subtitle="Kirimkan berkas dokumen laporan kemajuan pelaksanaan riset serta data capaian luaran wajib untuk dievaluasi oleh LPPM."
    >
      <Suspense
        fallback={
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="font-semibold text-slate-700">Menyiapkan formulir pelaporan kemajuan...</p>
          </div>
        }
      >
        <ProgressReportUploadForm />
      </Suspense>
    </DashboardLayout>
  );
}

