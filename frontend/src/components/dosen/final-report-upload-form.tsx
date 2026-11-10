"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileUp,
  Award,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ResearchProposal } from "./research-management";

export function FinalReportUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");

  const [proposal, setProposal] = useState<ResearchProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [fileAkhir, setFileAkhir] = useState("Laporan_Akhir_Penelitian_STMIK_TIME.pdf");
  const [luaranAkhirJenis, setLuaranAkhirJenis] = useState("Jurnal Nasional Terakreditasi (SINTA 1-6)");
  const [luaranAkhirRealisasi, setLuaranAkhirRealisasi] = useState("Terbit / Published (Selesai Penuh)");
  const [luaranAkhirLink, setLuaranAkhirLink] = useState("https://journal.stmik-time.ac.id/article/view/1024");
  const [luaranAkhirKeterangan, setLuaranAkhirKeterangan] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) {
      toast.error("ID proposal penelitian tidak valid.");
      router.push("/dosen/penelitian/akhir");
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/resr/api/research/${proposalId}`);
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
          toast.error(data.error || "Gagal memuat detail usulan.");
          router.push("/dosen/penelitian/akhir");
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
      setErrorMessage("Nama dokumen berkas laporan akhir wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/resr/api/research/${proposalId}/akhir`, {
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
        toast.success(data.message || "Laporan akhir berhasil dikirimkan ke LPPM!");
        window.dispatchEvent(new Event("sipandu-research-updated"));
        router.push("/dosen/penelitian/akhir");
      } else {
        setErrorMessage(data.error || "Gagal mengirimkan laporan akhir.");
        toast.error(data.error || "Gagal mengirimkan laporan akhir.");
      }
    } catch {
      setErrorMessage("Terjadi kendala koneksi ke server SiPANDU.");
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
        <p className="font-semibold text-slate-700">Memuat data usulan riset...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tombol Kembali */}
      <button
        type="button"
        onClick={() => router.push("/dosen/penelitian/akhir")}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Laporan Akhir</span>
      </button>

      {/* Ringkasan Konteks Proposal */}
      {proposal && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
              Tahap 3 : Pelaporan Akhir & Pengesahan Riset
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{proposal.academic_year}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {proposal.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Pengusul: <strong className="text-slate-700">{proposal.author_name}</strong>
            </span>
            <span>•</span>
            <span>
              Skema: <strong className="text-slate-700">{proposal.scheme}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6"
      >
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Unggah Berkas Laporan Akhir & Bukti Capaian Luaran Final
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan akhir merupakan laporan pertanggungjawaban penutup. Setelah disetujui LPPM, status penelitian ini akan resmi dinyatakan selesai.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Berkas Laporan Akhir */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Dokumen Berkas Laporan Akhir Resmi (PDF) <span className="text-rose-500">*</span>
          </label>
          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 transition-colors flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {fileAkhir || "Pilih dokumen laporan akhir"}
            </p>
            <p className="text-[11px] text-slate-400">
              Format didukung: PDF (Maksimal 20 MB)
            </p>
          </div>
          <div className="pt-1">
            <input
              type="text"
              value={fileAkhir}
              onChange={(e) => setFileAkhir(e.target.value)}
              placeholder="Nama file dokumen laporan akhir"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
            />
          </div>
        </div>

        {/* 2. Jenis Luaran Final & Realisasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Jenis Luaran Final <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranAkhirJenis}
              onChange={(e) => setLuaranAkhirJenis(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            >
              <option value="Jurnal Nasional Terakreditasi (SINTA 1-6)">
                Jurnal Nasional Terakreditasi (SINTA 1-6)
              </option>
              <option value="Jurnal Internasional Bereputasi (Scopus / WoS)">
                Jurnal Internasional Bereputasi (Scopus / WoS)
              </option>
              <option value="Prosiding Seminar Ilmiah Nasional / Internasional">
                Prosiding Seminar Ilmiah Nasional / Internasional
              </option>
              <option value="Hak Cipta / Paten / HKI">
                Hak Cipta / Paten / HKI
              </option>
              <option value="Prototipe Sistem / Perangkat Lunak Teruji">
                Prototipe Sistem / Perangkat Lunak Teruji
              </option>
              <option value="Buku Ajar / Monograf Ber-ISBN">
                Buku Ajar / Monograf Ber-ISBN
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Status Realisasi Capaian Final <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranAkhirRealisasi}
              onChange={(e) => setLuaranAkhirRealisasi(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold text-emerald-700"
            >
              <option value="Terbit / Published (Selesai Penuh)">
                Terbit / Published (Selesai Penuh)
              </option>
              <option value="Terdaftar Resmi di DJKI (Sertifikat Terbit)">
                Terdaftar Resmi di DJKI (Sertifikat Terbit)
              </option>
              <option value="Diterima / Accepted (LoA Terbit)">
                Diterima / Accepted (LoA Terbit)
              </option>
              <option value="Prototipe Selesai Diuji Coba di Kampus">
                Prototipe Selesai Diuji Coba di Kampus
              </option>
            </select>
          </div>
        </div>

        {/* 3. Tautan / Link Bukti Luaran */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Tautan / Link Bukti Luaran (DOI / URL Jurnal / Google Drive Berkas)
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={luaranAkhirLink}
              onChange={(e) => setLuaranAkhirLink(e.target.value)}
              placeholder="https://journal.stmik-time.ac.id/article/view/..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
            />
          </div>
        </div>

        {/* 4. Ringkasan & Keterangan Hasil Riset */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Ringkasan & Catatan Pertanggungjawaban Akhir
          </label>
          <textarea
            value={luaranAkhirKeterangan}
            onChange={(e) => setLuaranAkhirKeterangan(e.target.value)}
            rows={4}
            placeholder="Jelaskan kesimpulan akhir penelitian, kontribusi hasil bagi kampus STMIK TIME dan masyarakat, serta rekomendasi penelitian selanjutnya..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dosen/penelitian/akhir")}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-900/15 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Kirimkan Laporan Akhir ke LPPM</span>
          </button>
        </div>
      </form>
    </div>
  );
}

