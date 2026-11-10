import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProposalPreviewView } from "@/components/dosen/proposal-preview-view";
import { Loader2 } from "lucide-react";

function ProposalPreviewFallback() {
  return (
    <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Pratinjau Dokumen Usulan...</h3>
    </div>
  );
}

export default function DosenProposalPreviewPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pratinjau Usulan Proposal (Tahap 1)"
      subtitle="Dokumen resmi usulan penelitian, rincian tim pengusul, target luaran, serta status persetujuan LPPM."
    >
      <Suspense fallback={<ProposalPreviewFallback />}>
        <ProposalPreviewView />
      </Suspense>
    </DashboardLayout>
  );
}

