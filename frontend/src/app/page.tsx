"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Headphones, 
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      const msg = "NIDN atau Nama Pengguna wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!password) {
      const msg = "Kata sandi akun wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      // Menggunakan endpoint /resr/api/login (didukung pula oleh /rest/api/login)
      const res = await fetch("/resr/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText = data.error || "Kredensial tidak valid. Silakan coba kembali.";
        setErrorMessage(errorText);
        toast.error(errorText);
        return;
      }

      // Simpan JWT token dan data user ke localStorage & Cookie
      localStorage.setItem("sipandu_token", data.token);
      localStorage.setItem("sipandu_user", JSON.stringify(data.user));
      document.cookie = `sipandu_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

      toast.success(data.message || "Login berhasil!");

      // Arahkan pengguna ke dashboard sesuai role groups (dosen / lpmi / admin)
      router.push(data.redirectUrl);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kendala koneksi ke server";
      setErrorMessage("Tidak dapat terhubung ke server SiPANDU. Pastikan backend aktif.");
      toast.error(`Koneksi gagal: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Subtle Ambient Glow Background Orbs */}
      <div className="absolute -top-36 -left-36 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -right-36 w-96 h-96 bg-indigo-200/35 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Container wrapping Login Card + Direct Sub-card Footer */}
      <div className="w-full max-w-5xl space-y-4 my-auto relative z-10">
        {/* Main Login Card */}
        <div className="w-full bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(13,61,120,0.16)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Brand Hero Panel (Deep Campus Navy Gradient) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c3873] via-[#0d3d78] to-[#07254e] relative overflow-hidden flex flex-col justify-between p-8 sm:p-10 text-white min-h-[460px] lg:min-h-[580px]">
            {/* Background Watermark Logo STMIK TIME (Colored original emblem) */}
            <div className="absolute -bottom-10 -right-10 w-80 sm:w-96 h-80 sm:h-96 pointer-events-none select-none opacity-20 filter brightness-110 contrast-105 overflow-hidden">
              <Image
                src="/img/Logo.png"
                alt="STMIK TIME Watermark"
                width={400}
                height={400}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Top Brand Pill & Headings */}
            <div className="relative z-10 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase text-white/95 bg-white/10 backdrop-blur-md border border-white/20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
                PORTAL SiPANDU LPPM
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
                  SiPANDU<br />
                  <span className="text-xl sm:text-2xl font-bold text-blue-100/90 block mt-1.5 font-sans">
                    Sistem Penelitian dan Pengabdian Dosen Terpadu
                  </span>
                </h1>
                <p className="text-sm text-blue-100/80 leading-relaxed font-normal max-w-sm">
                  Akses gerbang tunggal bagi Dosen dan Peneliti STMIK TIME untuk pengajuan proposal, pelaporan kemajuan riset, publikasi ilmiah, dan program pengabdian masyarakat di bawah koordinasi LPPM.
                </p>
              </div>
            </div>

            {/* Bottom Left Glassmorphism Support Pill */}
            <div className="relative z-10 pt-6">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100/90 shadow-2xs">
                <Headphones className="w-4 h-4 text-blue-300 shrink-0" />
                <span>
                  Kendala teknis? Hubungi{" "}
                  <a
                    href="mailto:lppm@stmik-time.ac.id"
                    className="font-semibold text-white underline hover:text-blue-200 transition-colors"
                  >
                    lppm@stmik-time.ac.id
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <form 
            onSubmit={handleLoginSubmit}
            className="lg:col-span-7 bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between"
          >
            {/* Top Section: Logo Bar + Title + Inputs + Remember Me */}
            <div>
              {/* Form Top Bar (Mentok di Atas) */}
              <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-4">
                <div className="flex items-center">
                  <Image
                    src="/img/STMIK TIME HORIZONTAL.png"
                    alt="STMIK TIME"
                    width={190}
                    height={50}
                    className="h-9 sm:h-10 w-auto object-contain"
                    priority
                  />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50/90 border border-blue-200/80 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portal Resmi SiPANDU</span>
                </div>
              </div>

              {/* Form Title & Subtitle (Dekat dengan garis di atas) */}
              <div className="space-y-1.5 mb-5">
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  Silakan masukkan kredensial akun Dosen atau Pengelola LPPM untuk mengakses sistem SiPANDU.
                </p>
              </div>

              {/* Alert Error Box jika Login Gagal */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 mb-4 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-4">
                {/* NIDN / Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    NIDN / Nama Pengguna
                  </label>
                  <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/50 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 transition-all duration-200 shadow-2xs">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Masukkan NIDN atau Nama Pengguna Anda"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Kata Sandi Akun
                  </label>
                  <div className="relative rounded-xl border border-zinc-200 bg-zinc-50/50 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 transition-all duration-200 shadow-2xs">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi Anda"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors cursor-pointer"
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 hover:text-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Silakan hubungi administrator LPPM di lppm@stmik-time.ac.id untuk bantuan reset kata sandi.");
                    }}
                    className="font-semibold text-blue-900 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Lupa kata sandi?
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Action Section: Tombol Mentok di Bawah */}
            <div className="pt-8 mt-auto">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0d3d78] via-[#10478a] to-[#144f97] hover:from-[#0a3060] hover:to-[#0f4382] active:scale-[0.99] transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Portal SiPANDU</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sub-card Footer (Positioned right below the card) */}
        <footer className="w-full px-3 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2.5 pt-1">
          <div>
            © 2026 SiPANDU • LPPM STMIK TIME. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a href="#" className="hover:text-zinc-800 transition-colors">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-800 transition-colors">
              Syarat & Ketentuan
            </a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-800 transition-colors">
              Panduan LPPM
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
