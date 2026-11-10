const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ppkm_stmik_time",
    port: 3306,
  });

  console.log("Connected to MySQL database...");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS \`document_templates\` (
      \`id\` VARCHAR(64) PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`category\` ENUM('proposal', 'laporan') NOT NULL,
      \`description\` TEXT NULL,
      \`filename\` VARCHAR(255) NOT NULL,
      \`file_size\` VARCHAR(50) NOT NULL DEFAULT '0 KB',
      \`file_data\` LONGTEXT NULL,
      \`version\` VARCHAR(50) NOT NULL DEFAULT 'v2026.1',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.query(createTableQuery);
  console.log("Table document_templates created or verified.");

  // Check if initial seed exists
  const [rows] = await connection.query("SELECT COUNT(*) as count FROM `document_templates`");
  if (rows[0].count === 0) {
    console.log("Seeding default .docx templates...");
    const seeds = [
      {
        id: "tpl-prop-penelitian",
        title: "Template Usulan Proposal Penelitian",
        category: "proposal",
        description: "Format baku pengajuan proposal Penelitian Dosen Pemula (PDP) dan Terapan STMIK TIME, memuat format halaman judul, latar belakang, metode, jadwal, dan susunan tim.",
        filename: "Template_Proposal_Penelitian_STMIK_TIME.docx",
        file_size: "148 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-prop-pkm",
        title: "Template Usulan Proposal Pengabdian (PKM)",
        category: "proposal",
        description: "Format resmi pengajuan proposal Pengabdian kepada Masyarakat (PKM-M, PKM-PI, PKM-K), mencakup profil mitra, analisis situasi, solusi permasalahan, dan rencana kerja.",
        filename: "Template_Proposal_Pengabdian_PKM_STMIK_TIME.docx",
        file_size: "154 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-prop-pengesahan",
        title: "Format Lembar Pengesahan Proposal LPPM",
        category: "proposal",
        description: "Halaman pengesahan resmi berlogo STMIK TIME dengan kolom tanda tangan Ketua Peneliti/Pelaksana, Ketua Program Studi, dan Kepala LPPM STMIK TIME.",
        filename: "Lembar_Pengesahan_Proposal_STMIK_TIME.docx",
        file_size: "72 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-lap-kemajuan",
        title: "Template Laporan Kemajuan (Tahap 2)",
        category: "laporan",
        description: "Format pelaporan progres kegiatan penelitian/PKM 70%, rekapitulasi capaian luaran antara, kendala teknis lapangan, dan ringkasan penyerapan dana termin 1.",
        filename: "Template_Laporan_Kemajuan_Tahap2_STMIK_TIME.docx",
        file_size: "138 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-lap-akhir",
        title: "Template Laporan Akhir Komprehensif (Tahap 3)",
        category: "laporan",
        description: "Format laporan final komprehensif 100% penyelesaian riset/PKM, ringkasan eksekutif, pembahasan hasil, dokumentasi foto, dan bukti penyerahan luaran wajib/tambahan.",
        filename: "Template_Laporan_Akhir_Tahap3_STMIK_TIME.docx",
        file_size: "165 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-lap-logbook",
        title: "Format Logbook / Catatan Harian Kegiatan",
        category: "laporan",
        description: "Buku catatan harian/mingguan pelaksanaan kegiatan Dosen, berisi kolom tanggal, kegiatan yang dilaksanakan, persentase progres, dan paraf/persetujuan ketua pelaksana.",
        filename: "Format_Logbook_Catatan_Harian_STMIK_TIME.docx",
        file_size: "82 KB",
        version: "v2026.1"
      },
      {
        id: "tpl-lap-spj",
        title: "Format Laporan Pertanggungjawaban Keuangan (SPJ)",
        category: "laporan",
        description: "Format baku pelaporan administrasi keuangan riset, kuitansi bermaterai, rekapitulasi bukti pengeluaran riil, dan lampiran potongan pajak.",
        filename: "Format_SPJ_Keuangan_LPPM_STMIK_TIME.docx",
        file_size: "115 KB",
        version: "v2026.1"
      }
    ];

    for (const seed of seeds) {
      await connection.query(
        "INSERT INTO `document_templates` (id, title, category, description, filename, file_size, version) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [seed.id, seed.title, seed.category, seed.description, seed.filename, seed.file_size, seed.version]
      );
    }
    console.log(`Seeded ${seeds.length} default .docx templates.`);
  }

  await connection.end();
  console.log("Migration completed successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
