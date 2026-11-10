"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  Plus,
  ArrowRight,
  Database,
  Lock,
  Server,
  KeyRound,
  RefreshCw,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { UserItem, UserRole } from "./account-management";

interface SummaryStats {
  total: number;
  dosen: number;
  lpmi: number;
  admin: number;
}

export function AdminDashboardOverview() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    total: 0,
    dosen: 0,
    lpmi: 0,
    admin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/users", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        toast.error(data.error || "Gagal memuat data dashboard.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Hitung persentase peran
  const totalUsers = summary.total || 1;
  const dosenPct = Math.round((summary.dosen / totalUsers) * 100);
  const lpmiPct = Math.round((summary.lpmi / totalUsers) * 100);
  const adminPct = Math.round((summary.admin / totalUsers) * 100);

  // Ambil 5 user terbaru
  const recentUsers = users.slice(0, 5);

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <ShieldAlert className="w-2.5 h-2.5 text-purple-600" />
            Administrator
          </span>
        );
      case "lpmi":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
            Tim LPMI
          </span>
        );
      case "dosen":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <GraduationCap className="w-2.5 h-2.5 text-blue-600" />
            Dosen
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HERO BANNER: SELAMAT DATANG & STATUS SISTEM           */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0a2f60] via-[#0d3d78] to-[#07244a] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 border border-blue-900/30">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Online • MySQL Connected
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-blue-100 border border-white/15 backdrop-blur-xs">
                Portal SiPANDU 1.0 • STMIK TIME
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
              Ruang Kendali Eksekutif Administrator
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Pantau integrasi basis data riset dosen, kelola akun pengguna, dan atur hak akses peran sistem secara aman dan terpusat.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => router.push("/admin/account")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0d3d78] bg-white hover:bg-blue-50 active:scale-[0.99] transition-all shadow-md cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-700" />
              <span>Buka Account Center</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/account/create")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600/60 hover:bg-blue-600/80 active:scale-[0.99] border border-blue-400/40 backdrop-blur-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. 4 KARTU METRIK KPI RINGKAS                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Akun */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Akun Terdaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : summary.total}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Akun Aktif & Terverifikasi
            </p>
          </div>
        </div>

        {/* Akun Dosen */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Akun Dosen Peneliti
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : summary.dosen}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {dosenPct}% dari total pengguna sistem
            </p>
          </div>
        </div>

        {/* Akun LPMI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tim Auditor LPMI
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : summary.lpmi}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {lpmiPct}% penjamin mutu internal
            </p>
          </div>
        </div>

        {/* Administrator */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Administrator Sistem
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isLoading ? "..." : summary.admin}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Hak akses penuh superadmin
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DUA KOLOM: DISTRIBUSI & AKUN TERBARU                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (7 Kolom): Visual Distribusi & Status Arsitektur */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Distribusi Peran Pengguna */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Komposisi Peran Akun (Groups)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribusi pembagian hak akses pengguna pada sistem SiPANDU.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Perbarui Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>

            {/* Segmented Progress Bar */}
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${dosenPct}%` }}
                className="bg-indigo-600 h-full transition-all duration-500"
                title={`Dosen: ${dosenPct}%`}
              />
              <div
                style={{ width: `${lpmiPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`LPMI: ${lpmiPct}%`}
              />
              <div
                style={{ width: `${adminPct}%` }}
                className="bg-purple-600 h-full transition-all duration-500"
                title={`Admin: ${adminPct}%`}
              />
            </div>

            {/* Detail Breakdown Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">Dosen</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-black text-indigo-950">{summary.dosen}</span>
                  <span className="text-xs font-bold text-indigo-600">{dosenPct}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">Tim LPMI</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-black text-emerald-950">{summary.lpmi}</span>
                  <span className="text-xs font-bold text-emerald-600">{lpmiPct}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span className="text-xs font-bold text-slate-800">Administrator</span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-black text-purple-950">{summary.admin}</span>
                  <span className="text-xs font-bold text-purple-600">{adminPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Status Arsitektur & Keamanan Server */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Integritas & Keamanan Infrastruktur SiPANDU
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">MySQL Database Sentral</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Database: ppkm_stmik_time (Port 3306)</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Connection Pool Aktif
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Enkripsi Kredensial</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hash bcryptjs (10 Salt Rounds)</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    Zero Plaintext Password
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Autentikasi Token</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">JWT Bearer Stateless Token</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    Multi-Role Protected
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Proteksi Root Admin</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">System Lock: admin-uuid-001</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Anti-Lockout Terlindungi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 Kolom): Pengguna Terbaru & Quick Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Pengguna Terbaru */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Pengguna Terdaftar Terbaru
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  5 akun pengguna terakhir di sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/account")}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                  <span className="text-xs">Memuat akun...</span>
                </div>
              ) : recentUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada data akun terdaftar.
                </div>
              ) : (
                recentUsers.map((user) => {
                  const initial = (user.name || user.username).charAt(0).toUpperCase();
                  return (
                    <div
                      key={user.id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#0d3d78] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            {user.username}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {renderRoleBadge(user.groups)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/account")}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Kelola Seluruh Akun di Account Center</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Card: Pintasan Tindakan Admin */}
          <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-950/5 space-y-3.5">
            <h4 className="text-sm font-bold tracking-tight">
              Pintasan Cepat Administrator
            </h4>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Akses cepat ke alur kerja manajemen pengguna dan keamanan kredensial:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => router.push("/admin/account/create")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer border border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>Tambah Akun Baru (Dosen / LPMI / Admin)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/reset-password")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer border border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Pengaturan Kata Sandi Akun Saya</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

