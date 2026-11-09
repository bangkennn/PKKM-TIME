# PANDUAN UTAMA AI AGENT (AGENT.MD)

Dokumen ini merupakan pedoman operasional wajib bagi AI Agent dalam menangani setiap instruksi, permintaan fitur, perbaikan bug, maupun refaktorisasi kode dari pengguna. 

AI Agent **WAJIB** mengikuti alur kerja 3 tahapan berikut secara ketat dan berurutan tanpa melewati satu tahap pun.

---

## 🎯 PROTOKOL 3 TAHAPAN KERJA

```
┌────────────────────────────────────────────────────────┐
│                        TAHAP 1                         │
│  Analisis Kebutuhan, Restate Permintaan & Before/After │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                        TAHAP 2                         │
│  Menunggu Konfirmasi & Approval Pengguna Lalu Eksekusi │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                        TAHAP 3                         │
│   Pengecekan Kode (Zero Error), QA & Security Audit    │
│            Update `Agents/memory.md`                   │
└────────────────────────────────────────────────────────┘
```

---

### 📌 TAHAP 1: ANALISIS MENDALAM, RESTASI & RENCANA PERUBAHAN

Pada tahap ini, AI dilarang langsung menulis atau mengubah kode apapun. Fokus utama adalah pemahaman penuh dan penyelarasan ekspektasi dengan pengguna.

1. **Analisis Permintaan Pengguna:**
   - Membaca dan membedah pesan/instruksi pengguna secara menyeluruh.
   - Mengidentifikasi modul, komponen, fungsi, atau arsitektur yang terdampak.
   - Membaca `Agents/memory.md` untuk memahami konteks histori, arsitektur yang sudah dibangun, dan preferensi proyek.

2. **Menjabarkan Ulang (Restate & Clarify):**
   - Menjelaskan kembali apa yang dimaksud oleh pengguna dengan bahasa yang lugas, terstruktur, dan teknis agar tidak terjadi miskomunikasi atau salah asumsi.
   - Menegaskan batasan ruang lingkup (*scope boundaries*) dari task saat ini.

3. **Menyajikan Gambaran Before vs After:**
   - **Before:** Kondisi sistem/kode saat ini (alur logika, struktur data, tampilan, atau bug yang terjadi).
   - **After:** Kondisi sistem/kode yang ditargetkan setelah perubahan diimplementasikan.

4. **Menjabarkan Hasil Akhir yang Diharapkan (Expected Outcome):**
   - Daftar perubahan fungsional dan perilaku baru yang akan didapatkan pengguna.
   - Daftar spesifik file yang akan dibuat (*created*), diubah (*modified*), atau dihapus (*deleted*).
   - Rencana pengujian yang akan dilakukan di Tahap 3.

5. **Penyampaian Rencana ke Pengguna:**
   - Sajikan seluruh poin di atas secara rapi kepada pengguna.
   - Akhiri Tahap 1 dengan permintaan persetujuan (*approval request*) yang jelas.

---

### 📌 TAHAP 2: MENUNGGU APPROVAL PENGGUNA & EKSEKUSI

Tahap ini adalah pintu gerbang (*gatekeeper*) keamanan dan kepatuhan.

1. **Menunggu Konfirmasi Pengguna:**
   - AI **WAJIB MENUNGGU** respon pengguna dan **DILARANG KERAS** mengeksekusi pembuatan/modifikasi file sebelum pengguna memberikan persetujuan eksplisit (seperti: *"Lanjutkan"*, *"Approve"*, *"Oke eksekusi"*, atau variasi persetujuan lainnya).
   - Jika pengguna memberikan masukan, revisi, atau penolakan, AI kembali merevisi rencana Tahap 1 hingga pengguna menyetujuinya.

2. **Eksekusi Rencana:**
   - Begitu persetujuan (*approval*) diberikan oleh pengguna, AI segera mengeksekusi rencana kerja yang telah disepakati pada Tahap 1.
   - Terapkan standar kode profesional sesuai dengan peran yang didefinisikan pada `Agents/skill.md` (Senior Frontend Developer & Senior Backend Developer).
   - Pastikan penulisan kode bersih (*clean code*), modular, efisien, aman, dan mudah dipelihara.

---

### 📌 TAHAP 3: INSPEKSI KODE, QA, SECURITY TESTING & UPDATE MEMORY

Setelah eksekusi kode selesai, tugas AI belum berakhir sampai proses verifikasi selesai secara komprehensif.

1. **Inspeksi Kode Ketat (Zero-Error Policy):**
   - Periksa ulang setiap baris kode yang dibuat atau dimodifikasi.
   - **TIDAK BOLEH ADA 1 BARIS PUN YANG ERROR**, broken imports, missing dependencies, syntax error, tipe data tidak valid (type errors), atau logika yang terputus.
   - Jalankan build / linter / type-check jika perkakas tersedia di proyek untuk membuktikan kode valid.

2. **Testing Fitur & Fungsionalitas (Senior QA Standard):**
   - Verifikasi bahwa semua fitur baru atau perbaikan berjalan dengan lancar sesuai dengan *Expected Outcome* pada Tahap 1.
   - Lakukan pengujian pada kondisi normal (*positive testing*) serta skenario ekstrem (*boundary & negative testing*).
   - Pastikan tidak ada regresi (fitur lama yang rusak akibat penambahan kode baru).

3. **Security Audit & Protection:**
   - Audit celah keamanan seperti input injection, cross-site scripting (XSS), kebocoran kredensial/token/variabel sensitif, sanitasi input yang buruk, dan otorisasi yang longgar.
   - Pastikan penanganan error tidak mengekspos stack trace atau data sensitif ke pengguna akhir.

4. **Pembaruan Memori (`Agents/memory.md`):**
   - Catat rincian perubahan yang telah diselesaikan ke dalam `Agents/memory.md` (tanggal, fitur/task, file yang diubah, dan status QA).
   - Perbarui catatan arsitektur jika ada penambahan komponen atau library baru.

5. **Laporan Akhir kepada Pengguna:**
   - Berikan rangkuman hasil eksekusi, bukti verifikasi pengujian, dan konfirmasi bahwa semua sistem berjalan normal tanpa bug.

---

## ⚠️ ATURAN KEPATUHAN MUTLAK (NON-NEGOTIABLE)

1. **Dilarang Skip Tahapan:** Melewatkan Tahap 1 langsung ke Tahap 2 atau melewatkan Tahap 3 adalah pelanggaran aturan protokol.
2. **Dilarang Asumsi Tanpa Approval:** Tidak diperbolehkan berasumsi bahwa pengguna setuju sebelum pengguna mengetikkan kata setuju/approve.
3. **Standar Kualitas Senior:** Kode yang dihasilkan harus memenuhi kriteria arsitektur yang matang seperti tertulis pada `Agents/skill.md`.
4. **Sinkronisasi Memory:** Setiap perubahan yang telah dieksekusi wajib terdokumentasi di `Agents/memory.md`.

