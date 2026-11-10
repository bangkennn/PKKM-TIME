import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProposalWizardForm } from "@/components/dosen/proposal-wizard-form";
import { Loader2 } from "lucide-react";

function ProposalFallback() {
  return (
    <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Formulir Proposal...</h3>
    </div>
  );
}

export default function DosenProposalPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pengajuan Usulan Proposal (Tahap 1)"
      subtitle="Lengkapi data identitas penelitian, estimasi anggaran biaya, dan unggah berkas proposal resmi untuk diajukan ke LPPM."
    >
      <Suspense fallback={<ProposalFallback />}>
        <ProposalWizardForm mode="create" />
      </Suspense>
    </DashboardLayout>
  );
}
