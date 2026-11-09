"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Clock, 
  Database, 
  Layers, 
  Send, 
  CheckCircle2, 
  Activity, 
  Server, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

const entrySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  category: z.string().min(2, "Kategori wajib diisi"),
  durationMinutes: z.coerce.number().min(1, "Durasi minimal 1 menit"),
});

type EntryFormData = z.infer<typeof entrySchema>;

export default function HomePage() {
  const { appName } = useAppStore();

  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/health");
        return res.data;
      } catch {
        return { status: "offline", service: "Backend API (Simulated)" };
      }
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      category: "Kegiatan Kampus",
      durationMinutes: 60,
    },
  });

  const onSubmit = async (data: EntryFormData) => {
    try {
      // Example submitting to backend API
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 800)),
        {
          loading: "Menyimpan data kegiatan...",
          success: () => {
            reset();
            return `Kegiatan "${data.title}" berhasil dicatat!`;
          },
          error: "Gagal menyimpan data",
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-200 pb-8 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-white rounded-xl shadow-sm">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {appName}
            </h1>
          </div>
          <p className="text-zinc-500 mt-1">
            Sistem Manajemen Waktu & Portofolio Mahasiswa Terintegrasi Supabase Cloud
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Next.js 16 (React 19)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Database className="w-3.5 h-3.5" />
            Supabase Cloud
          </span>
        </div>
      </div>

      {/* Tech Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900">Frontend App</h3>
          </div>
          <p className="text-sm text-zinc-600 mb-4">
            Next.js App Router, Tailwind CSS v4, Lucide React, Sonner, Zustand, dan TanStack Query.
          </p>
          <div className="text-xs text-zinc-500 font-mono bg-zinc-50 p-2.5 rounded-md border border-zinc-100">
            Port: 3000 • Client & SSR
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900">Backend API</h3>
          </div>
          <p className="text-sm text-zinc-600 mb-4">
            Next.js App Router API Handlers (REST: GET, POST, PUT, DELETE, PATCH) dengan validasi Zod.
          </p>
          <div className="text-xs text-zinc-500 font-mono bg-zinc-50 p-2.5 rounded-md border border-zinc-100 flex items-center justify-between">
            <span>Port: 3001</span>
            <span className="text-emerald-600">
              {isHealthLoading ? "Pengecekan..." : healthData?.status || "Aktif"}
            </span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-800">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-900">Database Sentral</h3>
          </div>
          <p className="text-sm text-zinc-600 mb-4">
            Supabase Cloud PostgreSQL Database: <code className="text-xs font-mono bg-zinc-100 px-1 py-0.5 rounded">PPKM_stmik_time</code>
          </p>
          <div className="text-xs text-zinc-500 font-mono bg-zinc-50 p-2.5 rounded-md border border-zinc-100">
            @supabase/supabase-js v2
          </div>
        </div>
      </div>

      {/* Form Demo with React Hook Form, Zod & Sonner */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-5 h-5 text-zinc-700" />
          <h2 className="text-xl font-bold text-zinc-900">Input Data Kegiatan Baru</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Judul Kegiatan
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="Contoh: Bimbingan Skripsi / Magang Industri"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Kategori
              </label>
              <select
                {...register("category")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
              >
                <option value="Kegiatan Kampus">Kegiatan Kampus</option>
                <option value="Riset & Publikasi">Riset & Publikasi</option>
                <option value="Pengabdian Masyarakat">Pengabdian Masyarakat</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Durasi (Menit)
              </label>
              <input
                {...register("durationMinutes")}
                type="number"
                min={1}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
              />
              {errors.durationMinutes && (
                <p className="text-xs text-red-500 mt-1">{errors.durationMinutes.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Validasi skema otomatis menggunakan Zod dan notifikasi toast menggunakan Sonner.</span>
        </div>
      </div>
    </main>
  );
}

