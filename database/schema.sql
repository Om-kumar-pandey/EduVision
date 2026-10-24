-- ==============================================================================
-- AICTE Integrated Institution Complaint Monitoring & Status Dashboard
-- Smart India Hackathon 2026 (Problem Statement ID: 26264)
-- Domain: Smart Automation | Target: Production-Ready Relational Schema (3NF)
-- Database Engine: MySQL 8.0+ | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `aicte_complaints`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `aicte_complaints`;

-- -----------------------------------------------------------------------------
-- Drop Tables in reverse dependency order for safe idempotent recreation
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `import_errors`;
DROP TABLE IF EXISTS `import_batches`;
DROP TABLE IF EXISTS `overlap_alerts`;
DROP TABLE IF EXISTS `transfer_requests`;
DROP TABLE IF EXISTS `case_attachments`;
DROP TABLE IF EXISTS `case_actions`;
DROP TABLE IF EXISTS `cases`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `bureaus`;
DROP TABLE IF EXISTS `institutions`;

-- -----------------------------------------------------------------------------
-- 1. INSTITUTIONS TABLE
-- Verified AICTE institutions identified by permanent AICTE identifier.
-- -----------------------------------------------------------------------------
CREATE TABLE `institutions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `permanent_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `region` VARCHAR(50) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `address` TEXT NULL,
    `institution_type` VARCHAR(100) NULL,
    `approval_status` VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    `contact_email` VARCHAR(150) NULL,
    `contact_phone` VARCHAR(30) NULL,
    `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_institution_permanent_id` (`permanent_id`),
    INDEX `idx_inst_region` (`region`),
    INDEX `idx_inst_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. BUREAUS TABLE
-- AICTE organizational Bureaus and Cells handling grievance categories.
-- -----------------------------------------------------------------------------
CREATE TABLE `bureaus` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `contact_email` VARCHAR(150) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_bureau_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. USERS TABLE
-- Authorized platform officers and administrators with role-based access control.
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `bureau_id` BIGINT NULL,
    `region` VARCHAR(50) NULL,
    `designation` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_bureau` (`bureau_id`),
    CONSTRAINT `fk_users_bureau` FOREIGN KEY (`bureau_id`) REFERENCES `bureaus` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. CASES TABLE
-- Core case records linked to AICTE permanent IDs and assigned Bureaus.
-- -----------------------------------------------------------------------------
CREATE TABLE `cases` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_number` VARCHAR(50) NOT NULL,
    `source_case_id` VARCHAR(50) NULL,
    `institution_id` BIGINT NOT NULL,
    `bureau_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `priority` VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    `status` VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    `receipt_date` DATETIME NOT NULL,
    `expected_disposal_date` DATETIME NULL,
    `disposed_date` DATETIME NULL,
    `created_by_user_id` BIGINT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_case_number` (`case_number`),
    INDEX `idx_cases_institution` (`institution_id`),
    INDEX `idx_cases_bureau` (`bureau_id`),
    INDEX `idx_cases_status` (`status`),
    INDEX `idx_cases_priority` (`priority`),
    INDEX `idx_cases_receipt_date` (`receipt_date`),
    INDEX `idx_cases_disposal_date` (`expected_disposal_date`),
    CONSTRAINT `fk_cases_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_cases_bureau` FOREIGN KEY (`bureau_id`) REFERENCES `bureaus` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_cases_created_by` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. CASE ACTIONS TABLE
-- Chronological, immutable, append-only history of actions, status transitions, and remarks.
-- -----------------------------------------------------------------------------
CREATE TABLE `case_actions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `from_status` VARCHAR(30) NULL,
    `to_status` VARCHAR(30) NULL,
    `remarks` TEXT NOT NULL,
    `next_action` VARCHAR(255) NULL,
    `next_action_due_date` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_case_actions_case_id` (`case_id`),
    INDEX `idx_case_actions_created_at` (`created_at`),
    CONSTRAINT `fk_case_actions_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_case_actions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. CASE ATTACHMENTS TABLE
-- Document metadata for evidentiary uploads linked to complaints.
-- -----------------------------------------------------------------------------
CREATE TABLE `case_attachments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `uploaded_by_user_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_attachments_case` (`case_id`),
    CONSTRAINT `fk_attachments_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_attachments_user` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TRANSFER REQUESTS TABLE
-- Inter-Bureau workflow transferring jurisdiction while strictly preserving Case ID.
-- -----------------------------------------------------------------------------
CREATE TABLE `transfer_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `case_id` BIGINT NOT NULL,
    `from_bureau_id` BIGINT NOT NULL,
    `to_bureau_id` BIGINT NOT NULL,
    `requested_by_user_id` BIGINT NOT NULL,
    `reviewed_by_user_id` BIGINT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `decision_remarks` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_transfer_case_id` (`case_id`),
    INDEX `idx_transfer_status` (`status`),
    CONSTRAINT `fk_transfer_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_transfer_from_bureau` FOREIGN KEY (`from_bureau_id`) REFERENCES `bureaus` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_transfer_to_bureau` FOREIGN KEY (`to_bureau_id`) REFERENCES `bureaus` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_transfer_requested_by` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_transfer_reviewed_by` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. OVERLAP ALERTS TABLE
-- Non-destructive cross-Bureau case detection on identical institution IDs.
-- -----------------------------------------------------------------------------
CREATE TABLE `overlap_alerts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `institution_id` BIGINT NOT NULL,
    `case1_id` BIGINT NOT NULL,
    `case2_id` BIGINT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'DETECTED',
    `classification` VARCHAR(50) NULL,
    `review_remarks` TEXT NULL,
    `reviewed_by_user_id` BIGINT NULL,
    `reviewed_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_overlap_pair` (`case1_id`, `case2_id`),
    INDEX `idx_overlap_institution` (`institution_id`),
    INDEX `idx_overlap_status` (`status`),
    CONSTRAINT `fk_overlap_inst` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_overlap_case1` FOREIGN KEY (`case1_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_overlap_case2` FOREIGN KEY (`case2_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_overlap_reviewed_by` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. IMPORT BATCHES TABLE
-- Administrative bulk CSV ingestion metadata and execution status.
-- -----------------------------------------------------------------------------
CREATE TABLE `import_batches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `batch_number` VARCHAR(50) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `total_rows` INT NOT NULL DEFAULT 0,
    `valid_rows` INT NOT NULL DEFAULT 0,
    `imported_rows` INT NOT NULL DEFAULT 0,
    `failed_rows` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `imported_by_user_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_batch_number` (`batch_number`),
    INDEX `idx_import_batches_status` (`status`),
    CONSTRAINT `fk_import_user` FOREIGN KEY (`imported_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. IMPORT ERRORS TABLE
-- Granular pre-validation and row-level parse errors for bulk ingestion diagnostics.
-- -----------------------------------------------------------------------------
CREATE TABLE `import_errors` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `batch_id` BIGINT NOT NULL,
    `csv_row_number` INT NOT NULL,
    `raw_data` TEXT NULL,
    `error_message` VARCHAR(500) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_import_errors_batch` (`batch_id`),
    CONSTRAINT `fk_import_errors_batch` FOREIGN KEY (`batch_id`) REFERENCES `import_batches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS TABLE
-- System-wide immutable security audit trail logging every administrative & case action.
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `user_email` VARCHAR(150) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(100) NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_created_at` (`created_at`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
