"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileUp,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { PkmProposal } from "@/components/dosen/pkm-preview-view";

export function PkmProgressReportUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");

  const [proposal, setProposal] = useState<PkmProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [fileKemajuan, setFileKemajuan] = useState(
    "Laporan_Kemajuan_PKM_STMIK_TIME.pdf"
  );
  const [luaranJenis, setLuaranJenis] = useState("Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)");
  const [luaranTarget, setLuaranTarget] = useState("Disubmit / Menunggu Review Editor");
  const [luaranKeterangan, setLuaranKeterangan] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) {
      toast.error("ID proposal PKM tidak valid.");
      router.push("/dosen/pengabdian/kemajuan");
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/resr/api/pkm/${proposalId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProposal(data.data);
          if (data.data.file_kemajuan) {
            setFileKemajuan(data.data.file_kemajuan);
          }
          if (data.data.luaran_jenis) {
            setLuaranJenis(data.data.luaran_jenis);
          }
          if (data.data.luaran_target) {
            setLuaranTarget(data.data.luaran_target);
          }
          if (data.data.luaran_keterangan) {
            setLuaranKeterangan(data.data.luaran_keterangan);
          }
        } else {
          toast.error(data.error || "Gagal memuat detail usulan PKM.");
          router.push("/dosen/pengabdian/kemajuan");
        }
      } catch {
        toast.error("Gagal terhubung ke server SiPANDU.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [proposalId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalId) return;

    if (!fileKemajuan.trim()) {
      setErrorMessage("Nama dokumen berkas laporan kemajuan PKM wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/resr/api/pkm/${proposalId}/kemajuan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileKemajuan: fileKemajuan.trim(),
          luaranJenis: luaranJenis.trim(),
          luaranTarget: luaranTarget.trim(),
          luaranKeterangan: luaranKeterangan.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Laporan kemajuan PKM berhasil dikirimkan!");
        window.dispatchEvent(new Event("sipandu-pkm-updated"));
        router.push("/dosen/pengabdian/kemajuan");
      } else {
        setErrorMessage(data.error || "Gagal mengirimkan laporan kemajuan PKM.");
        toast.error(data.error || "Gagal mengirimkan laporan kemajuan PKM.");
      }
    } catch {
      setErrorMessage("Gagal terhubung ke server SiPANDU.");
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Memuat Formulir Laporan Kemajuan PKM...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tombol Kembali */}
      <button
        type="button"
        onClick={() => router.push("/dosen/pengabdian/kemajuan")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Laporan Kemajuan PKM</span>
      </button>

      {/* Info Usulan PKM yang Dilaporkan */}
      {proposal && (
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mb-1">
              Usulan PKM Terverifikasi (Tahap 1 Lolos)
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {proposal.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Skema: <span className="font-semibold text-slate-700">{proposal.scheme}</span> • Tahun: <span className="font-semibold text-slate-700">{proposal.academic_year}</span> • Ketua: <span className="font-semibold text-slate-700">{proposal.author_name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Card Formulir Pengiriman Kemajuan */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Formulir Pengiriman Laporan Kemajuan & Capaian Mitra
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah naskah laporan kemajuan serta deskripsikan progres realisasi luaran pengabdian bersama mitra sasaran.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Dokumen Laporan Kemajuan */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Nama Berkas Dokumen Laporan Kemajuan PKM <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fileKemajuan}
                onChange={(e) => setFileKemajuan(e.target.value)}
                placeholder="Contoh: Laporan_Kemajuan_PKM_UMKM_2026.pdf"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Format dokumen naskah laporan kemajuan wajib dalam format PDF resmi LPPM.
            </p>
          </div>

          {/* Jenis Luaran PKM */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Jenis Luaran yang Dilaporkan <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranJenis}
              onChange={(e) => setLuaranJenis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
            >
              <option value="Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)">
                Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)
              </option>
              <option value="Publikasi Media Massa Cetak / Elektronik Nasional">
                Publikasi Media Massa Cetak / Elektronik Nasional
              </option>
              <option value="Peningkatan Keberdayaan Mitra / Omzet UMKM Binaan">
                Peningkatan Keberdayaan Mitra / Omzet UMKM Binaan
              </option>
              <option value="Video Dokumentasi Kegiatan (Youtube / Medsos Kampus)">
                Video Dokumentasi Kegiatan (Youtube / Medsos Kampus)
              </option>
              <option value="Buku Panduan / Manual Pemberdayaan Mitra">
                Buku Panduan / Manual Pemberdayaan Mitra
              </option>
            </select>
          </div>

          {/* Target Capaian Luaran */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Status Capaian Luaran Saat Ini <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={luaranTarget}
              onChange={(e) => setLuaranTarget(e.target.value)}
              placeholder="Contoh: Sudah disubmit di Jurnal Pengabdian SINTA 3 / Draft artikel telah selesai 80%"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold text-slate-800"
            />
          </div>

          {/* Keterangan Progres & Realisasi */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Keterangan Realisasi Kegiatan & Dampak Mitra
            </label>
            <textarea
              value={luaranKeterangan}
              onChange={(e) => setLuaranKeterangan(e.target.value)}
              placeholder="Uraikan progres pendampingan mitra, persentase ketercapaian anggaran, serta kendala lapangan yang telah diselesaikan..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400 leading-relaxed font-normal"
            />
          </div>

          {/* Tombol Simpan & Kirim */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/dosen/pengabdian/kemajuan")}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Kirimkan Laporan Kemajuan PKM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

