"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Users,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export type UserRole = "dosen" | "lpmi" | "admin";

export interface UserItem {
  id: string;
  username: string;
  name: string;
  groups: UserRole;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface SummaryStats {
  total: number;
  dosen: number;
  lpmi: number;
  admin: number;
}

export function AccountManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    total: 0,
    dosen: 0,
    lpmi: 0,
    admin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // State Modal Edit Akun
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editGroup, setEditGroup] = useState<UserRole>("dosen");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // State Modal Reset Password
  const [resetTarget, setResetTarget] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // State Modal Hapus Akun
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
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
        toast.error(data.error || "Gagal memuat data pengguna.");
      }
    } catch {
      toast.error("Terjadi kendala koneksi ke server saat memuat akun.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchGroup = selectedGroup === "all" || u.groups === selectedGroup;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q));
      return matchGroup && matchSearch;
    });
  }, [users, selectedGroup, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditName(user.name);
    setEditEmail(user.email || "");
    setEditGroup(user.groups);
    setEditError(null);
  };

  // Submit Edit Akun
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError("Nama lengkap wajib diisi.");
      return;
    }

    setIsEditing(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch(`/resr/api/users/${editTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim() || undefined,
          groups: editGroup,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEditError(data.error || "Gagal memperbarui data akun.");
        toast.error(data.error || "Gagal memperbarui data akun.");
        return;
      }

      toast.success(data.message || "Data akun berhasil diperbarui!");
      setEditTarget(null);
      fetchUsers();
    } catch {
      setEditError("Terjadi kendala koneksi ke server.");
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsEditing(false);
    }
  };

  // Open Reset Modal
  const handleOpenReset = (user: UserItem) => {
    setResetTarget(user);
    setNewPassword("password123");
    setResetError(null);
  };

  // Submit Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError(null);

    if (!newPassword || newPassword.length < 6) {
      setResetError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setIsResetting(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch(`/resr/api/users/${resetTarget.id}/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setResetError(data.error || "Gagal mengatur ulang kata sandi.");
        toast.error(data.error || "Gagal mengatur ulang kata sandi.");
        return;
      }

      toast.success(data.message || "Kata sandi akun berhasil diatur ulang!");
      setResetTarget(null);
    } catch {
      setResetError("Terjadi kendala koneksi ke server.");
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsResetting(false);
    }
  };

  // Submit Delete Akun
  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch(`/resr/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Gagal menghapus akun.");
        return;
      }

      toast.success(data.message || "Akun berhasil dihapus.");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Gagal terhubung ke server SiPANDU.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format Helper Badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            Administrator
          </span>
        );
      case "lpmi":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Tim LPMI
          </span>
        );
      case "dosen":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            Dosen
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Baris Kartu Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Akun
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : summary.total}
            </p>
          </div>
        </div>

        {/* Dosen */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Akun Dosen
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : summary.dosen}
            </p>
          </div>
        </div>

        {/* LPMI */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Akun LPMI
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : summary.lpmi}
            </p>
          </div>
        </div>

        {/* Administrator */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Administrator
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {isLoading ? "..." : summary.admin}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Filter, Pencarian & Tombol Tambah Akun */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input & Group Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIDN, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs transition-all"
            />
          </div>

          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs shrink-0">
            {[
              { id: "all", label: "Semua" },
              { id: "dosen", label: "Dosen" },
              { id: "lpmi", label: "LPMI" },
              { id: "admin", label: "Admin" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGroup(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer select-none ${
                  selectedGroup === tab.id
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
            onClick={fetchUsers}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer self-center hidden sm:flex items-center justify-center"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* Tombol Tambah Akun (Navigasi ke Halaman Pembuatan Akun) */}
        <button
          type="button"
          onClick={() => router.push("/admin/account/create")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.99] transition-all shadow-md shadow-blue-900/15 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* 3. Tabel Data Akun Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Pengguna</th>
                <th className="py-3.5 px-4">Username / NIDN</th>
                <th className="py-3.5 px-4">Peran (Group)</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Tanggal Dibuat</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Memuat data akun...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada akun ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? "Coba gunakan kata kunci pencarian yang berbeda."
                        : "Belum ada akun pada kategori grup ini."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const initial = (user.name || user.username).charAt(0).toUpperCase();
                  const isRootAdmin = user.id === "admin-uuid-001" || user.username === "admin";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Avatar & Nama */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0d3d78] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {user.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Username / NIDN */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {user.username}
                        </span>
                      </td>

                      {/* Role Group */}
                      <td className="py-3 px-4">
                        {renderRoleBadge(user.groups)}
                      </td>

                      {/* Tanggal Terdaftar */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Data Akun"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Tombol Reset Sandi */}
                          <button
                            type="button"
                            onClick={() => handleOpenReset(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Reset Kata Sandi"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Tombol Hapus */}
                          {!isRootAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL EDIT AKUN                                          */}
      {/* ======================================================== */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Data Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbarui profil dan peran akses untuk akun <span className="font-bold text-slate-700">{editTarget.username}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isEditing}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Username (Disabled) & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Username / NIDN (Terkunci)
                  </label>
                  <input
                    type="text"
                    value={editTarget.username}
                    disabled
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    disabled={isEditing}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Pilihan Role / Groups */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Settingan Groups (Peran Akses) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
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
                      title: "Admin",
                      desc: "Sistem & Kelola Akun",
                      icon: ShieldAlert,
                      color: "text-purple-600",
                    },
                  ].map((card) => {
                    const isSelected = editGroup === card.role;
                    const IconComp = card.icon;
                    return (
                      <button
                        key={card.role}
                        type="button"
                        onClick={() => setEditGroup(card.role)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-100"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <IconComp className={`w-4 h-4 ${card.color}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {card.title}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {card.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={isEditing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-md shadow-blue-900/15 cursor-pointer disabled:opacity-75"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Perbarui Data</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL RESET PASSWORD                                  */}
      {/* ======================================================== */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Kata Sandi Akun
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur ulang kata sandi untuk <span className="font-bold text-slate-700">{resetTarget.name}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              {resetError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword("password123")}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Setel ke: password123
                  </button>
                </div>

                <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isResetting}
                    className="w-full pl-3.5 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  disabled={isResetting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md shadow-amber-900/15 cursor-pointer disabled:opacity-75"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Terapkan Sandi Baru</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL KONFIRMASI HAPUS AKUN                           */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">{deleteTarget.name}</span> ({deleteTarget.username})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-75"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

