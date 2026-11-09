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
  - **Database Sentral:** MySQL / MariaDB via XAMPP & phpMyAdmin - Database: `ppkm_stmik_time`, Driver: `mysql2/promise` (Connection Pooling)

---

## 2. 🏗️ STATUS ARSITEKTUR TERKINI (CURRENT STATE)

- **Frontend Architecture (`frontend/`):**
  - Terletak pada direktori `frontend/` (Port dev default: 3000).
  - Next.js 16 App Router dengan React 19.
  - Styling menggunakan Tailwind CSS v4 modern (`@import "tailwindcss";`).
  - Provider terintegrasi: `QueryProvider` (TanStack Query v5) dan `Toaster` (Sonner).
  - Global State: `useAppStore` berbasis Zustand.
  - Komponen Daftar Kegiatan: `PPKMList` (`frontend/src/components/ppkm-list.tsx`) terhubung langsung ke `GET /api/ppkm` dan `DELETE /api/ppkm/[id]`, dilengkapi real-time search, filter kategori, badge status, skeleton loading, dan empty state.
  - Form Input: React Hook Form dipadukan dengan skema validasi Zod dan TanStack Query `useMutation` yang langsung menyimpan data ke endpoint `POST /api/ppkm`.

- **Backend Architecture (`backend/`):**
  - Terletak pada direktori `backend/` (Port dev default: 3001).
  - Next.js 16 App Router API Routes dengan koneksi connection pool `mysql2/promise` di `src/lib/db.ts`:
    - `GET /api/health`: Healthcheck status dan koneksi ping ke MySQL XAMPP.
    - `GET /api/ppkm`: List data dari MySQL dengan filter kategori, pencarian LIKE parameterized, pagination, dan total count.
    - `POST /api/ppkm`: Validasi data via Zod, generate UUID, dan insert parameterized ke tabel `ppkm_entries`.
    - `GET /api/ppkm/[id]`: Detail data kegiatan berdasarkan ID dari MySQL.
    - `PUT /api/ppkm/[id]`: Full replace update data kegiatan di MySQL.
    - `PATCH /api/ppkm/[id]`: Partial update dinamis parameterized di MySQL.
    - `DELETE /api/ppkm/[id]`: Hapus data kegiatan dari MySQL.

- **Database / Storage (`database/`):**
  - MySQL / MariaDB via XAMPP (Localhost port 3306).
  - Database name: `ppkm_stmik_time`.
  - File migrasi SQL: `database/schema.sql` (Perintah otomatis `CREATE DATABASE IF NOT EXISTS`, tabel `ppkm_entries`, indexes, dan sample seed data yang siap di-import langsung di phpMyAdmin).

- **Third-Party Services / Integrations:**
  - Tidak ada dependensi cloud eksternal (100% bebas kuota/limit cloud).

---

## 3. 📜 RIWAYAT PERUBAHAN & LOG EKSEKUSI (CHANGELOG)

| No | Tanggal & Waktu | Fitur / Task | Ringkasan Perubahan (Before -> After) | File yang Dibuat / Diubah | Status QA & Security |
|:---|:---|:---|:---|:---|:---|
| 03 | 2026-11-09 | Migrasi Database dari Supabase Cloud ke MySQL XAMPP (phpMyAdmin) & Integrasi Penuh Frontend-Backend | Mengganti `@supabase/supabase-js` dengan `mysql2/promise` Connection Pool, membuat `database/schema.sql` standar MySQL, mengimplementasikan query SQL parameterized untuk GET/POST/PUT/PATCH/DELETE, menghubungkan form ke mutation backend nyata, dan menambahkan komponen `PPKMList` & `Badge`. | `backend/package.json`, `backend/src/lib/db.ts`, `backend/src/app/api/*`, `database/schema.sql`, `frontend/src/components/*`, `frontend/src/app/page.tsx` | ✅ Passed (0 Error typecheck, 0 Error production build, 0 vulnerability audit) |
| 02 | 2026-11-09 | Pemasangan Fullstack Monorepo (Next.js 16, Supabase, Tailwind v4, shadcn/ui stack) | Inisialisasi Root Monorepo dengan folder `frontend/` dan `backend/` | `package.json`, `.gitignore`, `frontend/*`, `backend/*` | ✅ Passed |
| 01 | 2026-11-09 | Inisialisasi Folder Agent & Konfigurasi Rules | Inisialisasi awal sistem Rules, Workflows, Memory, dan Standar Skill AI | `Agents/agent.md`, `Agents/memory.md`, `Agents/skill.md`, `.agent/workflow.md`, `AGENTS.md` | ✅ Passed |

---

## 4. 🧠 KEPUTUSAN TEKNIS PENTING (KEY ARCHITECTURAL DECISIONS)

- **[ADR-001] Penerapan Protokol 3 Tahapan:** Setiap interaksi pengguna wajib melalui Tahap 1 (Analisis & Before-After) -> Tahap 2 (Menunggu Approval) -> Tahap 3 (QA, Zero Error & Security Audit).
- **[ADR-002] Standar Keahlian Senior:** Semua kode frontend, backend, dan testing wajib mengikuti standar baku di `Agents/skill.md`.
- **[ADR-003] Monorepo Root Separation:** Frontend UI dan Backend REST API dipisah dalam dua workspace independen (`frontend/` port 3000 dan `backend/` port 3001) untuk menjaga isolasi dependencies dan skalabilitas jangka panjang.
- **[ADR-004] Zero Vulnerability Policy:** Menggunakan versi Zod v4.6.7 yang telah dipatch untuk mencegah celah keamanan memory exhaustion (GHSA-mrhx-c7xc-m3w5).
- **[ADR-005] Migrasi ke MySQL XAMPP:** Menggantikan Supabase Cloud dengan MySQL lokal via XAMPP / phpMyAdmin untuk mengatasi batasan kuota. Backend mengimplementasikan connection pooling dan parameterized queries murni guna mencegah celah keamanan SQL Injection.

---

## 5. 🔍 CATATAN PENTING & DEPENDENSI KHUSUS

- Lingkungan Operasi: Windows PowerShell (`npm.cmd` digunakan untuk eksekusi CLI).
- Root Scripts yang Tersedia:
  - `npm run dev:frontend` : Menjalankan Next.js frontend di port 3000
  - `npm run dev:backend`  : Menjalankan Next.js backend API di port 3001
  - `npm run build`        : Melakukan compile & build produksi frontend dan backend secara paralel
  - `npm run typecheck`    : Melakukan TypeScript type-checking ke seluruh workspace
- Konfigurasi Koneksi XAMPP:
  - Pastikan modul **Apache** dan **MySQL** di **XAMPP Control Panel** dalam status **Running**.
  - Buka phpMyAdmin di browser (`http://localhost/phpmyadmin`), klik tab **SQL**, salin dan jalankan seluruh isi file `database/schema.sql`.

---

## 6. 📝 PANDUAN PEMBARUAN MEMORI BAGI AI

Setiap kali menyelesaikan task di **Tahap 3**, AI Agent wajib melakukan hal-hal berikut:
1. Menambahkan baris baru pada tabel **3. RIWAYAT PERUBAHAN & LOG EKSEKUSI**.
2. Memperbarui status modul pada **2. STATUS ARSITEKTUR TERKINI** bila ada modul/fitur baru.
3. Mencatat keputusan desain baru pada **4. KEPUTUSAN TEKNIS PENTING** bila pengguna atau AI menetapkan pola/aturan baru.
4. Memastikan tidak ada data usang atau konflik informasi di dalam file ini.
