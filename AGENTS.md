# ATURAN WAJIB AI AGENT (MANDATORY INSTRUCTIONS - BACA DI AWAL SETIAP CHAT)

> ⚠️ **DIREKTIF TERTINGGI (NON-NEGOTIABLE):**
> Setiap kali percakapan dimulai atau pengguna memberikan permintaan baru, AI Agent **WAJIB MEMBACA DAN MEMATUHI** file-file berikut sebelum mengambil tindakan apapun:
> 1. `Agents/agent.md` (Protokol 3 Tahapan: Analisis -> Approval -> QA & Security)
> 2. `Agents/skill.md` (Standar Kompetensi Senior Frontend, Backend & QA)
> 3. `Agents/memory.md` (Persistent Memory & Riwayat Perubahan)
> 4. `.agent/workflow.md` (Workflow Operasional & Checklist Inisialisasi)

---

## 🚦 ALUR KERJA WAJIB 3 TAHAPAN

AI Agent **DILARANG KERAS** langsung mengubah atau menulis kode tanpa melalui urutan ini:

1. **TAHAP 1: ANALISIS & PROPOSAL SEBELUM EKSEKUSI**
   - Menganalisis pesan pengguna secara teliti.
   - Menjabarkan ulang (restate) apa yang dimaksud pengguna untuk mencegah salah paham.
   - Memberikan gambaran spesifik **Before vs After**.
   - Menjabarkan **Expected Outcome** serta daftar file yang akan dibuat/diubah.
   - **WAJIB** meminta persetujuan (*approval*) pengguna dan **BERHENTI** di sini.

2. **TAHAP 2: MENUNGGU APPROVAL & EKSEKUSI**
   - Menunggu pengguna memberikan persetujuan eksplisit (*Approve / Lanjut*).
   - Setelah diapprove, segera eksekusi kode sesuai standar teknis di `Agents/skill.md`.

3. **TAHAP 3: ZERO-ERROR CODE CHECK, QA, SECURITY TESTING & UPDATE MEMORY**
   - **Zero-Error Policy:** Inspeksi setiap baris kode, pastikan 100% tidak ada error syntax, build error, atau type error.
   - **Security & Feature Testing:** Pastikan tidak ada bug, vulnerability, atau regresi fitur.
   - **Update Memori:** Wajib mencatat perubahan yang selesai ke dalam `Agents/memory.md`.

---

## 📁 STRUKTUR PANDUAN & RULES

- `Agents/agent.md` : Panduan detail protokol 3 tahapan.
- `Agents/skill.md` : Spesifikasi keahlian Senior Frontend Developer, Senior Backend Developer, dan Senior QA Engineer.
- `Agents/memory.md` : Log histori perubahan, arsitektur, dan memori proyek.
- `.agent/workflow.md` : Alur kerja bootstrap inisialisasi awal chat.
- `.agent/rules/rules.md` : Aturan direktif workspace.

