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
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { ResearchProposal } from "./research-management";

export function ProgressReportUploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get("id");

  const [proposal, setProposal] = useState<ResearchProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields
  const [fileKemajuan, setFileKemajuan] = useState(
    "Laporan_Kemajuan_Penelitian_STMIK_TIME.pdf"
  );
  const [luaranJenis, setLuaranJenis] = useState("Jurnal Nasional Terakreditasi (SINTA 1-6)");
  const [luaranTarget, setLuaranTarget] = useState("Disubmit / Menunggu Review Editor");
  const [luaranKeterangan, setLuaranKeterangan] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!proposalId) {
      toast.error("ID proposal penelitian tidak valid.");
      router.push("/dosen/penelitian/kemajuan");
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/resr/api/research/${proposalId}`);
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
          toast.error(data.error || "Gagal memuat detail usulan.");
          router.push("/dosen/penelitian/kemajuan");
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
      setErrorMessage("Nama dokumen berkas laporan kemajuan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/resr/api/research/${proposalId}/kemajuan`, {
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
        toast.success(data.message || "Laporan kemajuan berhasil dikirimkan ke LPPM!");
        window.dispatchEvent(new Event("sipandu-research-updated"));
        router.push("/dosen/penelitian/kemajuan");
      } else {
        setErrorMessage(data.error || "Gagal mengirimkan laporan kemajuan.");
        toast.error(data.error || "Gagal mengirimkan laporan kemajuan.");
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
        onClick={() => router.push("/dosen/penelitian/kemajuan")}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Laporan Kemajuan</span>
      </button>

      {/* Ringkasan Konteks Proposal */}
      {proposal && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
              Tahap 2 : Pelaporan Kemajuan
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
            Unggah Berkas Laporan Kemajuan & Data Luaran
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pastikan berkas dokumen laporan kemajuan telah disusun sesuai template LPPM dan data capaian luaran telah diisi dengan benar.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Berkas Laporan Kemajuan */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Dokumen Berkas Laporan Kemajuan (PDF) <span className="text-rose-500">*</span>
          </label>
          <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-colors flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {fileKemajuan || "Pilih dokumen laporan kemajuan"}
            </p>
            <p className="text-[11px] text-slate-400">
              Format didukung: PDF (Maksimal 15 MB)
            </p>
          </div>
          <div className="pt-1">
            <input
              type="text"
              value={fileKemajuan}
              onChange={(e) => setFileKemajuan(e.target.value)}
              placeholder="Nama file dokumen laporan kemajuan"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
            />
          </div>
        </div>

        {/* 2. Jenis Luaran Penelitian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Jenis Luaran Riset <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranJenis}
              onChange={(e) => setLuaranJenis(e.target.value)}
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

          {/* 3. Target Capaian */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Target Capaian Saat Ini <span className="text-rose-500">*</span>
            </label>
            <select
              value={luaranTarget}
              onChange={(e) => setLuaranTarget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            >
              <option value="Draf Naskah Selesai">Draf Naskah Selesai</option>
              <option value="Disubmit / Menunggu Review Editor">
                Disubmit / Menunggu Review Editor
              </option>
              <option value="Diterima / Accepted">Diterima / Accepted</option>
              <option value="Terbit / Published">Terbit / Published</option>
              <option value="Terdaftar Resmi di DJKI">Terdaftar Resmi di DJKI</option>
            </select>
          </div>
        </div>

        {/* 4. Keterangan / Catatan Progres */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Keterangan & Catatan Kemajuan Pelaksanaan
          </label>
          <textarea
            value={luaranKeterangan}
            onChange={(e) => setLuaranKeterangan(e.target.value)}
            rows={4}
            placeholder="Jelaskan progres penelitian saat ini, tahapan eksperimen yang telah diselesaikan, persentase capaian target, atau kendala yang dihadapi..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/dosen/penelitian/kemajuan")}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>Kirimkan Laporan Kemajuan ke LPPM</span>
          </button>
        </div>
      </form>
    </div>
  );
}

