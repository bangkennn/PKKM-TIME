"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Download,
  Trash2,
  FolderOpen,
  Calendar,
  Check,
  X,
  Upload,
  AlertTriangle,
  Loader2,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface DocumentTemplate {
  id: string;
  title: string;
  category: "proposal" | "laporan";
  description: string | null;
  filename: string;
  file_size: string;
  file_data?: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export function AdminTemplateManagement() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [summary, setSummary] = useState({ total: 0, proposal: 0, laporan: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "proposal" | "laporan">("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"proposal" | "laporan">("proposal");
  const [formDescription, setFormDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    base64: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/resr/api/templates");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        toast.error("Gagal memuat daftar template.");
      }
    } catch {
      toast.error("Kesalahan jaringan saat memuat template.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: must be .docx
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setUploadError("Hanya berkas berekstensi Microsoft Word (.docx) yang diperbolehkan.");
      toast.error("Format tidak valid! File wajib berekstensi .docx");
      e.target.value = "";
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Ukuran berkas melebihi batas maksimal 15 MB.");
      toast.error("Ukuran file maksimal 15 MB.");
      e.target.value = "";
      return;
    }

    const sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        base64: reader.result as string,
      });
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("proposal");
    setFormDescription("");
    setUploadedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Judul template wajib diisi.");
      return;
    }
    if (!uploadedFile) {
      toast.error("Berkas template format .docx wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/resr/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          category: formCategory,
          description: formDescription.trim(),
          filename: uploadedFile.name,
          file_size: uploadedFile.size,
          file_data: uploadedFile.base64,
          version: "v2026.1",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Template '${formTitle}' (.docx) berhasil ditambahkan.`);
        setIsAddModalOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        toast.error(data.message || "Gagal menambahkan template berkas.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menyimpan template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/resr/api/templates/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Template '${deleteTarget.title}' berhasil dihapus.`);
        setDeleteTarget(null);
        fetchTemplates();
      } else {
        toast.error(data.message || "Gagal menghapus template.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menghapus template.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (item: DocumentTemplate) => {
    try {
      toast.loading(`Mengunduh ${item.filename}...`, { id: item.id });
      // Fetch full file_data if not included
      const res = await fetch(`/resr/api/templates/${item.id}`);
      const data = await res.json();
      const base64Data = data?.data?.file_data || item.file_data;

      if (base64Data && base64Data.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = base64Data;
        link.download = item.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback generator
        const content = `Dokumen Template Resmi LPPM STMIK TIME: ${item.title}\nNama Berkas: ${item.filename}`;
        const blob = new Blob([content], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = item.filename.endsWith(".docx") ? item.filename : `${item.filename}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.dismiss(item.id);
      toast.success(`Berhasil mengunduh '${item.filename}'`);
    } catch {
      toast.dismiss(item.id);
      toast.error("Gagal mengunduh berkas template.");
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.filename.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [templates, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Baris 4 Kartu Ringkasan Template KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Template */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Template Berkas
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : summary.total}
            </p>
          </div>
        </div>

        {/* Template Proposal */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Template Proposal
            </p>
            <p className="text-xl font-black text-indigo-600 leading-tight">
              {isLoading ? "..." : summary.proposal}
            </p>
          </div>
        </div>

        {/* Template Laporan */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Template Laporan & Monev
            </p>
            <p className="text-xl font-black text-amber-600 leading-tight">
              {isLoading ? "..." : summary.laporan}
            </p>
          </div>
        </div>

        {/* Format Valid Standar (.DOCX) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Standar Format Dokumen
            </p>
            <p className="text-sm font-bold text-emerald-700 leading-tight">
              Microsoft Word (.docx)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Toolbar: Pencarian, Filter Kategori, & Tombol Tambah Template */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          {/* Input Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau nama berkas template..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Tab Filter Kategori */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs shrink-0">
            {[
              { id: "all", label: "Semua Kategori" },
              { id: "proposal", label: "Proposal" },
              { id: "laporan", label: "Laporan" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as "all" | "proposal" | "laporan")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer select-none ${
                  categoryFilter === tab.id
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
            onClick={fetchTemplates}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer self-center hidden sm:flex items-center justify-center"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* Tombol Tambah Template Baru */}
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Template Berkas (.docx)</span>
        </button>
      </div>

      {/* 3. Tabel Data Template Berkas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Judul Dokumen & Deskripsi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Nama Berkas (.docx) & Ukuran</th>
                <th className="py-3.5 px-4">Versi & Tanggal</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Memuat daftar template berkas...</span>
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada template berkas ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik tombol &quot;Tambah Template Berkas (.docx)&quot; untuk mengunggah dokumen baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Judul & Deskripsi */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{item.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description || "Tidak ada deskripsi tambahan."}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kategori Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.category === "proposal" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          Template Proposal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          Template Laporan
                        </span>
                      )}
                    </td>

                    {/* Nama Berkas & Ukuran */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                          .DOCX
                        </span>
                        <span className="truncate max-w-[200px] text-xs">{item.filename}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.file_size}</p>
                    </td>

                    {/* Versi & Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700">{item.version}</span>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Tombol Unduh / Cek Berkas */}
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 transition-colors cursor-pointer"
                          title="Unduh Berkas (.docx)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 transition-colors cursor-pointer"
                          title="Hapus Berkas Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL TAMBAH TEMPLATE BERKAS (.DOCX) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Tambah Berkas Template Baru (.docx)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dokumen ini akan langsung tersedia untuk diunduh oleh dosen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              {/* Judul Template */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Judul Template Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Misal: Template Proposal Penelitian Terapan 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Kategori Berkas */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Kategori Berkas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCategory("proposal")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formCategory === "proposal"
                        ? "bg-blue-50 border-blue-600 text-blue-700 shadow-2xs font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Template Proposal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory("laporan")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formCategory === "laporan"
                        ? "bg-amber-50 border-amber-600 text-amber-700 shadow-2xs font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Template Laporan</span>
                  </button>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Penjelasan isi dan kegunaan template berkas ini bagi dosen..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Upload Berkas .DOCX */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>
                    Unggah File Template <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Wajib format .docx
                  </span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    uploadedFile
                      ? "border-emerald-400 bg-emerald-50/40"
                      : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-medium">
                            {uploadedFile.size} • Siap diunggah
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        Klik untuk memilih berkas <span className="text-blue-600">.docx</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Maksimal ukuran file 15 MB (Microsoft Word)
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadedFile}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-900/15"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Template (.docx)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS TEMPLATE */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Hapus Template Berkas?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Template <strong className="text-slate-800">&quot;{deleteTarget.title}&quot;</strong> ({deleteTarget.filename}) akan dihapus permanen dari sistem dan tidak dapat lagi diunduh oleh dosen.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTemplate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-900/15"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Ya, Hapus Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

