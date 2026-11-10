import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmWizardForm } from "@/components/dosen/pkm-wizard-form";
import { Loader2 } from "lucide-react";

function PkmEditFallback() {
  return (
    <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Formulir Pembaruan Proposal PKM...</h3>
    </div>
  );
}

export default function DosenPkmProposalEditPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Perbarui Usulan Proposal PKM (Tahap 1)"
      subtitle="Periksa dan sesuaikan data konten utama kegiatan, tim dosen pelaksana, substansi luaran, serta berkas naskah proposal PKM Anda."
    >
      <Suspense fallback={<PkmEditFallback />}>
        <PkmWizardForm mode="edit" />
      </Suspense>
    </DashboardLayout>
  );
}

