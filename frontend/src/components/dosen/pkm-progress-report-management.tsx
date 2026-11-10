"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sparkles,
  UploadCloud,
  Layers,
  HeartHandshake,
  Eye,
  X,
  FileText,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import { PkmProposal } from "@/components/dosen/pkm-preview-view";

export function PkmProgressReportManagement() {
  const router = useRouter();
  const [proposals, setProposals] = useState<PkmProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<PkmProposal | null>(null);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/pkm?stage=2", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setProposals(data.data || []);
      } else {
        toast.error(data.error || "Gagal memuat usulan PKM Tahap 2.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server saat memuat data PKM Tahap 2.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = proposals.length;
    const notUploaded = proposals.filter((p) => p.status_tahap2 === "in_progress").length;
    const pendingReview = proposals.filter((p) => p.status_tahap2 === "pending_review").length;
    const approved = proposals.filter((p) => p.status_tahap2 === "approved").length;
    return { total, notUploaded, pendingReview, approved };
  }, [proposals]);

  // Filtered List
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "not_uploaded" && p.status_tahap2 === "in_progress") ||
        (statusFilter === "pending" && p.status_tahap2 === "pending_review") ||
        (statusFilter === "approved" && p.status_tahap2 === "approved");
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.scheme.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [proposals, statusFilter, searchQuery]);

  // Toggle LPPM Approval Handler (Simulasi Cepat LPPM Tahap 2 PKM)
  const handleToggleApprovalStage2 = async (proposal: PkmProposal) => {
    setTogglingId(proposal.id);
    try {
      const res = await fetch(`/resr/api/pkm/${proposal.id}/toggle-approval?stage=2`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchProposals();
        window.dispatchEvent(new Event("sipandu-pkm-updated"));
      } else {
        toast.error(data.error || "Gagal mengubah status persetujuan.");
      }
    } catch {
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Baris Kartu Metrik Tahap 2 PKM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proposal Lolos Tahap 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Usulan PKM Lolos Tahap 1
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : metrics.total}
            </p>
          </div>
        </div>

        {/* Belum Unggah Kemajuan */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Belum Unggah Kemajuan
            </p>
            <p className="text-xl font-black text-slate-700 leading-tight">
              {isLoading ? "..." : metrics.notUploaded}
            </p>
          </div>
        </div>

        {/* Menunggu Review Kemajuan */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menunggu Review LPPM
            </p>
            <p className="text-xl font-black text-amber-600 leading-tight">
              {isLoading ? "..." : metrics.pendingReview}
            </p>
          </div>
        </div>

        {/* Laporan Kemajuan Disetujui */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kemajuan Disetujui LPPM
            </p>
            <p className="text-xl font-black text-emerald-600 leading-tight">
              {isLoading ? "..." : metrics.approved}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Toolbar: Pencarian, Filter Status & Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {/* Input Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul kegiatan, skema, atau ketua PKM..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Tab Filter Status */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs shrink-0">
            {[
              { id: "all", label: "Semua Usulan" },
              { id: "not_uploaded", label: "Belum Unggah" },
              { id: "pending", label: "Menunggu Review" },
              { id: "approved", label: "Disetujui" },
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
      </div>

      {/* 3. Tabel Data Tahap 2 PKM */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Judul Kegiatan PKM</th>
                <th className="py-3.5 px-4">Tahun</th>
                <th className="py-3.5 px-4">Status Tahap 2</th>
                <th className="py-3.5 px-4">Berkas Kemajuan</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi & Simulasi LPPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Memuat daftar Laporan Kemajuan PKM...</span>
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada usulan PKM di Tahap 2</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Usulan akan otomatis muncul di sini setelah proposal disetujui LPPM di Tahap 1.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((item) => {
                  const isStage2Approved = item.status_tahap2 === "approved";
                  const isPendingReview = item.status_tahap2 === "pending_review";
                  const hasUploaded = Boolean(item.file_kemajuan);
                  const isToggling = togglingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Judul & Info PKM */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-sm sm:max-w-md">
                        <p className="font-bold text-slate-900 leading-snug">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {item.scheme}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            Ketua: {item.author_name}
                          </span>
                        </div>
                      </td>

                      {/* Tahun */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {item.academic_year}
                      </td>

                      {/* Status Tahap 2 */}
                      <td className="py-3.5 px-4">
                        {isStage2Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disetujui LPPM
                          </span>
                        ) : isPendingReview ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <UploadCloud className="w-3 h-3 text-slate-500" />
                            Siap Diunggah
                          </span>
                        )}
                      </td>

                      {/* Berkas Kemajuan */}
                      <td className="py-3.5 px-4">
                        {hasUploaded ? (
                          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{item.file_kemajuan}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ada berkas</span>
                        )}
                      </td>

                      {/* Aksi & Simulasi LPPM */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Lihat Detail Kemajuan */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Lihat Detail Kemajuan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tombol Unggah / Perbarui Laporan Kemajuan */}
                          {!isStage2Approved && (
                            <button
                              type="button"
                              onClick={() => router.push(`/dosen/pengabdian/kemajuan/unggah?id=${item.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-2xs cursor-pointer"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>{hasUploaded ? "Perbarui Kemajuan" : "Unggah Kemajuan"}</span>
                            </button>
                          )}

                          {/* Tombol Simulasi Toggle LPPM Tahap 2 */}
                          {hasUploaded && (
                            <button
                              type="button"
                              onClick={() => handleToggleApprovalStage2(item)}
                              disabled={isToggling}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs ml-1 ${
                                isStage2Approved
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              }`}
                              title="Simulasi persetujuan pihak LPPM untuk Tahap 2 PKM"
                            >
                              <Sparkles className="w-3 h-3 shrink-0" />
                              <span>{isStage2Approved ? "Batal Approve" : "Approve LPPM"}</span>
                            </button>
                          )}
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

      {/* Modal Detail Kemajuan PKM */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 mb-1">
                  Detail Laporan Kemajuan PKM (Tahap 2)
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Berkas Laporan Kemajuan</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.file_kemajuan || "Belum diunggah"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Capaian Luaran PKM</span>
                  <p className="font-bold text-blue-700 mt-0.5">{selectedDetail.luaran_jenis || "-"}</p>
                  <p className="text-slate-600 mt-0.5">{selectedDetail.luaran_target || "-"}</p>
                </div>
                {selectedDetail.luaran_keterangan && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Keterangan Realisasi</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedDetail.luaran_keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

