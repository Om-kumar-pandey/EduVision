USE aicte_complaints;

-- 1. Safely add columns to overlap_alerts table
DROP PROCEDURE IF EXISTS upgrade_overlap_schema;
DELIMITER $$
CREATE PROCEDURE upgrade_overlap_schema()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'similarity_score') THEN
        ALTER TABLE overlap_alerts ADD COLUMN similarity_score DOUBLE DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'rule_score') THEN
        ALTER TABLE overlap_alerts ADD COLUMN rule_score DOUBLE DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'semantic_score') THEN
        ALTER TABLE overlap_alerts ADD COLUMN semantic_score DOUBLE DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'review_band') THEN
        ALTER TABLE overlap_alerts ADD COLUMN review_band VARCHAR(30) DEFAULT 'INCONCLUSIVE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'decision_status') THEN
        ALTER TABLE overlap_alerts ADD COLUMN decision_status VARCHAR(50) DEFAULT 'AWAITING_REVIEW';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'explanation_json') THEN
        ALTER TABLE overlap_alerts ADD COLUMN explanation_json LONGTEXT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'matching_version') THEN
        ALTER TABLE overlap_alerts ADD COLUMN matching_version VARCHAR(50) DEFAULT 'HYBRID-V2.1-TFIDF-COSINE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'analysis_timestamp') THEN
        ALTER TABLE overlap_alerts ADD COLUMN analysis_timestamp DATETIME NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'coordination_status') THEN
        ALTER TABLE overlap_alerts ADD COLUMN coordination_status VARCHAR(30) DEFAULT 'NONE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'primary_case_id') THEN
        ALTER TABLE overlap_alerts ADD COLUMN primary_case_id BIGINT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'aicte_complaints' AND TABLE_NAME = 'overlap_alerts' AND COLUMN_NAME = 'reversal_history') THEN
        ALTER TABLE overlap_alerts ADD COLUMN reversal_history LONGTEXT NULL;
    END IF;
END $$
DELIMITER ;

CALL upgrade_overlap_schema();
DROP PROCEDURE IF EXISTS upgrade_overlap_schema;

-- 2. Create coordination_requests table if not exists
CREATE TABLE IF NOT EXISTS coordination_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    overlap_alert_id BIGINT NULL,
    primary_case_id BIGINT NOT NULL,
    linked_case_id BIGINT NOT NULL,
    initiating_bureau_id BIGINT NOT NULL,
    target_bureau_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    deadline DATETIME NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    officer_remarks TEXT NULL,
    response_document_ref VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coord_status (status),
    INDEX idx_coord_primary_case (primary_case_id),
    INDEX idx_coord_target_bureau (target_bureau_id),
    CONSTRAINT fk_coord_primary_case FOREIGN KEY (primary_case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_coord_linked_case FOREIGN KEY (linked_case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_coord_init_bureau FOREIGN KEY (initiating_bureau_id) REFERENCES bureaus(id),
    CONSTRAINT fk_coord_target_bureau FOREIGN KEY (target_bureau_id) REFERENCES bureaus(id),
    CONSTRAINT fk_coord_user FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create case_relationships table if not exists
CREATE TABLE IF NOT EXISTS case_relationships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_case_id BIGINT NOT NULL,
    target_case_id BIGINT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    similarity_score DOUBLE NULL,
    notes TEXT NULL,
    created_by_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rel_source (source_case_id),
    INDEX idx_rel_target (target_case_id),
    INDEX idx_rel_type (relationship_type),
    CONSTRAINT fk_rel_source FOREIGN KEY (source_case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_target FOREIGN KEY (target_case_id) REFERENCES cases(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_user FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
