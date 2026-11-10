import { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FinalReportUploadForm } from "@/components/dosen/final-report-upload-form";
import { Loader2 } from "lucide-react";

export default function DosenUnggahAkhirPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Unggah Laporan Akhir & Luaran Final (Tahap 3)"
      subtitle="Kirimkan berkas laporan pertanggungjawaban akhir dan lampiran bukti capaian luaran final untuk memperoleh pengesahan penutupan riset dari LPPM."
    >
      <Suspense
        fallback={
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="font-semibold text-slate-700">Menyiapkan formulir pelaporan akhir...</p>
          </div>
        }
      >
        <FinalReportUploadForm />
      </Suspense>
    </DashboardLayout>
  );
}

