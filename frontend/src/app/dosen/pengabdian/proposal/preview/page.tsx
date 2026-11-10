import React, { Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PkmPreviewView } from "@/components/dosen/pkm-preview-view";
import { Loader2 } from "lucide-react";

function PkmPreviewFallback() {
  return (
    <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
      <h3 className="text-sm font-bold text-slate-800">Menyiapkan Pratinjau Dokumen Usulan PKM...</h3>
    </div>
  );
}

export default function DosenPkmProposalPreviewPage() {
  return (
    <DashboardLayout
      role="dosen"
      title="Pratinjau Usulan Proposal PKM (Tahap 1)"
      subtitle="Dokumen resmi usulan pengabdian masyarakat, rincian tim pelaksana, target luaran mitra, serta status persetujuan LPPM."
    >
      <Suspense fallback={<PkmPreviewFallback />}>
        <PkmPreviewView />
      </Suspense>
    </DashboardLayout>
  );
}

