const mysql = require('mysql2/promise');

async function migrate() {
  const p = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ppkm_stmik_time'
  });

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`pkm_proposals\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`user_id\` VARCHAR(36) NOT NULL,
      \`author_name\` VARCHAR(100) NOT NULL,
      \`team_members\` JSON DEFAULT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`scheme\` VARCHAR(100) NOT NULL,
      \`academic_year\` VARCHAR(20) NOT NULL,
      \`duration_months\` INT NOT NULL DEFAULT 6,
      \`pkm_topic\` VARCHAR(100) DEFAULT NULL,
      \`proposal_year\` INT DEFAULT NULL,
      \`budget\` BIGINT NOT NULL DEFAULT 0,
      \`abstract\` TEXT DEFAULT NULL,
      \`file_name\` VARCHAR(255) DEFAULT NULL,
      \`file_custom_name\` VARCHAR(255) DEFAULT NULL,
      \`file_kemajuan\` VARCHAR(255) DEFAULT NULL,
      \`luaran_jenis\` VARCHAR(150) DEFAULT NULL,
      \`luaran_target\` VARCHAR(150) DEFAULT NULL,
      \`luaran_keterangan\` TEXT DEFAULT NULL,
      \`target_luaran_nama\` VARCHAR(255) DEFAULT NULL,
      \`target_luaran_keterangan\` TEXT DEFAULT NULL,
      \`file_akhir\` VARCHAR(255) DEFAULT NULL,
      \`luaran_akhir_jenis\` VARCHAR(150) DEFAULT NULL,
      \`luaran_akhir_realisasi\` VARCHAR(150) DEFAULT NULL,
      \`luaran_akhir_link\` VARCHAR(255) DEFAULT NULL,
      \`luaran_akhir_keterangan\` TEXT DEFAULT NULL,
      \`status_tahap1\` ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
      \`status_tahap2\` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
      \`status_tahap3\` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
      \`overall_status\` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      INDEX \`idx_pkm_user_id\` (\`user_id\`),
      INDEX \`idx_pkm_status_tahap1\` (\`status_tahap1\`),
      INDEX \`idx_pkm_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Tabel pkm_proposals berhasil dibuat di MySQL.');

  const [rows] = await p.query('SELECT COUNT(*) as count FROM pkm_proposals');
  if (rows[0].count === 0) {
    const sample1Team = JSON.stringify([
      { name: "Dr. Ir. Hendra Wijaya, M.Kom.", role: "Ketua Pengusul" },
      { name: "Dewi Lestari, S.Kom., M.T.", role: "Anggota Pelaksana 1" }
    ]);
    const sample2Team = JSON.stringify([
      { name: "Prof. Budi Santoso, Ph.D.", role: "Ketua Pengusul" },
      { name: "Rina Marlina, M.Kom.", role: "Anggota Pelaksana 1" },
      { name: "Kevin Andrea", role: "Anggota Mahasiswa" }
    ]);

    await p.query(`
      INSERT INTO \`pkm_proposals\` 
      (id, user_id, author_name, team_members, title, scheme, academic_year, duration_months, pkm_topic, proposal_year, budget, abstract, file_name, file_custom_name, luaran_jenis, target_luaran_nama, target_luaran_keterangan, status_tahap1, status_tahap2, status_tahap3, overall_status)
      VALUES 
      ('pkm-uuid-001', 'dosen-uuid-001', 'Dr. Ir. Hendra Wijaya, M.Kom.', ?, 'Pemberdayaan Digital Marketing dan Pembukuan Berbasis Aplikasi pada Komunitas UMKM Kuliner Kota Medan', 'PKM Kemitraan Masyarakat (PKM-M)', '2026/2027', 6, 'Pemberdayaan UMKM & Ekonomi Kreatif', 2026, 18500000, 'Program PKM ini berfokus pada pendampingan 25 pelaku UMKM binaan dalam adopsi pemasaran digital dan pencatatan kas otomatis.', 'Proposal_PKM_UMKM_Medan.pdf', 'Proposal_PKM_UMKM_Medan.pdf', 'Publikasi di Jurnal Pengabdian kepada Masyarakat (SINTA)', 'Disubmit di Jurnal Pengabdian SINTA 3', 'Target submit sebelum evaluasi kemajuan periode 1', 'approved', 'in_progress', 'locked', 'in_progress'),
      ('pkm-uuid-002', 'dosen-uuid-002', 'Prof. Budi Santoso, Ph.D.', ?, 'Pelatihan Keamanan Siber dan Literasi Privasi Data Siswa bagi Guru SMK TI se-Kota Medan', 'PKM Penerapan Iptek (PKM-PI)', '2026/2027', 6, 'Literasi Digital & Teknologi Informasi Masyarakat', 2026, 15000000, 'Pemberian modul literasi keamanan digital dan proteksi data pribadi guna membekali tenaga pendidik SMK.', 'Proposal_PKM_Literasi_Cyber.pdf', 'Proposal_PKM_Literasi_Cyber.pdf', 'Publikasi Media Massa Cetak / Elektronik', 'Terbit di Harian Waspada / Portal Berita Kampus', 'Publikasi artikel populer hasil pengabdian masyarakat', 'pending_review', 'locked', 'locked', 'in_progress')
    `, [sample1Team, sample2Team]);
    console.log('Seed sample data pkm_proposals berhasil ditambahkan.');
  }

  await p.end();
}

migrate().catch(console.error);

