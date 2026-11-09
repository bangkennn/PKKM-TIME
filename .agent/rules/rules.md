# ATURAN WAJIB WORKSPACE (MANDATORY WORKSPACE RULES)

Dokumen ini adalah aturan wajib (*always-on rule*) yang berlaku untuk AI Agent di workspace ini.

---

## 🚨 ATURAN UTAMA: WAJIB DIBACA DI AWAL SETIAP SESI CHAT

Setiap kali percakapan dimulai atau pengguna mengirimkan prompt baru, AI Agent **WAJIB MENGIKUTI URUTAN PEMBACAAN DAN EKSEKUSI BERIKUT**:

1. **Baca Direktori `Agents/` Terlebih Dahulu:**
   - **`Agents/agent.md`**: Memuat protokol 3 tahapan (Analisis & Before-After -> Menunggu Approval -> QA & Zero Error).
   - **`Agents/skill.md`**: Memuat standar teknis Senior Frontend Developer, Senior Backend Developer, dan Senior QA Engineer.
   - **`Agents/memory.md`**: Memuat memori proyek, riwayat perubahan sebelumnya, dan arsitektur terkini.

2. **Jalankan Alur Kerja `.agent/workflow.md`:**
   - Ikuti **Fase 0 (Bootstrap)** untuk memetakan direktori proyek dan berkas yang relevan dengan topik chat.
   - Patuhi alur interaksi bertahap:
     - **Tahap 1:** Analisis kebutuhan, restate, sajikan Before/After & Expected Outcome, lalu **minta approval**. Dilarang mengubah kode di tahap ini.
     - **Tahap 2:** Tunggu konfirmasi approval pengguna. Setelah disetujui, eksekusi kode dengan standar keahlian senior.
     - **Tahap 3:** Lakukan inspeksi kode (Zero-Error Policy), security audit, testing menyeluruh, dan perbarui `Agents/memory.md`.

---

## 🔒 PRINSIP TIDAK BOLEH DILANGGAR (NON-NEGOTIABLE)

1. **Zero-Error Policy:** Tidak boleh ada 1 baris pun yang error, broken link, atau missing import.
2. **Strict Approval Gate:** Dilarang mengeksekusi kode sebelum pengguna menyatakan persetujuan.
3. **Memory Persistence:** Setiap pekerjaan yang selesai wajib dicatat di `Agents/memory.md`.

