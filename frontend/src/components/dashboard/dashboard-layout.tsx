"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Shield, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Award,
  ClipboardCheck,
  CheckCircle2,
  Settings,
  FolderOpen,
  FolderDown,
  KeyRound,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export type DashboardRole = "dosen" | "lpmi" | "admin";

interface DashboardLayoutProps {
  role: DashboardRole;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

interface UserProfile {
  id?: string;
  username?: string;
  name?: string;
  groups?: string;
  email?: string;
}

interface SubMenuItem {
  name: string;
  active?: boolean;
}

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  scrollId?: string;
  subItems?: SubMenuItem[];
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export function DashboardLayout({
  role,
  title = "Dashboard",
  subtitle,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeScrollSection, setActiveScrollSection] = useState<string>("panduan");
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Penelitian: true, // Default terbuka
    "Pengabdian (PKM)": false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isStage2Unlocked, setIsStage2Unlocked] = useState(false);
  const [isStage3Unlocked, setIsStage3Unlocked] = useState(false);
  const [isPkmStage2Unlocked, setIsPkmStage2Unlocked] = useState(false);
  const [isPkmStage3Unlocked, setIsPkmStage3Unlocked] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleParentClick = (itemName: string) => {
    if (itemName === "Penelitian") {
      setOpenDropdowns((prev) => ({ ...prev, Penelitian: true }));
      router.push("/dosen/penelitian");
      setIsMobileOpen(false);
    } else if (itemName === "Pengabdian (PKM)") {
      setOpenDropdowns((prev) => ({ ...prev, "Pengabdian (PKM)": true }));
      router.push("/dosen/pengabdian");
      setIsMobileOpen(false);
    } else {
      toggleDropdown(itemName);
    }
  };

