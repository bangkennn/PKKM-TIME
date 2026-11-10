"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { DashboardRole } from "./dashboard-layout";

interface ResetPasswordFormProps {
  role: DashboardRole;
}

export function ResetPasswordForm({ role }: ResetPasswordFormProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage("Kata sandi lama wajib diisi.");
      return;
    }
    if (!newPassword) {
      setErrorMessage("Kata sandi baru wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    if (currentPassword === newPassword) {
      setErrorMessage("Kata sandi baru tidak boleh sama dengan kata sandi lama.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const userStored = localStorage.getItem("sipandu_user") || localStorage.getItem("sikemas_user");
      let userId: string | undefined;

      if (userStored) {
        try {
          const parsed = JSON.parse(userStored);
          userId = parsed.id;
        } catch {
          // Ignored
        }
      }

      const res = await fetch("/resr/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal memperbarui kata sandi.");
        toast.error(data.error || "Gagal memperbarui kata sandi.");
        return;
      }

      toast.success(data.message || "Kata sandi Anda berhasil diperbarui!");
      router.push(`/${role}/dashboard`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kendala koneksi ke server";
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

      {/* Form Langsung Rata Kiri */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Kata Sandi Lama */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Kata Sandi Lama <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi lama Anda"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              aria-label={showCurrentPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Kata Sandi Baru */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tombol Kirim / Perbarui Kata Sandi */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Perbarui Kata Sandi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
