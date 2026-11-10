"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Loader2,
  Eye,
  Sparkles,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export interface ResearchProposal {
  id: string;
  user_id: string;
  author_name: string;
  team_members?: Array<{ name: string; role: string }> | string | null;
  title: string;
  scheme: string;
  academic_year: string;
  duration_months?: number;
  research_topic?: string | null;
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

export function ResearchManagement() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ResearchProposal[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    isStage2Unlocked: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal Delete State
  const [deletingProposal, setDeletingProposal] = useState<ResearchProposal | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/research", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setProposals(data.data || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        toast.error(data.error || "Gagal memuat usulan penelitian.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server saat memuat usulan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Filtered List
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && p.status_tahap1 === "pending_review") ||
        (statusFilter === "approved" && p.status_tahap1 === "approved");
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.scheme.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [proposals, statusFilter, searchQuery]);

  // Toggle LPPM Approval Handler (Simulasi Cepat LPPM Tahap 1)
  const handleToggleApproval = async (proposal: ResearchProposal) => {
    setTogglingId(proposal.id);
    try {
      const res = await fetch(`/resr/api/research/${proposal.id}/toggle-approval?stage=1`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchProposals();
        window.dispatchEvent(new Event("sipandu-research-updated"));
      } else {
        toast.error(data.error || "Gagal mengubah status persetujuan.");
      }
    } catch {
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Submit Delete
  const handleSubmitDelete = async () => {
    if (!deletingProposal) return;

    setIsSubmittingDelete(true);
    try {
      const res = await fetch(`/resr/api/research/${deletingProposal.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Proposal penelitian berhasil dihapus.");
        setDeletingProposal(null);
        await fetchProposals();
        window.dispatchEvent(new Event("sipandu-research-updated"));
      } else {
        toast.error(data.error || "Gagal menghapus proposal.");
      }
    } catch {
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* 1. Toolbar: Pencarian, Filter Status & Tombol Tambah Proposal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {/* Input Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, skema, atau dosen..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Tab Filter Status */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs shrink-0">
            {[
              { id: "all", label: "Semua Usulan" },
              { id: "pending", label: "Menunggu Review" },
              { id: "approved", label: "Disetujui LPPM" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer select-none ${
                  statusFilter === tab.id
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchProposals}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer self-center hidden sm:flex items-center justify-center"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* Tombol Tambah Proposal (Menuju Tahap 1) */}
        <button
          type="button"
          onClick={() => router.push("/dosen/penelitian/proposal")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Usulan Proposal (Tahap 1)</span>
        </button>
      </div>

      {/* 2. Tabel Data Usulan Penelitian */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Judul Penelitian & Skema</th>
                <th className="py-3.5 px-4">Tahun</th>
                <th className="py-3.5 px-4">Anggaran</th>
                <th className="py-3.5 px-4">Tahap 1 (Proposal)</th>
                <th className="py-3.5 px-4">Tahap 2 (Kemajuan)</th>
                <th className="py-3.5 px-4">Tahap 3 (Akhir)</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi & Simulasi LPPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Memuat daftar penelitian...</span>
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Belum ada usulan penelitian</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik tombol &quot;Tambah Usulan Proposal&quot; untuk mengajukan penelitian baru Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((item) => {
                  const isStage1Approved = item.status_tahap1 === "approved";
                  const isStage2Approved = item.status_tahap2 === "approved";
                  const isStage3Approved = item.status_tahap3 === "approved";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Judul & Skema */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-sm sm:max-w-md">
                        <p
                          onClick={() => router.push(`/dosen/penelitian/proposal/preview?id=${item.id}`)}
                          className="font-bold text-slate-900 leading-snug hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {item.scheme}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            Oleh: {item.author_name}
                          </span>
                        </div>
                      </td>

                      {/* Tahun */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {item.academic_year}
                      </td>

                      {/* Anggaran */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {formatRupiah(item.budget)}
                      </td>

                      {/* Status Tahap 1 (Proposal) */}
                      <td className="py-3.5 px-4">
                        {isStage1Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui LPPM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        )}
                      </td>

                      {/* Status Tahap 2 (Kemajuan) */}
                      <td className="py-3.5 px-4">
                        {isStage2Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui LPPM
                          </span>
                        ) : item.status_tahap2 === "pending_review" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        ) : isStage1Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <Unlock className="w-3 h-3 text-indigo-600" />
                            Siap Diunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            Terkunci
                          </span>
                        )}
                      </td>

                      {/* Status Tahap 3 (Akhir) */}
                      <td className="py-3.5 px-4">
                        {isStage3Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Selesai
                          </span>
                        ) : item.status_tahap3 === "pending_review" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        ) : isStage2Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <Unlock className="w-3 h-3 text-indigo-600" />
                            Siap Diunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            Terkunci
                          </span>
                        )}
                      </td>

                      {/* Aksi & Tombol Simulasi LPPM */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Lihat Pratinjau Proposal (Beralih ke Halaman Preview) */}
                          <button
                            type="button"
                            onClick={() => router.push(`/dosen/penelitian/proposal/preview?id=${item.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Buka Halaman Pratinjau Proposal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tombol Edit Proposal (Beralih ke Halaman Edit Proposal) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (isStage1Approved) {
                                toast.error("Proposal yang telah disetujui LPPM tidak dapat diubah lagi.");
                                return;
                              }
                              router.push(`/dosen/penelitian/proposal/edit?id=${item.id}`);
                            }}
                            disabled={isStage1Approved}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isStage1Approved
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                            }`}
                            title={
                              isStage1Approved
                                ? "Tidak dapat diedit karena sudah disetujui LPPM"
                                : "Buka Halaman Edit Proposal"
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Tombol Hapus Proposal (Hanya aktif jika belum approved LPPM) */}
                          <button
                            type="button"
                            onClick={() => setDeletingProposal(item)}
                            disabled={isStage1Approved}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isStage1Approved
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            }`}
                            title={
                              isStage1Approved
                                ? "Tidak dapat dihapus karena sudah disetujui LPPM"
                                : "Hapus Usulan Proposal"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Tombol Cepat Simulasi Toggle Approval LPPM Tahap 1 */}
                          <button
                            type="button"
                            onClick={() => handleToggleApproval(item)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs ml-1 ${
                              isStage1Approved
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                            title="Simulasi persetujuan pihak LPPM untuk Tahap 1"
                          >
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>{isStage1Approved ? "Batal Approve" : "Approve LPPM"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Proposal */}
      {deletingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Hapus Usulan Proposal?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus usulan proposal penelitian &quot;
                <span className="font-semibold text-slate-800">{deletingProposal.title}</span>&quot;?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProposal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitDelete}
                disabled={isSubmittingDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Usulan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