  // Cek status persetujuan LPPM untuk membuka Tahap 2 & Tahap 3 Penelitian
  const checkResearchApprovalStatus = async () => {
    if (role !== "dosen") return;
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/research", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setIsStage2Unlocked(Boolean(data.summary.isStage2Unlocked));
        setIsStage3Unlocked(Boolean(data.summary.isStage3Unlocked));
      }
    } catch {
      // Ignored
    }
  };

  // Cek status persetujuan LPPM untuk membuka Tahap 2 & Tahap 3 PKM
  const checkPkmApprovalStatus = async () => {
    if (role !== "dosen") return;
    try {
      const token = localStorage.getItem("sipandu_token") || localStorage.getItem("sikemas_token");
      const res = await fetch("/resr/api/pkm", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && data.summary) {
        setIsPkmStage2Unlocked(Boolean(data.summary.isStage2Unlocked));
        setIsPkmStage3Unlocked(Boolean(data.summary.isStage3Unlocked));
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    checkResearchApprovalStatus();
    checkPkmApprovalStatus();

    const handleResearchUpdate = () => {
      checkResearchApprovalStatus();
    };

    const handlePkmUpdate = () => {
      checkPkmApprovalStatus();
    };

    const handleScrollspyChange = (e: Event) => {
      const custom = e as CustomEvent<{ id: string }>;
      if (custom.detail?.id) {
        setActiveScrollSection(custom.detail.id);
      }
    };

    window.addEventListener("sipandu-research-updated", handleResearchUpdate);
    window.addEventListener("sipandu-pkm-updated", handlePkmUpdate);
    window.addEventListener("sipandu-scrollspy-change", handleScrollspyChange);
    return () => {
      window.removeEventListener("sipandu-research-updated", handleResearchUpdate);
      window.removeEventListener("sipandu-pkm-updated", handlePkmUpdate);
      window.removeEventListener("sipandu-scrollspy-change", handleScrollspyChange);
    };
  }, [role]);

  // Ambil profil pengguna dari storage saat mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sipandu_user") || localStorage.getItem("sikemas_user");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch {
      // Ignored
    }
  }, []);

  // Menutup dropdown profil saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sipandu_token");
    localStorage.removeItem("sipandu_user");
    localStorage.removeItem("sikemas_token");
    localStorage.removeItem("sikemas_user");
    document.cookie = "sipandu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sikemas_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Anda berhasil keluar dari sesi.");
    router.push("/");
  };

  // Konfigurasi Navigasi Menu Sidebar Berdasarkan Role
  const getMenuCategories = (): MenuCategory[] => {
    switch (role) {
      case "dosen":
        return [
          {
            title: "MENU UTAMA",
            items: [{ name: "Dashboard", icon: LayoutGrid, active: title === "Dashboard" }],
          },
          {
            title: "PENELITIAN & PENGABDIAN",
            items: [
              {
                name: "Penelitian",
                icon: FileText,
                active:
                  (title === "Penelitian" ||
                    title === "Penelitian Dosen" ||
                    (title?.toLowerCase().includes("proposal") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian")) ||
                    (title?.toLowerCase().includes("kemajuan") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian")) ||
                    (title?.toLowerCase().includes("akhir") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian")) ||
                    title?.startsWith("Tahap")) &&
                  !title?.toLowerCase().includes("pkm") &&
                  !title?.toLowerCase().includes("pengabdian"),
                subItems: [
                  {
                    name: "Tahap 1 : Proposal",
                    active:
                      title === "Penelitian Dosen" ||
                      title === "Tahap 1 : Proposal" ||
                      title === "Penelitian" ||
                      (title?.toLowerCase().includes("proposal") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian")),
                  },
                  {
                    name: "Tahap 2 : Laporan Kemajuan",
                    active: title?.toLowerCase().includes("kemajuan") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian"),
                  },
                  {
                    name: "Tahap 3 : Laporan Akhir",
                    active: title?.toLowerCase().includes("akhir") && !title?.toLowerCase().includes("pkm") && !title?.toLowerCase().includes("pengabdian"),
                  },
                ],
              },
              {
                name: "Pengabdian (PKM)",
                icon: BookOpen,
                active:
                  title === "Pengabdian (PKM)" ||
                  title?.toLowerCase().includes("pkm") ||
                  title?.toLowerCase().includes("pengabdian"),
                subItems: [
                  {
                    name: "Tahap 1 : Proposal",
                    active:
                      title === "Pengabdian (PKM)" ||
                      (title?.toLowerCase().includes("proposal") && (title?.toLowerCase().includes("pkm") || title?.toLowerCase().includes("pengabdian"))),
                  },
                  {
                    name: "Tahap 2 : Laporan Kemajuan",
                    active:
                      title?.toLowerCase().includes("kemajuan") &&
                      (title?.toLowerCase().includes("pkm") || title?.toLowerCase().includes("pengabdian")),
                  },
                  {
                    name: "Tahap 3 : Laporan Akhir",
                    active:
                      title?.toLowerCase().includes("akhir") &&
                      (title?.toLowerCase().includes("pkm") || title?.toLowerCase().includes("pengabdian")),
                  },
                ],
              },
            ],
          },
          {
            title: "PANDUAN & DOKUMEN",
            items: [
              {
                name: "Panduan Penggunaan",
                icon: BookOpen,
                scrollId: "panduan",
                active:
                  pathname === "/dosen/dokumen" &&
                  (!activeScrollSection || activeScrollSection === "panduan"),
              },
              {
                name: "Template Proposal",
                icon: FileText,
                scrollId: "template-proposal",
                active:
                  pathname === "/dosen/dokumen" && activeScrollSection === "template-proposal",
              },
              {
                name: "Template Laporan",
                icon: FolderDown,
                scrollId: "template-laporan",
                active:
                  pathname === "/dosen/dokumen" && activeScrollSection === "template-laporan",
              },
            ],
          },
        ];
      case "lpmi":
        return [
          {
            title: "MENU UTAMA",
            items: [{ name: "Dashboard", icon: LayoutGrid, active: title === "Dashboard" }],
          },
          {
            title: "PENJAMINAN MUTU",
            items: [
              { name: "Validasi Usulan", icon: CheckCircle2 },
              { name: "Audit Mutu Riset", icon: ClipboardCheck },
              { name: "Laporan Monev", icon: FileText },
            ],
          },
          {
            title: "AKREDITASI & SOP",
            items: [
              { name: "Kepatuhan Standar", icon: Shield },
              { name: "Berita Acara", icon: FolderOpen },
            ],
          },
        ];
      case "admin":
      default:
        return [
          {
            title: "MENU UTAMA",
            items: [{ name: "Dashboard", icon: LayoutGrid, active: title === "Dashboard" }],
          },
          {
            title: "ACCOUNT CENTER",
            items: [
              { 
                name: "Account", 
                icon: User, 
                active: title === "Account Center" || title === "Account" || title === "Tambah Akun Pengguna" 
              },
            ],
          },
          {
            title: "MANAJEMEN DOKUMEN",
            items: [
              {
                name: "Template Berkas",
                icon: FileText,
                active: pathname === "/admin/template-berkas" || title === "Manajemen Template Berkas",
              },
            ],
          },
        ];
    }
  };

  // Teks deskripsi subjudul default jika tidak disediakan
  const getDefaultSubtitle = (): string => {
    switch (role) {
      case "dosen":
        return "Ruang kendali utama pemantauan dan pengelolaan Penelitian & Pengabdian Dosen.";
      case "lpmi":
        return "Ruang kendali utama pemantauan dan audit penjaminan mutu penelitian internal LPPM.";
      case "admin":
      default:
        return "Ruang kendali utama pemantauan dan pengelolaan Sistem Penelitian dan Pengabdian Dosen Terpadu.";
    }
  };

  // Label peran untuk tampilan header
  const getRoleBadgeLabel = (): string => {
    switch (role) {
      case "dosen":
        return "Dosen";
      case "lpmi":
        return "LPMI";
      case "admin":
      default:
        return "Administrator";
    }
  };

  const menuCategories = getMenuCategories();
  const activeSubtitle = subtitle || getDefaultSubtitle();
  const userName = profile?.name || (role === "admin" ? "Administrator SiPANDU" : role === "lpmi" ? "Tim Auditor LPMI" : "Dr. Dosen Teladan, M.Kom.");
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Top: Logo STMIK TIME + SiPANDU */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative shrink-0">
                <Image
                  src="/img/Logo.png"
                  alt="STMIK TIME Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-wider text-slate-900 leading-tight">
                  SiPANDU
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  STMIK TIME
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
            {menuCategories.map((category, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {category.title}
                </p>
                <div className="space-y-1">
                  {category.items.map((item, itemIdx) => {
                    const IconComponent = item.icon;
                    const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                    const isOpen = Boolean(openDropdowns[item.name]);

                    // Render Dropdown Accordion Item
                    if (hasSubItems) {
                      return (
                        <div key={itemIdx} className="space-y-1">
                          <div
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none group ${
                              item.active
                                ? "bg-blue-50/90 text-blue-700 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                            onClick={() => handleParentClick(item.name)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <IconComponent
                                className={`w-4 h-4 shrink-0 ${
                                  item.active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                }`}
                              />
                              <span className="truncate">{item.name}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(item.name);
                              }}
                              className="p-1 -mr-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                              title={isOpen ? "Tutup submenu" : "Buka submenu"}
                              aria-label={`Toggle dropdown ${item.name}`}
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-in-out shrink-0 ${
                                  isOpen ? "rotate-180 text-blue-600" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Animated Collapsible Submenu Container (Slide Down & Slide Up) */}
                          <div
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                              isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="ml-5 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
                                {item.subItems?.map((sub, subIdx) => {
                                  const isPenelitian = item.name === "Penelitian";
                                  const isPkm = item.name === "Pengabdian (PKM)";
                                  const isStage2 = sub.name.includes("Tahap 2");
                                  const isStage3 = sub.name.includes("Tahap 3");
                                  const isLocked = isPenelitian
                                    ? isStage2
                                      ? !isStage2Unlocked
                                      : isStage3
                                      ? !isStage3Unlocked
                                      : false
                                    : isPkm
                                    ? isStage2
                                      ? !isPkmStage2Unlocked
                                      : isStage3
                                      ? !isPkmStage3Unlocked
                                      : false
                                    : isStage2 || isStage3;

                                  const handleSubClick = () => {
                                    if (isPenelitian) {
                                      if (sub.name.includes("Tahap 1")) {
                                        router.push("/dosen/penelitian");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                      if (isStage2) {
                                        if (!isStage2Unlocked) {
                                          toast.error(
                                            "Akses Ditolak: Tahap 2 (Laporan Kemajuan) terkunci karena usulan proposal belum disetujui oleh pihak LPPM."
                                          );
                                          return;
                                        }
                                        router.push("/dosen/penelitian/kemajuan");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                      if (isStage3) {
                                        if (!isStage3Unlocked) {
                                          toast.error(
                                            "Akses Ditolak: Tahap 3 (Laporan Akhir) terkunci sebelum Laporan Kemajuan Tahap 2 disetujui oleh pihak LPPM."
                                          );
                                          return;
                                        }
                                        router.push("/dosen/penelitian/akhir");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                    } else if (isPkm) {
                                      // Pengabdian (PKM)
                                      if (sub.name.includes("Tahap 1")) {
                                        router.push("/dosen/pengabdian");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                      if (isStage2) {
                                        if (!isPkmStage2Unlocked) {
                                          toast.error(
                                            "Akses Ditolak: Tahap 2 (Laporan Kemajuan PKM) terkunci karena usulan proposal belum disetujui oleh pihak LPPM."
                                          );
                                          return;
                                        }
                                        router.push("/dosen/pengabdian/kemajuan");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                      if (isStage3) {
                                        if (!isPkmStage3Unlocked) {
                                          toast.error(
                                            "Akses Ditolak: Tahap 3 (Laporan Akhir PKM) terkunci sebelum Laporan Kemajuan Tahap 2 disetujui oleh pihak LPPM."
                                          );
                                          return;
                                        }
                                        router.push("/dosen/pengabdian/akhir");
                                        setIsMobileOpen(false);
                                        return;
                                      }
                                    } else {
                                      if (isLocked) {
                                        toast.error(
                                          `Akses Ditolak: ${sub.name} belum dapat diakses sebelum usulan disetujui oleh LPPM.`
                                        );
                                        return;
                                      }
                                      toast.info(`Halaman ${sub.name} (${item.name}) siap dikonfigurasikan.`);
                                    }
                                    setIsMobileOpen(false);
                                  };

                                  return (
                                    <button
                                      key={subIdx}
                                      type="button"
                                      onClick={handleSubClick}
                                      title={isLocked ? "Terkunci: Menunggu persetujuan LPPM" : sub.name}
                                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                                        isLocked
                                          ? "text-slate-400 hover:text-slate-500 hover:bg-slate-50/80 cursor-not-allowed"
                                          : sub.active
                                          ? "bg-blue-50 text-blue-700 font-bold"
                                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium cursor-pointer"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                            isLocked
                                              ? "bg-slate-300"
                                              : sub.active
                                              ? "bg-blue-600"
                                              : "bg-emerald-500"
                                          }`}
                                        />
                                        <span className="truncate">{sub.name}</span>
                                      </div>

                                      {isLocked && (
                                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Render Standard Menu Button
                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => {
                          if (item.scrollId) {
                            if (pathname === "/dosen/dokumen") {
                              if (item.scrollId === "panduan") {
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                                setActiveScrollSection("panduan");
                              } else {
                                const target = document.getElementById(item.scrollId);
                                if (target) {
                                  const headerOffset = 85;
                                  const elementPosition = target.getBoundingClientRect().top;
                                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                  window.scrollTo({
                                    top: offsetPosition,
                                    behavior: "smooth",
                                  });
                                  setActiveScrollSection(item.scrollId);
                                }
                              }
                            } else {
                              if (item.scrollId === "panduan") {
                                router.push("/dosen/dokumen");
                              } else {
                                router.push(`/dosen/dokumen#${item.scrollId}`);
                              }
                            }
                            setIsMobileOpen(false);
                            return;
                          }

                          if (item.name === "Dashboard") {
                            router.push(`/${role}/dashboard`);
                          } else if (item.name === "Account" && role === "admin") {
                            router.push("/admin/account");
                          } else if (item.name === "Template Berkas" && role === "admin") {
                            router.push("/admin/template-berkas");
                          } else {
                            toast.info(`Halaman ${item.name} siap dikonfigurasikan pada tahap berikutnya.`);
                          }
                          setIsMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          item.active
                            ? "bg-blue-50/90 text-blue-700 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <IconComponent
                          className={`w-4 h-4 shrink-0 ${
                            item.active ? "text-blue-600" : "text-slate-400"
                          }`}
                        />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Indicator Circle */}
          <div className="p-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs select-none shadow-xs">
              N
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">
                STMIK TIME
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Terhubung
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input Bar */}
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari modul, dokumen"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Header: Notification + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => toast.info("Tidak ada notifikasi baru saat ini.")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 border-2 border-white"></span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Profile Dropdown Pill */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
              >
                {/* Avatar with Initials */}
                <div className="w-8 h-8 rounded-full bg-[#0d3d78] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>

                {/* Profile Name & Role (Hidden on mobile) */}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                    {userName}
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium leading-none mt-0.5">
                    {getRoleBadgeLabel()}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Interactive Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 border-b border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile?.email || (profile?.username ? `${profile.username}@stmik-time.ac.id` : "user@stmik-time.ac.id")}
                    </p>
                    <div className="pt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wide">
                        GRUP: {getRoleBadgeLabel()}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {/* Ganti Kata Sandi Navigation Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push(`/${role}/reset-password`);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Ganti Kata Sandi</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Logout Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Keluar dari Akun (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
                {activeSubtitle}
              </p>
            </div>

            {/* Custom Content OR Exact Placeholder from Reference Image */}
            {children ? (
              children
            ) : (
              <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] min-h-[460px] lg:min-h-[520px] flex items-center justify-center p-8">
                <div className="max-w-md text-center flex flex-col items-center space-y-3">
                  {/* Soft Blue Rounded Square Icon Grid */}
                  <div className="w-14 h-14 rounded-2xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                    <LayoutGrid className="w-6 h-6" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Area Konten Dashboard
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Struktur layout desktop (Sidebar, Header, Body, dan Footer) telah terpasang. Konten widget, statistik, dan tabel siap ditambahkan pada task berikutnya.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sub-card Footer */}
          <footer className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              © 2026 STMIK TIME - Sistem Penelitian dan Pengabdian Dosen Terpadu. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div>
              Portal SiPANDU 1.0 • STMIK TIME Medan
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
