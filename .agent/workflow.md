# WORKFLOW OPERASIONAL AI AGENT (.AGENT/WORKFLOW.MD)

Dokumen ini adalah mesin orkestrasi operasional yang **WAJIB DIJALANKAN OLEH AI AGENT PADA SETIAP AWAL PERCAKAPAN (SETIAP AWAL CHAT)** sebelum merespons pengguna.

---

## 🚀 FASE 0: PROTOKOL BOOTSTRAP AWAL CHAT (MANDATORY INITIALIZATION)

Setiap kali pengguna mengirimkan pesan pertama atau pesan baru dalam sesi chat, AI Agent **WAJIB** mengeksekusi urutan inisialisasi berikut di balik layar:

```
                  ┌──────────────────────────────────────────────┐
                  │ 1. BACA `Agents/agent.md`                    │
                  │    (Pahami 3 Tahapan Protokol Kerja)         │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ 2. BACA `Agents/skill.md`                    │
                  │    (Adopsi Standar Senior Frontend/Backend/QA)│
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ 3. BACA `Agents/memory.md`                   │
                  │    (Pahami History, Arsitektur & Context)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ 4. SURVEY / SCAN FOLDER PROYEK               │
                  │    (Petakan File yang Relevan dengan Chat)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ 5. MASUK KE TAHAP 1: ANALISIS & RESTASI      │
                  └──────────────────────────────────────────────┘
```

### Detail Langkah Inisialisasi:
1. **Membaca `Agents/agent.md`:**
   Mengunci aturan bahwa AI tidak boleh langsung mengutak-atik kode sebelum melewati Tahap 1 dan mendapatkan Approval di Tahap 2.
2. **Membaca `Agents/skill.md`:**
   Memposisikan diri dan menerapkan mindset Senior Frontend Developer, Senior Backend Developer, dan Senior QA Engineer.
3. **Membaca `Agents/memory.md`:**
   Memeriksa riwayat perubahan terakhir, arsitektur saat ini, dan ADR (Architectural Decision Records) agar solusi yang dibuat selaras dengan apa yang pernah dikerjakan.
4. **Menganalisis Folder & File Terkait:**
   Melakukan eksplorasi direktori proyek untuk mengidentifikasi file-file mana saja yang akan terpengaruh oleh permintaan pengguna saat ini.

---

## 🔄 WORKFLOW 3 TAHAPAN EKSEKUSI

Setelah inisialisasi selesai, AI wajib mengikuti alur kerja interaktif berikut:

### 1️⃣ ALUR KERJA TAHAP 1 (Analisis & Proposal Rencana)
- **Input:** Pesan/Permintaan dari pengguna.
- **Tindakan AI:**
  1. Bedah kebutuhan pengguna.
  2. Susun ringkasan pemahaman dalam format **Restate**.
  3. Sajikan tabel/perbandingan **Before vs After**:
     - *Kondisi Sebelum:* Masalah saat ini atau fitur yang belum ada.
     - *Kondisi Sesudah:* Solusi yang akan diimplementasikan.
  4. Jabarkan **Expected Outcome** & daftar berkas yang akan dibuat/diedit.
  5. Ajukan pertanyaan persetujuan:
     > *"Rencana pengerjaan di atas telah saya susun secara detail. Apakah Anda menyetujuinya (Approve) untuk segera saya eksekusi ke kode program?"*
- **Larangan Keras:** **DILARANG** melakukan `write_file`, `edit_file`, atau perubahan kode apapun pada tahap ini!

---

### 2️⃣ ALUR KERJA TAHAP 2 (Approval & Eksekusi)
- **Kondisi Masuk:** Pengguna memberikan konfirmasi verbal/teks persetujuan (*Approve / Lanjutkan / Oke / Eksekusi*).
  - *Jika pengguna meminta revisi:* AI memperbarui analisis Tahap 1 dan meminta approval ulang.
  - *Jika pengguna belum merespons:* AI tetap menunggu dan tidak melakukan modifikasi kode.
- **Tindakan AI Setelah Approval:**
  1. Mulai mengeksekusi berkas kode secara terstruktur dan bertahap.
  2. Menerapkan seluruh standar clean code, typing, error handling, dan modularitas sesuai `Agents/skill.md`.
  3. Memastikan setiap fungsi terisolasi dengan baik dan tidak ada *dead code*.

---

### 3️⃣ ALUR KERJA TAHAP 3 (QA, Zero Error, Security & Memory Update)
- **Kondisi Masuk:** Semua kode dari Tahap 2 telah selesai ditulis.
- **Tindakan AI:**
  1. **Zero-Error Inspection:** Memeriksa seluruh baris kode yang baru ditulis. Pastikan tidak ada syntax error, broken imports, missing types, atau error tersembunyi.
  2. **Security & Edge Case Testing:** Simulasikan skenario input buruk, boundary condition, proteksi data sensitif, dan sanitasi payload.
  3. **Verifikasi Fungsional:** Pastikan hasil implementasi sesuai 100% dengan apa yang dijanjikan pada *Expected Outcome* Tahap 1.
  4. **Pembaruan Memori:** Buka dan edit file `Agents/memory.md`, tambahkan log eksekusi baru pada tabel riwayat perubahan, dan perbarui status arsitektur jika relevan.
  5. **Laporan Final:** Sajikan laporan komprehensif kepada pengguna bahwa kode telah berhasil diuji dan siap digunakan tanpa error.

---

## 📋 CHECKLIST WAJIB SEBELUM MERESPONS

Sebelum AI mengirimkan balasan apapun ke chat:
- [ ] Apakah saya sudah membaca `Agents/agent.md`, `Agents/skill.md`, dan `Agents/memory.md`?
- [ ] Jika ini permintaan baru, apakah saya menyajikan analisis Before/After dan meminta approval (Tahap 1)?
- [ ] Jika saya memodifikasi kode, apakah pengguna SUDAH memberikan approval eksplisit (Tahap 2)?
- [ ] Jika saya selesai memodifikasi kode, apakah saya sudah melakukan QA Zero-Error dan memperbarui `Agents/memory.md` (Tahap 3)?

