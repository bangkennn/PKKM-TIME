"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "./account-management";

export function CreateAccountForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [groups, setGroups] = useState<UserRole>("dosen");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Nama lengkap beserta gelar wajib diisi.");
      return;
    }
    if (!username.trim()) {
      setErrorMessage("Username / NIDN wajib diisi.");
      return;
    }
    if (!password) {
      setErrorMessage("Kata sandi awal wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Kata sandi awal minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim() || undefined,
          groups,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal membuat akun.");
        toast.error(data.error || "Gagal membuat akun.");
        return;
      }

      toast.success(data.message || "Akun baru berhasil dibuat!");
      router.push("/admin/account");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala koneksi";
      setErrorMessage("Tidak dapat terhubung ke server SiPANDU.");
      toast.error(`Koneksi gagal: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mr-auto pt-2">
      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 mb-5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Formulir Langsung Rata Kiri (Tanpa Kartu Pembungkus) */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Nama Lengkap & Gelar */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nama Lengkap & Gelar <span className="text-rose-500">*</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <input
              type="text"
              placeholder="Contoh: Dr. Ir. Hendra Wijaya, M.Kom."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* 2. Username / NIDN */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Username / NIDN <span className="text-rose-500">*</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <input
              type="text"
              placeholder="Contoh: 0123456789 atau dosen01"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Gunakan nomor identitas unik (NIDN/NIDK untuk Dosen, atau username sistem).
          </p>
        </div>

        {/* 3. Alamat Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Alamat Email <span className="text-slate-400 text-[11px] font-normal">(Opsional)</span>
          </label>
          <div className="rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <input
              type="email"
              placeholder="nama@stmik-time.ac.id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* 4. Settingan Groups (Peran Akses) */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            Settingan Groups (Peran Pengguna) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                role: "dosen" as UserRole,
                title: "Dosen",
                desc: "Tridharma & Riset",
                icon: GraduationCap,
                color: "text-blue-600",
              },
              {
                role: "lpmi" as UserRole,
                title: "Tim LPMI",
                desc: "Penjaminan Mutu",
                icon: ShieldCheck,
                color: "text-emerald-600",
              },
              {
                role: "admin" as UserRole,
                title: "Administrator",
                desc: "Kelola Sistem & Akun",
                icon: ShieldAlert,
                color: "text-purple-600",
              },
            ].map((card) => {
              const isSelected = groups === card.role;
              const IconComp = card.icon;
              return (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => setGroups(card.role)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-slate-300 bg-white shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComp className={`w-4 h-4 ${card.color}`} />
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {card.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {card.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Kata Sandi Awal */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Kata Sandi Awal <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setPassword("password123");
                setShowPassword(true);
                if (errorMessage) setErrorMessage(null);
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Gunakan Default: password123
            </button>
          </div>

          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 6. Tombol Aksi Simpan & Kembali */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan Akun...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Buat Akun</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/account")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Akun</span>
          </button>
        </div>
      </form>
    </div>
  );
}

