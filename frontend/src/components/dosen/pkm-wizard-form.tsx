"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Users,
  Target,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  FileUp,
} from "lucide-react";
import { toast } from "sonner";

export interface PkmTeamMember {
  id: string;
  name: string;
  role: string;
}

interface PkmWizardFormProps {
  mode?: "create" | "edit";
  proposalId?: string;
}

export function PkmWizardForm({ mode = "create", proposalId }: PkmWizardFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = proposalId || searchParams?.get("id") || "";
  const isEdit = mode === "edit";

  // Wizard Step State (1, 2, 3, 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Loading state saat mengambil proposal PKM yang ada untuk diedit
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEdit);

  // Step 1: Konten Utama PKM
  const [title, setTitle] = useState("");
  const [scheme, setScheme] = useState("PKM Kemitraan Masyarakat (PKM-M)");
  const [proposalYear, setProposalYear] = useState<number>(new Date().getFullYear());
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [pkmTopic, setPkmTopic] = useState("Pemberdayaan UMKM & Ekonomi Kreatif");
  const [rawBudget, setRawBudget] = useState<number>(20000000);
  const [displayBudget, setDisplayBudget] = useState<string>("20.000.000");

  // Step 2: Identitas Tim Pelaksana PKM (Multi-Dosen)
  const [teamMembers, setTeamMembers] = useState<PkmTeamMember[]>([
    {
      id: "1",
      name: "Dr. Dosen Teladan, M.Kom.",
      role: "Ketua Pengusul",
    },
  ]);

  // Step 3: Substansi & Target Luaran PKM
  const [luaranJenis, setLuaranJenis] = useState("Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA 1-6)");
  const [targetLuaranNama, setTargetLuaranNama] = useState("Disubmit di Jurnal Pengabdian SINTA 3");
  const [targetLuaranKeterangan, setTargetLuaranKeterangan] = useState("");

  // Step 4: Berkas Dokumen Usulan PKM
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Proposal_PKM_STMIK_TIME.pdf");
  const [customFileName, setCustomFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Jika mode Create, inisialisasi nama Ketua Pengusul dari akun login
  useEffect(() => {
    if (!isEdit) {
      try {
        const stored = localStorage.getItem("sipandu_user") || localStorage.getItem("sikemas_user");
        if (stored) {
          const user = JSON.parse(stored);
          if (user.name) {
            setTeamMembers((prev) => [
              {
                id: "1",
                name: user.name,
                role: "Ketua Pengusul",
              },
              ...prev.slice(1),
            ]);
          }
        }
      } catch {
        // Ignored
      }
    }
  }, [isEdit]);

  // Jika mode Edit, ambil data proposal PKM dari database
  useEffect(() => {
    if (isEdit && activeId) {
      const loadProposal = async () => {
        setIsLoadingExisting(true);
        try {
          const res = await fetch(`/resr/api/pkm/${activeId}`);
          const resData = await res.json();

          if (!res.ok || !resData.success || !resData.data) {
            toast.error(resData.error || "Gagal memuat data proposal PKM untuk diedit.");
            router.push("/dosen/pengabdian");
            return;
          }

          const prop = resData.data;

          // Proteksi: Proposal PKM yang sudah disetujui LPPM tidak boleh diedit
          if (prop.status_tahap1 === "approved") {
            toast.error("Proposal PKM ini telah disetujui LPPM dan tidak dapat diubah kembali.");
            router.push("/dosen/pengabdian");
            return;
          }

          setTitle(prop.title || "");
          setScheme(prop.scheme || "PKM Kemitraan Masyarakat (PKM-M)");
          setProposalYear(
            prop.proposal_year ||
              (prop.academic_year ? parseInt(prop.academic_year.split("/")[0]) : new Date().getFullYear())
          );
          setDurationMonths(prop.duration_months || 6);
          setPkmTopic(prop.pkm_topic || "Pemberdayaan UMKM & Ekonomi Kreatif");

          const budgetNum = Number(prop.budget) || 0;
          setRawBudget(budgetNum);
          setDisplayBudget(
            budgetNum > 0 ? String(budgetNum).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
          );

          // Parse Tim Pelaksana PKM
          let parsedTeam: PkmTeamMember[] = [];
          if (Array.isArray(prop.team_members)) {
            parsedTeam = prop.team_members.map((m: { name?: string; role?: string }, idx: number) => ({
              id: String(idx + 1),
              name: m.name || "",
              role: m.role || (idx === 0 ? "Ketua Pengusul" : "Anggota Pelaksana 1"),
            }));
          } else if (typeof prop.team_members === "string") {
            try {
              const arr = JSON.parse(prop.team_members);
              if (Array.isArray(arr)) {
                parsedTeam = arr.map((m: { name?: string; role?: string }, idx: number) => ({
                  id: String(idx + 1),
                  name: m.name || "",
                  role: m.role || (idx === 0 ? "Ketua Pengusul" : "Anggota Pelaksana 1"),
                }));
              }
            } catch {
              // Ignored
            }
          }

          if (parsedTeam.length === 0 && prop.author_name) {
            parsedTeam = [{ id: "1", name: prop.author_name, role: "Ketua Pengusul" }];
          }

          if (parsedTeam.length > 0) {
            setTeamMembers(parsedTeam);
          }

          setLuaranJenis(prop.luaran_jenis || "Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA 1-6)");
          setTargetLuaranNama(prop.target_luaran_nama || "");
          setTargetLuaranKeterangan(prop.target_luaran_keterangan || "");
          setFileName(prop.file_name || "Proposal_PKM_STMIK_TIME.pdf");
          setCustomFileName(prop.file_custom_name || "");
        } catch {
          toast.error("Terjadi kesalahan saat memuat data proposal PKM.");
          router.push("/dosen/pengabdian");
        } finally {
          setIsLoadingExisting(false);
        }
      };

      loadProposal();
    }
  }, [isEdit, activeId, router]);

  // Handler Biaya dengan Separator Ribuan Realtime
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setRawBudget(0);
      setDisplayBudget("");
      return;
    }

    const num = parseInt(rawVal, 10);
    setRawBudget(num);
    const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setDisplayBudget(formatted);
  };

  // Handler Tambah Anggota Pelaksana di Step 2
  const handleAddMember = () => {
    const newId = String(Date.now());
    const memberCount = teamMembers.length;
    const defaultRole =
      memberCount === 1
        ? "Anggota Pelaksana 1"
        : memberCount === 2
        ? "Anggota Pelaksana 2"
        : "Anggota Dosen";
    setTeamMembers((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        role: defaultRole,
      },
    ]);
  };

  // Handler Hapus Anggota Pelaksana di Step 2
  const handleRemoveMember = (id: string) => {
    if (teamMembers.length <= 1) {
      toast.error("Minimal harus memiliki 1 dosen sebagai Ketua Pengusul.");
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Handler Update Anggota Pelaksana
  const handleUpdateMember = (id: string, field: "name" | "role", value: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Handler Pilih Berkas di Step 4
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validExtensions = [".pdf", ".docx", ".doc"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        toast.error("Format berkas harus berupa dokumen PDF (.pdf) atau Word (.docx / .doc).");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  // Navigasi Langkah Berikutnya
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi Langkah 1
    if (currentStep === 1) {
      if (!title.trim()) {
        setErrorMessage("Judul kegiatan pengabdian wajib diisi.");
        return;
      }
      if (title.trim().length < 5) {
        setErrorMessage("Judul kegiatan minimal 5 karakter.");
        return;
      }
      if (rawBudget <= 0) {
        setErrorMessage("Estimasi biaya pengabdian wajib diisi berupa angka positif.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Validasi Langkah 2
    if (currentStep === 2) {
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (!member.name.trim()) {
          setErrorMessage(`Nama dosen pada baris ke-${i + 1} (${member.role}) wajib diisi.`);
          return;
        }
      }
      setCurrentStep(3);
      return;
    }

    // Validasi Langkah 3
    if (currentStep === 3) {
      if (!targetLuaranNama.trim()) {
        setErrorMessage("Target capaian luaran PKM wajib diisi.");
        return;
      }
      setCurrentStep(4);
      return;
    }
  };

  // Submit Final di Langkah 4 (Create via POST atau Edit via PUT)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fileName.trim()) {
      setErrorMessage("Berkas usulan dokumen proposal PKM wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const userStored = localStorage.getItem("sipandu_user") || localStorage.getItem("sikemas_user");
      let authorName: string | undefined = teamMembers[0]?.name;
      let userId: string | undefined;

      if (userStored) {
        try {
          const parsed = JSON.parse(userStored);
          userId = parsed.id;
          if (!authorName) {
            authorName = parsed.name;
          }
        } catch {
          // Ignored
        }
      }

      const originalFileExt = fileName.includes(".")
        ? fileName.substring(fileName.lastIndexOf("."))
        : ".pdf";

      let finalFileCustomName = fileName;
      if (customFileName.trim()) {
        finalFileCustomName = customFileName.trim().endsWith(originalFileExt)
          ? customFileName.trim()
          : `${customFileName.trim()}${originalFileExt}`;
      }

      const academicYear = `${proposalYear}/${proposalYear + 1}`;

      const endpoint = isEdit ? `/resr/api/pkm/${activeId}` : "/resr/api/pkm";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: title.trim(),
        scheme: scheme.trim(),
        academicYear,
        proposalYear,
        durationMonths,
        pkmTopic,
        budget: rawBudget,
        teamMembers: teamMembers.map((m) => ({ name: m.name.trim(), role: m.role.trim() })),
        luaranJenis,
        targetLuaranNama: targetLuaranNama.trim(),
        targetLuaranKeterangan: targetLuaranKeterangan.trim() || undefined,
        fileName,
        fileCustomName: finalFileCustomName,
        authorName,
        userId,
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || (isEdit ? "Gagal memperbarui proposal PKM." : "Gagal mengajukan proposal PKM."));
        toast.error(data.error || (isEdit ? "Gagal memperbarui proposal PKM." : "Gagal mengajukan proposal PKM."));
        return;
      }

      toast.success(
        data.message || (isEdit ? "Proposal PKM berhasil diperbarui!" : "Proposal PKM berhasil diajukan ke LPPM!")
      );
      window.dispatchEvent(new Event("sipandu-pkm-updated"));
      router.push("/dosen/pengabdian");
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server SiPANDU.");
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Konten Utama PKM", icon: FileText },
    { number: 2, title: "Identitas Tim PKM", icon: Users },
    { number: 3, title: "Substansi Luaran", icon: Target },
    { number: 4, title: "Berkas Usulan", icon: UploadCloud },
  ];

  if (isLoadingExisting) {
    return (
      <div className="max-w-4xl bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Memuat Data Usulan Proposal PKM...</h3>
        <p className="text-xs text-slate-400 mt-1">Mengambil data identitas, mitra, dan berkas dari pangkalan data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1 Card Tunggal: Stepper Visual + Form Content (Rata Kiri) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Header Stepper Visual (4 Langkah) */}
        <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((s) => {
              const Icon = s.icon;
              const isPassed = currentStep > s.number;
              const isCurrent = currentStep === s.number;

              return (
                <div
                  key={s.number}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-blue-50/90 border border-blue-200/80 shadow-2xs"
                      : isPassed
                      ? "bg-emerald-50/70 border border-emerald-100"
                      : "bg-slate-50 border border-slate-100 opacity-60"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-blue-700 text-white shadow-xs"
                        : isPassed
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-blue-700"
                          : isPassed
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      Langkah {s.number}
                    </p>
                    <p
                      className={`text-xs font-bold truncate ${
                        isCurrent
                          ? "text-slate-900"
                          : isPassed
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Container Formulir Wizard */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 1: KONTEN UTAMA PKM */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Langkah 1 : Konten Utama Pengabdian (PKM)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan judul kegiatan pengabdian, skema PKM, durasi pelaksanaan, serta pagu anggaran biaya.
                </p>
              </div>

              {/* Judul Kegiatan PKM */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Judul Kegiatan Pengabdian (PKM) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pendampingan Digitalisasi Usaha dan Pemasaran Berbasis E-Commerce bagi Pelaku UMKM Mandiri Kota Medan"
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 leading-relaxed font-semibold text-slate-800"
                />
              </div>

              {/* Skema & Topik PKM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Skema PKM <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={scheme}
                    onChange={(e) => setScheme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="PKM Kemitraan Masyarakat (PKM-M)">
                      PKM Kemitraan Masyarakat (PKM-M)
                    </option>
                    <option value="PKM Penerapan Iptek (PKM-PI)">
                      PKM Penerapan Iptek (PKM-PI)
                    </option>
                    <option value="PKM Kewirausahaan (PKM-K)">
                      PKM Kewirausahaan (PKM-K)
                    </option>
                    <option value="PKM Pengembangan Wilayah">
                      PKM Pengembangan Wilayah
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Bidang / Topik PKM <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={pkmTopic}
                    onChange={(e) => setPkmTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer font-medium"
                  >
                    <option value="Pemberdayaan UMKM & Ekonomi Kreatif">
                      Pemberdayaan UMKM & Ekonomi Kreatif
                    </option>
                    <option value="Literasi Digital & Teknologi Informasi Masyarakat">
                      Literasi Digital & Teknologi Informasi Masyarakat
                    </option>
                    <option value="Peningkatan Kualitas Pendidikan & Karakter">
                      Peningkatan Kualitas Pendidikan & Karakter
                    </option>
                    <option value="Penerapan Teknologi Tepat Guna Lingkungan">
                      Penerapan Teknologi Tepat Guna Lingkungan
                    </option>
                    <option value="Kesehatan Masyarakat & Sanitasi Lingkungan">
                      Kesehatan Masyarakat & Sanitasi Lingkungan
                    </option>
                  </select>
                </div>
              </div>

              {/* Tahun Usulan & Lama Kegiatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Tahun Usulan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={proposalYear}
                    onChange={(e) => setProposalYear(Number(e.target.value))}
                    min={2020}
                    max={2035}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Lama Kegiatan (Bulan) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      min={1}
                      max={36}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono font-semibold pr-16"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                      Bulan
                    </span>
                  </div>
                </div>
              </div>

              {/* Biaya Pengabdian (Live Thousand Separator) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Biaya Pengabdian (IDR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-700 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={displayBudget}
                    onChange={handleBudgetChange}
                    placeholder="0"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Tombol Lanjut ke Langkah 2 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => router.push("/dosen/pengabdian")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Daftar Pengabdian</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Lanjut: Tim Pelaksana PKM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 2: IDENTITAS TIM PELAKSANA PKM (REPEATER) */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Langkah 2 : Identitas Dosen Pelaksana & Tim PKM
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftarkan nama ketua pengusul serta anggota pelaksana pengabdian (dosen/mahasiswa).
                  </p>
                </div>

                {/* Tombol Tambah Anggota */}
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anggota</span>
                </button>
              </div>

              {/* Daftar Tim PKM */}
              <div className="space-y-3">
                {teamMembers.map((member, idx) => {
                  const isLeader = idx === 0;

                  return (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-all"
                    >
                      <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                        {idx + 1}
                      </div>

                      {/* Nama Pelaksana */}
                      <div className="flex-1 space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">
                          Nama Lengkap Dosen {isLeader ? "(Ketua Pelaksana)" : `(Anggota ${idx})`}
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateMember(member.id, "name", e.target.value)}
                          placeholder="Contoh: Dr. Ir. Pelaksana Pengabdian, M.Kom."
                          required
                          className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold text-slate-800"
                        />
                      </div>

                      {/* Peran PKM */}
                      <div className="w-full sm:w-56 space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase">
                          Peran dalam PKM
                        </label>
                        {isLeader ? (
                          <div className="px-3.5 py-2 rounded-xl text-xs bg-blue-50 border border-blue-200 font-bold text-blue-700">
                            Ketua Pengusul
                          </div>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMember(member.id, "role", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                          >
                            <option value="Anggota Pelaksana 1">Anggota Pelaksana 1</option>
                            <option value="Anggota Pelaksana 2">Anggota Pelaksana 2</option>
                            <option value="Anggota Dosen">Anggota Dosen</option>
                            <option value="Anggota Mahasiswa">Anggota Mahasiswa</option>
                          </select>
                        )}
                      </div>

                      {/* Tombol Hapus Baris */}
                      {!isLeader && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center"
                          title="Hapus baris anggota ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigasi Back / Next */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Konten Utama</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Lanjut: Substansi Luaran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 3: SUBSTANSI & RENCANA LUARAN PKM */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Langkah 3 : Substansi & Rencana Luaran PKM
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan jenis luaran pengabdian yang ditargetkan beserta capaian mitra dan spesifikasinya.
                </p>
              </div>

              {/* Jenis Luaran PKM */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Jenis Luaran Pengabdian (PKM) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={luaranJenis}
                  onChange={(e) => setLuaranJenis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer font-medium"
                >
                  <option value="Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA 1-6)">
                    Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA 1-6)
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

              {/* Target Capaian */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Target Capaian Luaran PKM <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetLuaranNama}
                  onChange={(e) => setTargetLuaranNama(e.target.value)}
                  placeholder="Contoh: Disubmit di Jurnal Pengabdian SINTA 3 / Terbit di Media Harian Nasional"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-semibold"
                />
              </div>

              {/* Keterangan Luaran */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Keterangan & Dampak bagi Mitra
                </label>
                <textarea
                  value={targetLuaranKeterangan}
                  onChange={(e) => setTargetLuaranKeterangan(e.target.value)}
                  placeholder="Jelaskan detail nama mitra sasaran, peningkatan omzet atau literasi yang diharapkan, serta kontribusi nyata bagi masyarakat binaan..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 leading-relaxed font-normal"
                />
              </div>

              {/* Navigasi Back / Next */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Tim Pelaksana</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Lanjut: Berkas Usulan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 4: BERKAS USULAN & SIMPAN SEBAGAI */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Langkah 4 : Dokumen Berkas Usulan Proposal PKM
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah naskah dokumen usulan proposal PKM dalam format PDF atau Word (.docx), dan tentukan nama berkas simpanan.
                </p>
              </div>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
              />

              {/* Dropzone Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFile ? selectedFile.name : fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti berkas`
                      : "Klik atau seret file PDF / DOCX Anda ke sini (Maksimal 20 MB)"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-white text-blue-700 border border-slate-200 shadow-2xs mt-1">
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Pilih Berkas dari Komputer</span>
                </span>
              </div>

              {/* Input Simpan Sebagai */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Simpan Sebagai (Opsional)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Jika kosong, otomatis memakai nama file asli
                  </span>
                </div>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Contoh: Proposal_PKM_Pemberdayaan_UMKM_2026"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>

              {/* Ringkasan Akhir Sebelum Kirim */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-2">
                <div className="font-bold text-blue-900">
                  <span>{isEdit ? "Konfirmasi Pembaruan Usulan PKM" : "Konfirmasi Akhir Usulan PKM"}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isEdit
                    ? "Dengan menekan tombol simpan di bawah, seluruh perubahan data proposal pengabdian masyarakat Anda akan resmi diperbarui dalam sistem LPPM STMIK TIME."
                    : "Dengan menekan tombol kirim di bawah, usulan kegiatan pengabdian masyarakat Anda akan resmi didaftarkan ke sistem LPPM STMIK TIME untuk ditinjau oleh tim verifikator."}
                </p>
              </div>

              {/* Navigasi Back / Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Substansi Luaran</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isEdit ? "Simpan Pembaruan Proposal PKM" : "Kirimkan Usulan Proposal PKM ke LPPM"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

