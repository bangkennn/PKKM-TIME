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
  Award,
  Link as LinkIcon,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { PkmProposal } from "@/components/dosen/pkm-preview-view";

export function PkmFinalReportUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");

  const [proposal, setProposal] = useState<PkmProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [fileAkhir, setFileAkhir] = useState("Laporan_Akhir_PKM_STMIK_TIME.pdf");
  const [luaranAkhirJenis, setLuaranAkhirJenis] = useState("Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)");
  const [luaranAkhirRealisasi, setLuaranAkhirRealisasi] = useState("Terbit / Published (Selesai Penuh)");
  const [luaranAkhirLink, setLuaranAkhirLink] = useState("https://journal.stmik-time.ac.id/pkm/article/view/2048");
  const [luaranAkhirKeterangan, setLuaranAkhirKeterangan] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) {
      toast.error("ID proposal PKM tidak valid.");
      router.push("/dosen/pengabdian/akhir");
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/resr/api/pkm/${proposalId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProposal(data.data);
          if (data.data.file_akhir) {
            setFileAkhir(data.data.file_akhir);
          }
          if (data.data.luaran_akhir_jenis) {
            setLuaranAkhirJenis(data.data.luaran_akhir_jenis);
          }
          if (data.data.luaran_akhir_realisasi) {
            setLuaranAkhirRealisasi(data.data.luaran_akhir_realisasi);
          }
          if (data.data.luaran_akhir_link) {
            setLuaranAkhirLink(data.data.luaran_akhir_link);
          }
          if (data.data.luaran_akhir_keterangan) {
            setLuaranAkhirKeterangan(data.data.luaran_akhir_keterangan);
          }
        } else {
          toast.error(data.error || "Gagal memuat detail usulan PKM.");
          router.push("/dosen/pengabdian/akhir");
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

    if (!fileAkhir.trim()) {
      setErrorMessage("Nama dokumen berkas laporan akhir PKM wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/resr/api/pkm/${proposalId}/akhir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileAkhir: fileAkhir.trim(),
          luaranAkhirJenis: luaranAkhirJenis.trim(),
          luaranAkhirRealisasi: luaranAkhirRealisasi.trim(),
          luaranAkhirLink: luaranAkhirLink.trim() || undefined,
          luaranAkhirKeterangan: luaranAkhirKeterangan.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Laporan akhir PKM berhasil dikirimkan ke LPPM!");
        window.dispatchEvent(new Event("sipandu-pkm-updated"));
        router.push("/dosen/pengabdian/akhir");
      } else {
        setErrorMessage(data.error || "Gagal mengirimkan laporan akhir PKM.");
        toast.error(data.error || "Gagal mengirimkan laporan akhir PKM.");
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
        <h3 className="text-sm font-bold text-slate-800">Memuat Formulir Laporan Akhir PKM...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tombol Kembali */}
      <button
        type="button"
        onClick={() => router.push("/dosen/pengabdian/akhir")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Laporan Akhir PKM</span>
      </button>

      {/* Info Usulan PKM yang Dilaporkan */}
      {proposal && (
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 mb-1">
              Tahap 2 Lolos (Siap Tutup Siklus PKM)
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

      {/* Card Formulir Pengiriman Akhir */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Formulir Pengesahan Laporan Akhir & Bukti Luaran Final PKM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah berkas dokumen laporan akhir pengabdian serta sematkan tautan bukti capaian luaran final.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Dokumen Laporan Akhir */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Nama Berkas Dokumen Laporan Akhir PKM <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fileAkhir}
              onChange={(e) => setFileAkhir(e.target.value)}
              placeholder="Contoh: Laporan_Akhir_PKM_Pemberdayaan_UMKM_2026.pdf"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono"
            />
          </div>

          {/* Jenis Luaran Final */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Jenis Luaran Akhir yang Direalisasikan <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranAkhirJenis}
              onChange={(e) => setLuaranAkhirJenis(e.target.value)}
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
              <option value="Hak Cipta / HKI Video atau Modul Pelatihan">
                Hak Cipta / HKI Video atau Modul Pelatihan
              </option>
            </select>
          </div>

          {/* Status Realisasi Luaran */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Status Realisasi Capaian Luaran Final <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={luaranAkhirRealisasi}
              onChange={(e) => setLuaranAkhirRealisasi(e.target.value)}
              placeholder="Contoh: Terbit / Published (Selesai Penuh) / Sertifikat HKI Terdaftar"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold text-slate-800"
            />
          </div>

          {/* Tautan URL Bukti Luaran */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Tautan / URL Bukti Luaran Publikasi / Video Mitra (Opsional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </span>
              <input
                type="url"
                value={luaranAkhirLink}
                onChange={(e) => setLuaranAkhirLink(e.target.value)}
                placeholder="https://journal.stmik-time.ac.id/pkm/article/view/1024"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Keterangan Final */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              Keterangan Penutup & Keberlanjutan Program Mitra
            </label>
            <textarea
              value={luaranAkhirKeterangan}
              onChange={(e) => setLuaranAkhirKeterangan(e.target.value)}
              placeholder="Tuliskan catatan evaluasi dampak bagi mitra sasaran, rencana tindak lanjut pembinaan, atau rekomendasi program bagi LPPM..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400 leading-relaxed font-normal"
            />
          </div>

          {/* Tombol Simpan & Kirim */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/dosen/pengabdian/akhir")}
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
              <span>Kirimkan Laporan Akhir PKM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

