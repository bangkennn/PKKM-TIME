import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmProgressReportUploadForm } from "@/components/dosen/pkm-progress-report-upload-form";
import { Loader2 } from "lucide-react";

function FormFallback() {
  return (
    <div className="max-w-3xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Formulir Laporan Kemajuan PKM...</h3>
    </div>
  );
}

export default function DosenPkmKemajuanUnggahPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Unggah Laporan Kemajuan PKM (Tahap 2)"
      subtitle="Kirimkan naskah laporan kemajuan berkala kegiatan PKM dan spesifikasi progres luaran yang telah dicapai bersama mitra sasaran."
    >
      <Suspense fallback={<FormFallback />}>
        <PkmProgressReportUploadForm />
      </Suspense>
    </DashboardLayout>
  );
}

