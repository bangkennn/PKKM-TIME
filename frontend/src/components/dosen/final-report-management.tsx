"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Eye,
  X,
  FileDown,
  Sparkles,
  UploadCloud,
  Award,
  ExternalLink,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ResearchProposal } from "./research-management";

export function FinalReportManagement() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ResearchProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState<ResearchProposal | null>(null);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/research?stage=3", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setProposals(data.data || []);
      } else {
        toast.error(data.error || "Gagal memuat usulan Tahap 3.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server saat memuat usulan Tahap 3.");
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
    const notUploaded = proposals.filter((p) => p.status_tahap3 === "in_progress").length;
    const pendingReview = proposals.filter((p) => p.status_tahap3 === "pending_review").length;
    const completed = proposals.filter(
      (p) => p.status_tahap3 === "approved" || p.overall_status === "completed"
    ).length;
    return { total, notUploaded, pendingReview, completed };
  }, [proposals]);

  // Filtered List
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "not_uploaded" && p.status_tahap3 === "in_progress") ||
        (statusFilter === "pending" && p.status_tahap3 === "pending_review") ||
        (statusFilter === "completed" &&
          (p.status_tahap3 === "approved" || p.overall_status === "completed"));
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.scheme.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [proposals, statusFilter, searchQuery]);

  // Toggle LPPM Approval Handler (Simulasi Cepat LPPM Tahap 3 -> Selesai)
  const handleToggleApprovalStage3 = async (proposal: ResearchProposal) => {
    setTogglingId(proposal.id);
    try {
      const res = await fetch(`/resr/api/research/${proposal.id}/toggle-approval?stage=3`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchProposals();
        window.dispatchEvent(new Event("sipandu-research-updated"));
      } else {
        toast.error(data.error || "Gagal mengubah status persetujuan laporan akhir.");
      }
    } catch {
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Baris Kartu Status Tahap 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lolos Tahap 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Lolos Tahap 2
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : metrics.total}
            </p>
          </div>
        </div>

        {/* Belum Unggah Laporan Akhir */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Belum Unggah Laporan Akhir
            </p>
            <p className="text-xl font-black text-slate-700 leading-tight">
              {isLoading ? "..." : metrics.notUploaded}
            </p>
          </div>
        </div>

        {/* Menunggu Review LPPM */}
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

        {/* Penelitian Selesai */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Penelitian Selesai (Lengkap)
            </p>
            <p className="text-xl font-black text-emerald-600 leading-tight">
              {isLoading ? "..." : metrics.completed}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Toolbar: Pencarian & Filter Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {/* Input Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul riset atau pengusul..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Tab Filter Status */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs shrink-0">
            {[
              { id: "all", label: "Semua Usulan Tahap 2" },
              { id: "not_uploaded", label: "Belum Unggah" },
              { id: "pending", label: "Menunggu Review" },
              { id: "completed", label: "Selesai" },
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

      {/* 3. Tabel Data Laporan Akhir */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Judul Penelitian & Skema</th>
                <th className="py-3.5 px-4">Tahun</th>
                <th className="py-3.5 px-4">Status Laporan Akhir</th>
                <th className="py-3.5 px-4">Dokumen & Luaran Final</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi & Simulasi LPPM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Memuat daftar laporan akhir...</span>
                  </td>
                </tr>
              ) : filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Award className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Belum ada usulan yang siap untuk Tahap 3</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Laporan Kemajuan harus disetujui LPPM pada Tahap 2 terlebih dahulu untuk dapat melanjutkan ke Laporan Akhir.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((item) => {
                  const isStage3Approved = item.status_tahap3 === "approved" || item.overall_status === "completed";
                  const isStage3Pending = item.status_tahap3 === "pending_review";
                  const isToggling = togglingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Judul & Skema */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-sm sm:max-w-md">
                        <p className="font-bold text-slate-900 leading-snug hover:text-blue-700 transition-colors">
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

                      {/* Status Laporan Akhir */}
                      <td className="py-3.5 px-4">
                        {isStage3Approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Penelitian Selesai
                          </span>
                        ) : isStage3Pending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <UploadCloud className="w-3 h-3 text-slate-500" />
                            Belum Diunggah
                          </span>
                        )}
                      </td>

                      {/* Dokumen & Luaran Final */}
                      <td className="py-3.5 px-4">
                        {item.file_akhir ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="truncate max-w-[150px]">{item.file_akhir}</span>
                            </div>
                            {item.luaran_akhir_jenis && (
                              <p className="text-[10px] text-slate-500">
                                Luaran: <span className="font-semibold text-slate-700">{item.luaran_akhir_jenis}</span>
                                {item.luaran_akhir_realisasi ? ` (${item.luaran_akhir_realisasi})` : ""}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada berkas</span>
                        )}
                      </td>

                      {/* Aksi & Tombol Simulasi LPPM */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Lihat Detail Akhir */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetail(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Lihat Detail Laporan Akhir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Tombol Kirim / Unggah Laporan Akhir */}
                          <button
                            type="button"
                            onClick={() => router.push(`/dosen/penelitian/akhir/unggah?id=${item.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-2xs cursor-pointer"
                            title="Kirim atau perbarui Berkas Laporan Akhir & Bukti Luaran Final"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{item.file_akhir ? "Ubah Laporan" : "Kirim Laporan"}</span>
                          </button>

                          {/* Tombol Simulasi Toggle LPPM Tahap 3 */}
                          <button
                            type="button"
                            onClick={() => handleToggleApprovalStage3(item)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs ml-1 ${
                              isStage3Approved
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                            title="Simulasi pengesahan akhir pihak LPPM untuk menyelesaikan seluruh siklus penelitian"
                          >
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>{isStage3Approved ? "Batal Selesai" : "Approve Selesai"}</span>
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

      {/* 4. Modal Detail Laporan Akhir */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1.5">
                  Rincian Laporan Akhir (Tahap 3)
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

            {/* Konten Rincian */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Dosen Pengusul</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.author_name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase">Skema Penelitian</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetail.scheme}</p>
                </div>
              </div>

              {/* Status Laporan Akhir & Penelitian */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Status Akhir Penelitian</p>
                <div className="flex items-center gap-2">
                  {selectedDetail.status_tahap3 === "approved" || selectedDetail.overall_status === "completed" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      Penelitian Resmi Disetujui LPPM & Telah Selesai
                    </span>
                  ) : selectedDetail.status_tahap3 === "pending_review" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Laporan Akhir Sedang Direview LPPM
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Laporan Akhir Belum Diunggah
                    </span>
                  )}
                </div>
              </div>

              {/* Berkas Laporan Akhir */}
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase mb-1.5">
                  Dokumen Berkas Laporan Akhir Resmi
                </p>
                {selectedDetail.file_akhir ? (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">
                        {selectedDetail.file_akhir}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                      <FileDown className="w-3.5 h-3.5" />
                      Unduh Berkas
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Berkas laporan akhir belum diunggah.
                  </p>
                )}
              </div>

              {/* Data Luaran Final */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">
                  Data Luaran Akhir & Bukti Publikasi
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold">Jenis Luaran Final</span>
                    <p className="font-bold text-slate-800">
                      {selectedDetail.luaran_akhir_jenis || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold">Realisasi Capaian Akhir</span>
                    <p className="font-bold text-emerald-600">
                      {selectedDetail.luaran_akhir_realisasi || "-"}
                    </p>
                  </div>
                </div>
                {selectedDetail.luaran_akhir_link && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold">Tautan Bukti Luaran / DOI URL</span>
                    <p className="text-blue-600 mt-0.5 font-mono truncate hover:underline cursor-pointer">
                      {selectedDetail.luaran_akhir_link}
                    </p>
                  </div>
                )}
                {selectedDetail.luaran_akhir_keterangan && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold">Ringkasan Capaian Riset</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      {selectedDetail.luaran_akhir_keterangan}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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

