-- ============================================================
-- SKEMA BASIS DATA MYSQL / PHPMYADMIN (XAMPP)
-- Database: ppkm_stmik_time
-- ============================================================

-- 1. Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS `ppkm_stmik_time` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ppkm_stmik_time`;

-- 2. Buat tabel utama `ppkm_entries`
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

-- 3. Data Awal (Sample Seed Data) untuk pengujian langsung
INSERT INTO `ppkm_entries` (`id`, `title`, `category`, `duration_minutes`, `description`, `student_id`) VALUES
('e8031e42-7a54-4bb5-9fc2-6019a12a0001', 'Bimbingan Skripsi Bab 1-3', 'Kegiatan Kampus', 90, 'Konsultasi metodologi penelitian dengan dosen pembimbing', 'MHS2026001'),
('e8031e42-7a54-4bb5-9fc2-6019a12a0002', 'Pengabdian Masyarakat di Desa Sukamaju', 'Pengabdian Masyarakat', 240, 'Penyuluhan literasi digital untuk perangkat desa', 'MHS2026001'),
('e8031e42-7a54-4bb5-9fc2-6019a12a0003', 'Pengumpulan Data Kuesioner Lapangan', 'Riset & Publikasi', 120, 'Distribusi dan verifikasi data responden penelitian', 'MHS2026002')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
