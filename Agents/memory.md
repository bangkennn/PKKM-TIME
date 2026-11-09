# MEMORI AI AGENT (MEMORY.MD)

Dokumen ini berfungsi sebagai **Persistent Brain & Context Log** bagi AI Agent. File ini digunakan untuk melacak seluruh histori pengembangan, arsitektur yang sudah dibangun, keputusan teknis, dan catatan penting dari setiap perubahan yang pernah dilakukan dalam proyek ini.

> **ATURAN UNTUK AI AGENT:**
> 1. AI Agent **WAJIB MEMBACA** dokumen ini di awal sesi untuk memahami konteks terkini proyek.
> 2. AI Agent **WAJIB MEMPERBARUI** dokumen ini di **Tahap 3** setiap kali selesai melakukan perubahan kode atau penambahan fitur.

---

## 1. 📋 INFORMASI PROYEK

- **Nama Proyek:** PPKM Time
- **Lokasi Direktori:** `d:\Code App\PPKM Time`
- **Tanggal Inisialisasi:** 2026-11-09
- **Tujuan Proyek:** Sistem Manajemen Waktu & Portofolio Kegiatan Mahasiswa (PPKM) dengan Arsitektur Monorepo Fullstack.
- **Tech Stack:**
  - **Arsitektur:** Root Monorepo (NPM Workspaces) mengelola `frontend/` dan `backend/`
  - **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Sonner, TanStack Query v5, Axios, Zustand v5, React Hook Form, Zod v4, class-variance-authority, clsx, tailwind-merge
  - **Backend:** Next.js 16 App Router API Routes (`src/app/api/`), TypeScript, REST API Handlers (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), Zod v4 validation
  - **Database Sentral:** Supabase Cloud (PostgreSQL) - Target Database: `PPKM_stmik_time`, Library: `@supabase/supabase-js` v2

---

## 2. 🏗️ STATUS ARSITEKTUR TERKINI (CURRENT STATE)

- **Frontend Architecture (`frontend/`):**
  - Terletak pada direktori `frontend/` (Port dev default: 3000).
  - Menggunakan Next.js 16 App Router dengan React 19.
  - Styling menggunakan Tailwind CSS v4 modern (`@import "tailwindcss";`).
  - Provider terintegrasi: `QueryProvider` (TanStack Query v5) dan `Toaster` (Sonner).
  - Global State: `useAppStore` berbasis Zustand.
  - Form & Validation: React Hook Form dipadukan dengan skema validasi Zod.
  - HTTP Client: Axios instance terkonfigurasi dengan interceptor di `src/lib/axios.ts`.

- **Backend Architecture (`backend/`):**
  - Terletak pada direktori `backend/` (Port dev default: 3001).
  - Next.js 16 App Router API Routes dengan handler HTTP REST standar:
    - `GET /api/health`: Healthcheck status dan identitas database target `PPKM_stmik_time`.
    - `GET /api/ppkm`: List data dengan filter, search, pagination, dan fallback status.
    - `POST /api/ppkm`: Validasi data baru via Zod dan insert ke Supabase `ppkm_entries`.
    - `GET /api/ppkm/[id]`: Detail data kegiatan berdasarkan ID.
    - `PUT /api/ppkm/[id]`: Full replace update data kegiatan.
    - `PATCH /api/ppkm/[id]`: Partial update data kegiatan.
    - `DELETE /api/ppkm/[id]`: Hapus data kegiatan berdasarkan ID.

- **Database / Storage (`database/`):**
  - Supabase Cloud PostgreSQL database `PPKM_stmik_time`.
  - File migrasi SQL: `database/schema.sql` (tabel `ppkm_entries`, indexes, dan Row Level Security policies).
  - Client Supabase terkonfigurasi di `backend/src/lib/supabase.ts` (dukungan Anon Key dan Service Role Key).

- **Third-Party Services / Integrations:**
  - Supabase Cloud (`@supabase/supabase-js`).

---

