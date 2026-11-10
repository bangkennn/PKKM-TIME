"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  FolderDown,
  FolderOpen,
  Download,
  Copy,
  Check,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Layers,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  category: "proposal" | "laporan";
  title: string;
  filename: string;
  extension: "DOCX";
  size: string;
  version: string;
  updatedAt: string;
  description: string;
  highlights: string[];
}

export function GuideAndDocumentsView() {
  const [activeSection, setActiveSection] = useState<string>("panduan");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiTemplates, setApiTemplates] = useState<TemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ambil template dokumen terbaru dari basis data admin
  useEffect(() => {
    const fetchApiTemplates = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/resr/api/templates");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: TemplateItem[] = json.data.map(
            (item: {
              id: string;
              category: "proposal" | "laporan";
              title: string;
              filename: string;
              file_size?: string;
              version?: string;
              created_at: string;
              description?: string | null;
            }) => ({
              id: item.id,
              category: item.category,
              title: item.title,
              filename: item.filename.toLowerCase().endsWith(".docx")
                ? item.filename
                : `${item.filename}.docx`,
              extension: "DOCX" as const,
              size: item.file_size || "120 KB",
              version: item.version || "v2026.1",
              updatedAt: new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              description:
                item.description || "Format resmi dokumen Microsoft Word (.docx) LPPM STMIK TIME.",
              highlights: [
                "Format Resmi LPPM",
                "Dokumen Word (.docx)",
                "Standar Penilaian 2026",
              ],
            })
          );
          setApiTemplates(mapped);
        } else {
          setApiTemplates([]);
        }
      } catch {
        setApiTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiTemplates();
  }, []);

  // Set up scroll tracking for Scrollspy
  useEffect(() => {
    const sections = ["panduan", "template-proposal", "template-laporan"];

    const handleScroll = () => {
      // Jika posisi scroll berada di area paling atas, selalu aktifkan panduan
      if (window.scrollY < 120) {
        setActiveSection("panduan");
        window.dispatchEvent(
          new CustomEvent("sipandu-scrollspy-change", {
            detail: { id: "panduan" },
          })
        );
        return;
      }

      // Jika pengguna telah scroll sampai mendekati ujung paling bawah halaman
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80
      ) {
        const lastSection = sections[sections.length - 1];
        setActiveSection(lastSection);
        window.dispatchEvent(
          new CustomEvent("sipandu-scrollspy-change", {
            detail: { id: lastSection },
          })
        );
        return;
      }

      // Titik picu tepat di tengah layar (viewport vertical center)
      const midPoint = window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Jika batas atas section (judul) sudah mencapai atau melewati garis tengah layar
          if (rect.top <= midPoint) {
            setActiveSection(sections[i]);
            window.dispatchEvent(
              new CustomEvent("sipandu-scrollspy-change", {
                detail: { id: sections[i] },
              })
            );
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Handle hash on page load
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (hashId && hashId !== "panduan" && sections.includes(hashId)) {
        setTimeout(() => {
          scrollToSection(hashId);
        }, 150);
      } else {
        window.scrollTo(0, 0);
        handleScroll();
      }
    } else {
      window.scrollTo(0, 0);
      handleScroll();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === "panduan") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setActiveSection("panduan");
      window.dispatchEvent(
        new CustomEvent("sipandu-scrollspy-change", {
          detail: { id: "panduan" },
        })
      );
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
      window.dispatchEvent(
        new CustomEvent("sipandu-scrollspy-change", {
          detail: { id },
        })
      );
    }
  };

  const handleDownloadTemplate = async (template: TemplateItem) => {
    toast.loading(`Menyiapkan unduhan: ${template.filename}...`, { id: template.id });

    try {
      // Ambil file binary/base64 dari basis data jika diunggah oleh Admin
      const res = await fetch(`/resr/api/templates/${template.id}`);
      const json = await res.json();
      const base64Data = json?.data?.file_data;

      if (base64Data && base64Data.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = base64Data;
        link.download = template.filename.toLowerCase().endsWith(".docx")
          ? template.filename
          : `${template.filename}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss(template.id);
        toast.success(`Berhasil mengunduh template: ${link.download}`);
        return;
      }
    } catch {
      // Fallback ke generator template default
    }

    // Generator berkas .docx standar resmi LPPM STMIK TIME
    setTimeout(() => {
      const content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${template.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 40px; font-size: 12pt; line-height: 1.5; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
            .header h2 { margin: 0; font-size: 16pt; font-weight: bold; }
            .header h3 { margin: 4px 0; font-size: 13pt; font-weight: normal; }
            .header p { margin: 0; font-size: 10pt; color: #444; }
            .title-doc { text-align: center; font-weight: bold; font-size: 14pt; margin: 20px 0; text-transform: uppercase; }
            .section-title { font-weight: bold; font-size: 12pt; margin-top: 18px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #000; padding: 6px 10px; font-size: 11pt; }
            th { background-color: #f2f2f2; text-align: left; }
            .footer { margin-top: 40px; text-align: right; font-size: 11pt; }
          </style>
        </head>
        <body>
          <div class='header'>
            <h2>LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (LPPM)</h2>
            <h3>SEKOLAH TINGGI MANAJEMEN INFORMATIKA DAN KOMPUTER (STMIK) TIME</h3>
            <p>Jl. Merbabu No. 32 AA - BB, Medan | Telp: (061) 4561932 | Email: lppm@stmik-time.ac.id</p>
          </div>
          
          <div class='title-doc'>${template.title.toUpperCase()}</div>
          <p><strong>Nomor Versi:</strong> ${template.version} | <strong>Tanggal Terbit:</strong> ${template.updatedAt}</p>
          
          <div class='section-title'>I. IDENTITAS KEGIATAN</div>
          <table>
            <tr><td width='30%'>Judul Kegiatan</td><td>[ Tuliskan Judul Usulan / Kegiatan Lengkap ]</td></tr>
            <tr><td>Bidang Fokus / Topik</td><td>[ Pilih Sesuai Rencana Induk Riset LPPM ]</td></tr>
            <tr><td>Ketua Pengusul</td><td>[ Nama Lengkap & Gelar - NIDN / NIDK ]</td></tr>
            <tr><td>Perguruan Tinggi</td><td>STMIK TIME Medan</td></tr>
            <tr><td>Tahun Usulan / Durasi</td><td>2026 / [ Durasi Pelaksanaan Bulan ]</td></tr>
            <tr><td>Total Biaya Usulan</td><td>Rp. [ Nominal Usulan Sesuai RAB ]</td></tr>
          </table>

          <div class='section-title'>II. RINGKASAN SUBSTANSI</div>
          <p>Tuliskan ringkasan rencana kegiatan maksimal 500 kata yang memuat urgensi permasalahan, pendekatan pemecahan masalah, target luaran wajib, serta manfaat bagi institusi dan masyarakat.</p>

          <div class='section-title'>III. METODOLOGI & TAHAPAN PELAKSANAAN</div>
          <p>Uraikan tahapan pelaksanaan, rancangan teknis, tempat/lokasi kegiatan, dan pembagian tugas masing-masing anggota dosen maupun mahasiswa pendukung.</p>

          <div class='section-title'>IV. TARGET LUARAN & CAPAIAN</div>
          <table>
            <tr><th>No</th><th>Jenis Luaran</th><th>Target Capaian</th><th>Keterangan</th></tr>
            <tr><td>1</td><td>Publikasi Jurnal Ilmiah</td><td>Accepted / Published SINTA</td><td>Target Jurnal Bereputasi</td></tr>
            <tr><td>2</td><td>Hak Cipta / HKI</td><td>Granted Kemenkumham</td><td>Sistem Aplikasi / Modul</td></tr>
            <tr><td>3</td><td>Laporan Komprehensif</td><td>Draft 100% Selesai</td><td>Dokumen Resmi Kampus</td></tr>
          </table>

          <div class='footer'>
            <p>Medan, [ Tanggal Pengajuan ]<br><strong>Ketua Pelaksana Kegiatan,</strong><br><br><br><br><strong>( [ Nama Lengkap & Gelar ] )</strong><br>NIDN. [ ................................ ]</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([content], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = template.filename.toLowerCase().endsWith(".docx")
        ? template.filename
        : `${template.filename}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(template.id);
      toast.success(`Berhasil mengunduh template: ${link.download}`);
    }, 400);
  };

  const copyFilename = (filename: string, id: string) => {
    navigator.clipboard.writeText(filename);
    setCopiedId(id);
    toast.success(`Nama berkas '${filename}' disalin ke clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const proposalTemplates = apiTemplates.filter((t) => t.category === "proposal");
  const laporanTemplates = apiTemplates.filter((t) => t.category === "laporan");

  return (
    <div className="space-y-12">
      {/* ========================================================================= */}
      {/* SECTION 1: PANDUAN PENGGUNAAN & ALUR SISTEM */}
      {/* ========================================================================= */}
      <section id="panduan" className="space-y-6 pt-2 scroll-mt-24">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100/70 text-blue-700 uppercase tracking-wide">
                  SOP & ALUR SISTEM
                </span>
                <span className="text-xs text-slate-400">• Bagian 1</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Panduan Penggunaan SiPANDU LPPM
              </h2>
            </div>
          </div>
        </div>

        {/* 3-Stage Visual Flowchart Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Siklus 3 Tahapan Pelaksanaan Riset & Pengabdian Dosen</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Setiap usulan kegiatan Penelitian dan Pengabdian kepada Masyarakat (PKM) diatur secara terstruktur melalui tiga tahapan wajib:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage 1 */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                  TAHAP 1
                </span>
                <span className="text-[11px] font-semibold text-blue-700">Usulan Proposal</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Pengajuan & Review LPPM</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dosen mengisi 4 langkah formulir (Konten Utama, Susunan Tim Pengusul, Target Luaran, dan Unggah Berkas Proposal). Menunggu verifikasi dan persetujuan resmi dari pihak reviewer LPPM.
              </p>
              <div className="pt-2 border-t border-blue-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Gerbang pembuka riset</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-600 text-white shadow-2xs">
                  TAHAP 2
                </span>
                <span className="text-[11px] font-semibold text-amber-700">Laporan Kemajuan</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Monev Progres 70%</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Otomatis terbuka setelah usulan disetujui LPPM. Dosen mengunggah laporan kemajuan berkala, bukti logbook kegiatan lapangan, dan persentase capaian luaran antara.
              </p>
              <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Pencairan dana termin 2</span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                  TAHAP 3
                </span>
                <span className="text-[11px] font-semibold text-emerald-700">Laporan Akhir</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Pengesahan Status Selesai</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Terbuka setelah Laporan Kemajuan Tahap 2 diapprove LPPM. Pengunggahan naskah laporan akhir lengkap 100%, bukti fisik luaran, dan sertifikasi status kegiatan dinyatakan Selesai.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status tuntas & pengarsipan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Syarat & Ketentuan Umum Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Ketentuan Tim Pengusul</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Ketua pengusul wajib dosen tetap STMIK TIME yang memiliki NIDN/NIDK aktif.</li>
              <li>Jumlah anggota dosen minimal 1 orang dan maksimal 3 orang lintas prodi.</li>
              <li>Wajib melibatkan minimal 2 orang mahasiswa aktif STMIK TIME sebagai anggota.</li>
              <li>Seorang dosen hanya diperbolehkan menjadi Ketua pada 1 judul di tahun anggaran yang sama.</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <FileCheck2 className="w-4 h-4" />
              <span>Standar Berkas & Validasi Dokumen</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Format berkas yang diterima sistem adalah PDF (`.pdf`) atau Word (`.docx`).</li>
              <li>Ukuran berkas maksimal 10 MB per dokumen yang diunggah.</li>
              <li>Wajib menyertakan Lembar Pengesahan resmi yang telah ditandatangani.</li>
              <li>Tingkat kemiripan (plagiarisme Turnitin) proposal tidak boleh melebihi 25%.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: TEMPLATE BERKAS USULAN PROPOSAL */}
      {/* ========================================================================= */}
      <section id="template-proposal" className="space-y-6 pt-2 scroll-mt-24">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100/70 text-indigo-700 uppercase tracking-wide">
                  FORMAT RESMI TAHAP 1
                </span>
                <span className="text-xs text-slate-400">• Bagian 2</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Template Berkas Usulan Proposal
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Tersedia {proposalTemplates.length} berkas
          </span>
        </div>

        {/* Template Cards Grid */}
        {isLoading ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-2 animate-pulse">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1 animate-bounce" />
            <p className="text-xs font-bold text-slate-700">Memuat berkas template...</p>
            <p className="text-[11px] text-slate-400">Menghubungkan ke pusat berkas LPPM STMIK TIME</p>
          </div>
        ) : proposalTemplates.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-700">Belum Ada Template Proposal</p>
            <p className="text-[11px] text-slate-400">
              Berkas template resmi sedang dipersiapkan oleh Administrator LPPM.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposalTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Top: Badges & Extension */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-100 text-blue-800">
                        .DOCX
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {template.size} • {template.version}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{template.updatedAt}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {template.description}
                    </p>
                  </div>

                  {/* Highlights Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.highlights.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600"
                      >
                        <Check className="w-2.5 h-2.5 text-blue-600" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => copyFilename(template.filename, template.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Salin nama berkas"
                  >
                    {copiedId === template.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="truncate max-w-[130px] sm:max-w-[160px]">{template.filename}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(template)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TEMPLATE BERKAS LAPORAN & LOGBOOK */}
      {/* ========================================================================= */}
      <section id="template-laporan" className="space-y-6 pt-2 scroll-mt-24">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/70 text-amber-700 uppercase tracking-wide">
                  PELAPORAN & MONEV TAHAP 2 & 3
                </span>
                <span className="text-xs text-slate-400">• Bagian 3</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Template Berkas Laporan & Logbook
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Tersedia {laporanTemplates.length} berkas
          </span>
        </div>

        {/* Template Cards Grid */}
        {isLoading ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-2 animate-pulse">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1 animate-bounce" />
            <p className="text-xs font-bold text-slate-700">Memuat berkas template...</p>
            <p className="text-[11px] text-slate-400">Menghubungkan ke pusat berkas LPPM STMIK TIME</p>
          </div>
        ) : laporanTemplates.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-700">Belum Ada Template Laporan & Logbook</p>
            <p className="text-[11px] text-slate-400">
              Berkas template resmi sedang dipersiapkan oleh Administrator LPPM.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {laporanTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Card Top: Badges & Extension */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-amber-100 text-amber-800">
                        .{template.extension}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {template.size} • {template.version}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{template.updatedAt}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                      {template.description}
                    </p>
                  </div>

                  {/* Highlights Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {template.highlights.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600"
                      >
                        <Check className="w-2.5 h-2.5 text-amber-600" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => copyFilename(template.filename, template.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Salin nama berkas"
                  >
                    {copiedId === template.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="truncate max-w-[130px] sm:max-w-[160px]">{template.filename}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(template)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Support Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Memerlukan bantuan format khusus atau dokumen revisi? Hubungi Sekretariat LPPM STMIK TIME via email di{" "}
            <strong className="text-slate-800">lppm@stmik-time.ac.id</strong>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection("panduan")}
          className="text-blue-600 font-bold hover:underline shrink-0 cursor-pointer"
        >
          Kembali ke Atas ↑
        </button>
      </div>
    </div>
  );
}

