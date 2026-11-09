"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Search, 
  Trash2, 
  Clock, 
  Calendar, 
  FolderKanban, 
  User, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";

export interface PPKMEntry {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  description: string | null;
  student_id: string | null;
  date: string;
  created_at: string;
}

export function PPKMList() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const categories = [
    "Semua",
    "Kegiatan Kampus",
    "Riset & Publikasi",
    "Pengabdian Masyarakat",
    "Lainnya",
  ];

  // Fetch list from Backend API (MySQL XAMPP)
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["ppkmEntries", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "Semua") {
        params.append("category", selectedCategory);
      }
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }
      const response = await apiClient.get(`/ppkm?${params.toString()}`);
      return response.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/ppkm/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Kegiatan berhasil dihapus dari database MySQL");
      queryClient.invalidateQueries({ queryKey: ["ppkmEntries"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Gagal menghapus kegiatan";
      toast.error(msg);
    },
  });

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case "Kegiatan Kampus":
        return "campus";
      case "Riset & Publikasi":
        return "research";
      case "Pengabdian Masyarakat":
        return "community";
      default:
        return "secondary";
    }
  };

  const entries: PPKMEntry[] = data?.data || [];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 md:p-8 mt-10">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-zinc-800" />
            <h2 className="text-xl font-bold text-zinc-900">Daftar Kegiatan PPKM</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
              {entries.length} Kegiatan
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Data tersinkronisasi otomatis dengan basis data MySQL XAMPP (<code>ppkm_stmik_time</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau deskripsi kegiatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table Content */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-zinc-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Gagal Mengambil Data dari MySQL Backend</h4>
            <p className="text-xs text-red-600 mt-1">
              {error instanceof Error ? error.message : "Koneksi ke backend bermasalah."}
            </p>
            <p className="text-xs text-zinc-600 mt-2 font-mono bg-white/70 p-2 rounded border border-red-100">
              Tip: Pastikan Apache & MySQL di XAMPP aktif, dan backend server berjalan di port 3001.
            </p>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <FolderKanban className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-semibold text-zinc-800 text-sm">Belum Ada Data Kegiatan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Gunakan form di atas untuk menambahkan kegiatan baru ke dalam database MySQL XAMPP.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
          {entries.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/80 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-zinc-900 text-sm">{item.title}</h4>
                  <Badge variant={getBadgeVariant(item.category)}>
                    {item.category}
                  </Badge>
                </div>

                {item.description && (
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.duration_minutes} Menit
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date ? new Date(item.date).toLocaleDateString("id-ID") : "-"}
                  </span>
                  {item.student_id && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {item.student_id}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Apakah Anda yakin ingin menghapus "${item.title}"?`)) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-zinc-200"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