## 3. 📜 RIWAYAT PERUBAHAN & LOG EKSEKUSI (CHANGELOG)

| No | Tanggal & Waktu | Fitur / Task | Ringkasan Perubahan (Before -> After) | File yang Dibuat / Diubah | Status QA & Security |
|:---|:---|:---|:---|:---|:---|
| 02 | 2026-11-09 | Pemasangan Fullstack Monorepo (Next.js 16, Supabase, Tailwind v4, shadcn/ui stack) | Root kosong menjadi Root Monorepo dengan folder `frontend/` (Next 16, React 19, Tailwind v4, TanStack Query, Zustand, React Hook Form, Zod, Sonner, Lucide) dan `backend/` (Next 16 REST API Routes GET/POST/PUT/DELETE/PATCH dengan Supabase client), serta `database/schema.sql` | `package.json`, `.gitignore`, `frontend/*`, `backend/*`, `database/schema.sql` | ✅ Passed (0 Error typecheck, 0 Error production build, 0 vulnerability audit) |
| 01 | 2026-11-09 | Inisialisasi Folder Agent & Konfigurasi Rules | Inisialisasi awal sistem Rules, Workflows, Memory, dan Standar Skill AI | `Agents/agent.md`, `Agents/memory.md`, `Agents/skill.md`, `.agent/workflow.md`, `AGENTS.md` | ✅ Passed (Setup File Valid) |

---

## 4. 🧠 KEPUTUSAN TEKNIS PENTING (KEY ARCHITECTURAL DECISIONS)

- **[ADR-001] Penerapan Protokol 3 Tahapan:** Setiap interaksi pengguna wajib melalui Tahap 1 (Analisis & Before-After) -> Tahap 2 (Menunggu Approval) -> Tahap 3 (QA, Zero Error & Security Audit).
- **[ADR-002] Standar Keahlian Senior:** Semua kode frontend, backend, dan testing wajib mengikuti standar baku di `Agents/skill.md`.
- **[ADR-003] Monorepo Root Separation:** Frontend UI dan Backend REST API dipisah dalam dua workspace independen (`frontend/` port 3000 dan `backend/` port 3001) untuk menjaga isolasi dependencies dan skalabilitas jangka panjang.
- **[ADR-004] Zero Vulnerability Policy:** Menggunakan versi Zod v4.6.7 yang telah dipatch untuk mencegah celah keamanan memory exhaustion (GHSA-mrhx-c7xc-m3w5).

---

## 5. 🔍 CATATAN PENTING & DEPENDENSI KHUSUS

- Lingkungan Operasi: Windows PowerShell (`npm.cmd` digunakan untuk eksekusi CLI).
- Root Scripts yang Tersedia:
  - `npm run dev:frontend` : Menjalankan Next.js frontend di port 3000
  - `npm run dev:backend`  : Menjalankan Next.js backend API di port 3001
  - `npm run build`        : Melakukan compile & build produksi frontend dan backend secara paralel
  - `npm run typecheck`    : Melakukan TypeScript type-checking ke seluruh workspace
- Konfigurasi Kredensial Supabase:
  - Salin `backend/.env.example` ke `backend/.env.local` dan masukkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` dari dashboard Supabase proyek `PPKM_stmik_time`.
  - Salin `frontend/.env.example` ke `frontend/.env.local` untuk mengatur endpoint backend API.

---

## 6. 📝 PANDUAN PEMBARUAN MEMORI BAGI AI

Setiap kali menyelesaikan task di **Tahap 3**, AI Agent wajib melakukan hal-hal berikut:
1. Menambahkan baris baru pada tabel **3. RIWAYAT PERUBAHAN & LOG EKSEKUSI**.
2. Memperbarui status modul pada **2. STATUS ARSITEKTUR TERKINI** bila ada modul/fitur baru.
3. Mencatat keputusan desain baru pada **4. KEPUTUSAN TEKNIS PENTING** bila pengguna atau AI menetapkan pola/aturan baru.
4. Memastikan tidak ada data usang atau konflik informasi di dalam file ini.
