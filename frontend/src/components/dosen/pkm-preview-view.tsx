"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Users,
  Target,
  ArrowLeft,
  Pencil,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  FileDown,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  FileCheck2,
  Printer,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";

export interface PkmProposal {
  id: string;
  user_id: string;
  author_name: string;
  team_members?: Array<{ name: string; role: string }> | string | null;
  title: string;
  scheme: string;
  academic_year: string;
  duration_months?: number;
  pkm_topic?: string | null;
  proposal_year?: number | null;
  budget: number;
  abstract: string | null;
  file_name: string | null;
  file_custom_name?: string | null;
  file_kemajuan?: string | null;
  luaran_jenis?: string | null;
  luaran_target?: string | null;
  luaran_keterangan?: string | null;
  target_luaran_nama?: string | null;
  target_luaran_keterangan?: string | null;
  file_akhir?: string | null;
  luaran_akhir_jenis?: string | null;
  luaran_akhir_realisasi?: string | null;
  luaran_akhir_link?: string | null;
  luaran_akhir_keterangan?: string | null;
  status_tahap1: "draft" | "pending_review" | "approved" | "rejected";
  status_tahap2: "locked" | "in_progress" | "pending_review" | "approved" | "rejected";
  status_tahap3: "locked" | "in_progress" | "pending_review" | "approved" | "rejected";
  overall_status?: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

interface PkmPreviewViewProps {
  proposalId?: string;
}

export function PkmPreviewView({ proposalId }: PkmPreviewViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = proposalId || searchParams?.get("id") || "";

  const [proposal, setProposal] = useState<PkmProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) {
      setErrorMessage("ID Usulan pengabdian masyarakat (PKM) tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    const fetchProposal = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
        const res = await fetch(`/resr/api/pkm/${activeId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.data) {
          setErrorMessage(data.error || "Gagal memuat detail proposal PKM.");
          return;
        }

        setProposal(data.data);
      } catch {
        setErrorMessage("Gagal terhubung ke server SiPANDU.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposal();
  }, [activeId]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Memuat Dokumen Proposal PKM...</h3>
        <p className="text-xs text-slate-400 mt-1">Mengambil rincian proposal pengabdian dari pangkalan data.</p>
      </div>
    );
  }

  if (errorMessage || !proposal) {
    return (
      <div className="max-w-4xl bg-white rounded-3xl border border-rose-200 p-8 shadow-2xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Proposal PKM Tidak Ditemukan</h3>
          <p className="text-xs text-rose-600 mt-1">{errorMessage || "Data proposal PKM tidak dapat diakses."}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dosen/pengabdian")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengabdian</span>
        </button>
      </div>
    );
  }

  const isStage1Approved = proposal.status_tahap1 === "approved";
  const isStage2Approved = proposal.status_tahap2 === "approved";
  const isStage3Approved = proposal.status_tahap3 === "approved";

  // Parse tim pengusul PKM
  let team: Array<{ name: string; role: string }> = [];
  if (Array.isArray(proposal.team_members)) {
    team = proposal.team_members;
  } else if (typeof proposal.team_members === "string") {
    try {
      team = JSON.parse(proposal.team_members);
    } catch {
      // Ignored
    }
  }

  if (team.length === 0 && proposal.author_name) {
    team = [{ name: proposal.author_name, role: "Ketua Pengusul" }];
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/dosen/pengabdian")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengabdian</span>
        </button>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Cetak Halaman Pratinjau Ini"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>

          {!isStage1Approved && (
            <button
              type="button"
              onClick={() => router.push(`/dosen/pengabdian/proposal/edit?id=${proposal.id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-2xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Proposal PKM Ini</span>
            </button>
          )}
        </div>
      </div>

      {/* Dokumen Pratinjau Utama PKM */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {/* 1. Header Dokumen & Status Badges */}
        <div className="p-6 sm:p-8 space-y-4 bg-slate-50/50">
          {/* Status Badges 3 Tahap PKM */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Status PKM:
            </span>

            {/* Tahap 1 Badge */}
            {isStage1Approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Tahap 1: Disetujui LPPM
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                Tahap 1: Menunggu Review
              </span>
            )}

            {/* Tahap 2 Badge */}
            {isStage2Approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Tahap 2: Disetujui LPPM
              </span>
            ) : isStage1Approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Unlock className="w-3 h-3 text-indigo-600" />
                Tahap 2: Siap Dilaporkan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                Tahap 2: Terkunci
              </span>
            )}

            {/* Tahap 3 Badge */}
            {isStage3Approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Tahap 3: Selesai
              </span>
            ) : isStage2Approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Unlock className="w-3 h-3 text-indigo-600" />
                Tahap 3: Siap Dilaporkan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                Tahap 3: Terkunci
              </span>
            )}
          </div>

          {/* Judul Besar PKM */}
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              Naskah Usulan Proposal Pengabdian Masyarakat (Tahap 1)
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {proposal.title}
            </h1>
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Diajukan: {formatDate(proposal.created_at)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Tahun Akademik: {proposal.academic_year}
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-400 text-[11px]">
              ID PKM: {proposal.id.substring(0, 13)}...
            </span>
          </div>
        </div>

        {/* 2. Grid Data Konten Utama PKM */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <HeartHandshake className="w-4 h-4 text-blue-700" />
            <span>Bagian 1: Konten Utama Pengabdian (PKM)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Skema PKM
              </p>
              <p className="font-bold text-slate-900 mt-1 text-xs">{proposal.scheme}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Tahun Usulan
              </p>
              <p className="font-bold text-slate-900 mt-1 text-xs">
                {proposal.proposal_year || proposal.academic_year}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Lama Kegiatan
              </p>
              <p className="font-bold text-slate-900 mt-1 text-xs">
                {proposal.duration_months || 6} Bulan
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Bidang / Topik Pengabdian
              </p>
              <p className="font-bold text-slate-900 mt-1 text-xs">
                {proposal.pkm_topic || "Pemberdayaan UMKM & Ekonomi Kreatif"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Pagu Anggaran Biaya
              </p>
              <p className="font-black text-blue-700 mt-1 text-sm">
                {formatRupiah(proposal.budget)}
              </p>
            </div>
          </div>

          {/* Abstrak jika ada */}
          {proposal.abstract && (
            <div className="space-y-1.5 pt-2">
              <p className="text-[11px] text-slate-500 font-bold uppercase">Abstrak & Sasaran Mitra</p>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed text-justify">
                {proposal.abstract}
              </div>
            </div>
          )}
        </div>

        {/* 3. Tim Dosen Pelaksana PKM */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Bagian 2: Identitas Dosen Pelaksana & Tim PKM</span>
          </div>

          <div className="space-y-2.5">
            {team.map((member, idx) => {
              const isLeader = idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLeader
                      ? "bg-blue-50/50 border-blue-200/80"
                      : "bg-slate-50/50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isLeader
                          ? "bg-blue-700 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{member.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {isLeader ? "Ketua Tim Pelaksana Pengabdian" : "Anggota Pelaksana Pengabdian"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                      isLeader
                        ? "bg-blue-700 text-white shadow-xs"
                        : "bg-slate-200/70 text-slate-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Substansi & Target Luaran PKM */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Target className="w-4 h-4 text-blue-700" />
            <span>Bagian 3: Substansi & Target Luaran Pengabdian</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Jenis Luaran Utama PKM
                </p>
                <p className="font-bold text-slate-900 mt-1">
                  {proposal.luaran_jenis || "Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Target Capaian Luaran
                </p>
                <p className="font-bold text-blue-700 mt-1">
                  {proposal.target_luaran_nama || "-"}
                </p>
              </div>
            </div>

            {proposal.target_luaran_keterangan && (
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Keterangan & Spesifikasi Luaran
                </p>
                <p className="text-slate-700 leading-relaxed font-normal">
                  {proposal.target_luaran_keterangan}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Dokumen Berkas Usulan PKM */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileCheck2 className="w-4 h-4 text-blue-700" />
            <span>Bagian 4: Dokumen Berkas Usulan PKM</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {proposal.file_custom_name || proposal.file_name || "Proposal_PKM_STMIK_TIME.pdf"}
                </p>
                {proposal.file_custom_name && proposal.file_custom_name !== proposal.file_name && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    File sumber: {proposal.file_name}
                  </p>
                )}
                <span className="inline-block mt-0.5 text-[10px] font-semibold text-slate-500">
                  Dokumen Resmi Usulan PKM Terlampir
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.info(`Mengunduh berkas '${proposal.file_custom_name || proposal.file_name}'...`)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>

        {/* 6. Kotak Catatan Verifikasi LPPM */}
        <div className="p-6 sm:p-8">
          <div
            className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-1.5 ${
              isStage1Approved
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {isStage1Approved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Usulan PKM Telah Disetujui LPPM (Tahap 1 Lolos)</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Usulan PKM Sedang Menunggu Verifikasi & Persetujuan LPPM</span>
                </>
              )}
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isStage1Approved
                ? "Usulan kegiatan pengabdian kepada masyarakat ini telah divalidasi oleh LPPM STMIK TIME. Anda dapat melaksanakan kegiatan bersama mitra dan mengakses modul Tahap 2 untuk mengunggah berkas Laporan Kemajuan PKM saat periode pelaporan dimulai."
                : "Usulan proposal PKM telah tersimpan dalam sistem dan sedang dalam antrean review oleh tim reviewer LPPM. Anda dapat mengubah data usulan selama usulan belum disetujui LPPM."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

