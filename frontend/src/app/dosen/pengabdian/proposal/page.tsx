import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmWizardForm } from "@/components/dosen/pkm-wizard-form";
import { Loader2 } from "lucide-react";

function PkmProposalFallback() {
  return (
    <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Formulir Proposal PKM...</h3>
    </div>
  );
}

export default function DosenPkmProposalPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pengajuan Usulan Proposal PKM (Tahap 1)"
      subtitle="Lengkapi data konten utama pengabdian, identitas tim pelaksana, rencana luaran mitra, dan unggah naskah proposal resmi untuk diajukan ke LPPM."
    >
      <Suspense fallback={<PkmProposalFallback />}>
        <PkmWizardForm mode="create" />
      </Suspense>
    </DashboardLayout>
  );
}

