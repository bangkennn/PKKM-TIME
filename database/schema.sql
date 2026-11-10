-- ============================================================
-- SKEMA BASIS DATA MYSQL / PHPMYADMIN (XAMPP)
-- Database: ppkm_stmik_time
-- ============================================================

-- 1. Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS `ppkm_stmik_time` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ppkm_stmik_time`;

-- 2. Buat tabel pengguna `users` untuk autentikasi SiPANDU
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `groups` ENUM('dosen', 'lpmi', 'admin') NOT NULL DEFAULT 'dosen',
  `email` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`),
  INDEX `idx_groups` (`groups`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Data Awal Pengguna (Seed Users)
-- Password untuk semua akun default: password123
INSERT INTO `users` (`id`, `username`, `password`, `name`, `groups`, `email`)
VALUES
  ('dosen-uuid-001', 'dosen', '$2b$10$617Pg/rmRgBvRM/Clk3gIur2w7CCzTLyx8JwTXHTPcVHNrRWD6KBS', 'Dr. Ir. Hendra Wijaya, M.Kom.', 'dosen', 'hendra.wijaya@stmik-time.ac.id'),
  ('dosen-uuid-002', '0123456789', '$2b$10$617Pg/rmRgBvRM/Clk3gIur2w7CCzTLyx8JwTXHTPcVHNrRWD6KBS', 'Prof. Budi Santoso, Ph.D.', 'dosen', 'budi.santoso@stmik-time.ac.id'),
  ('lpmi-uuid-001', 'lpmi', '$2b$10$617Pg/rmRgBvRM/Clk3gIur2w7CCzTLyx8JwTXHTPcVHNrRWD6KBS', 'Dewi Lestari, S.Kom., M.T. (LPMI)', 'lpmi', 'lpmi@stmik-time.ac.id'),
  ('admin-uuid-001', 'admin', '$2b$10$617Pg/rmRgBvRM/Clk3gIur2w7CCzTLyx8JwTXHTPcVHNrRWD6KBS', 'Administrator Utama SiPANDU', 'admin', 'admin@stmik-time.ac.id')
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `groups` = VALUES(`groups`),
  `password` = VALUES(`password`);

-- 4. Buat tabel utama `ppkm_entries`
CREATE TABLE IF NOT EXISTS `ppkm_entries` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `duration_minutes` INT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `student_id` VARCHAR(50) DEFAULT NULL,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_student_id` (`student_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Buat tabel usulan penelitian `research_proposals`
CREATE TABLE IF NOT EXISTS `research_proposals` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `team_members` JSON DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `scheme` VARCHAR(100) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `duration_months` INT NOT NULL DEFAULT 6,
  `research_topic` VARCHAR(100) DEFAULT NULL,
  `proposal_year` INT DEFAULT NULL,
  `budget` BIGINT NOT NULL DEFAULT 0,
  `abstract` TEXT DEFAULT NULL,
  `file_name` VARCHAR(255) DEFAULT NULL,
  `file_custom_name` VARCHAR(255) DEFAULT NULL,
  `file_kemajuan` VARCHAR(255) DEFAULT NULL,
  `luaran_jenis` VARCHAR(150) DEFAULT NULL,
  `luaran_target` VARCHAR(150) DEFAULT NULL,
  `luaran_keterangan` TEXT DEFAULT NULL,
  `target_luaran_nama` VARCHAR(255) DEFAULT NULL,
  `target_luaran_keterangan` TEXT DEFAULT NULL,
  `file_akhir` VARCHAR(255) DEFAULT NULL,
  `luaran_akhir_jenis` VARCHAR(150) DEFAULT NULL,
  `luaran_akhir_realisasi` VARCHAR(150) DEFAULT NULL,
  `luaran_akhir_link` VARCHAR(255) DEFAULT NULL,
  `luaran_akhir_keterangan` TEXT DEFAULT NULL,
  `status_tahap1` ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
  `status_tahap2` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
  `status_tahap3` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
  `overall_status` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status_tahap1` (`status_tahap1`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Buat tabel usulan pengabdian kepada masyarakat `pkm_proposals`
CREATE TABLE IF NOT EXISTS `pkm_proposals` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `team_members` JSON DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `scheme` VARCHAR(100) NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL,
  `duration_months` INT NOT NULL DEFAULT 6,
  `pkm_topic` VARCHAR(100) DEFAULT NULL,
  `proposal_year` INT DEFAULT NULL,
  `budget` BIGINT NOT NULL DEFAULT 0,
  `abstract` TEXT DEFAULT NULL,
  `file_name` VARCHAR(255) DEFAULT NULL,
  `file_custom_name` VARCHAR(255) DEFAULT NULL,
  `file_kemajuan` VARCHAR(255) DEFAULT NULL,
  `luaran_jenis` VARCHAR(150) DEFAULT NULL,
  `luaran_target` VARCHAR(150) DEFAULT NULL,
  `luaran_keterangan` TEXT DEFAULT NULL,
  `target_luaran_nama` VARCHAR(255) DEFAULT NULL,
  `target_luaran_keterangan` TEXT DEFAULT NULL,
  `file_akhir` VARCHAR(255) DEFAULT NULL,
  `luaran_akhir_jenis` VARCHAR(150) DEFAULT NULL,
  `luaran_akhir_realisasi` VARCHAR(150) DEFAULT NULL,
  `luaran_akhir_link` VARCHAR(255) DEFAULT NULL,
  `luaran_akhir_keterangan` TEXT DEFAULT NULL,
  `status_tahap1` ENUM('draft', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
  `status_tahap2` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
  `status_tahap3` ENUM('locked', 'in_progress', 'pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'locked',
  `overall_status` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_pkm_user_id` (`user_id`),
  INDEX `idx_pkm_status_tahap1` (`status_tahap1`),
  INDEX `idx_pkm_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABEL DOCUMENT TEMPLATES (Template Berkas Resmi LPPM .docx)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `document_templates` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('proposal', 'laporan') NOT NULL,
  `description` TEXT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NOT NULL DEFAULT '0 KB',
  `file_data` LONGTEXT NULL,
  `version` VARCHAR(50) NOT NULL DEFAULT 'v2026.1',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_template_category` (`category`),
  INDEX `idx_template_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
