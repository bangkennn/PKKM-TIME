import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmFinalReportUploadForm } from "@/components/dosen/pkm-final-report-upload-form";
import { Loader2 } from "lucide-react";

function FormFallback() {
  return (
    <div className="max-w-3xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Formulir Laporan Akhir PKM...</h3>
    </div>
  );
}

export default function DosenPkmAkhirUnggahPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Unggah Laporan Akhir PKM (Tahap 3)"
      subtitle="Kirimkan naskah laporan akhir final kegiatan PKM serta tautan bukti luaran untuk diverifikasi dan disahkan oleh pihak LPPM."
    >
      <Suspense fallback={<FormFallback />}>
        <PkmFinalReportUploadForm />
      </Suspense>
    </DashboardLayout>
  );
}

