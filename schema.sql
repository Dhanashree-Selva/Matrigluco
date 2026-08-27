-- =============================================================================
-- MatriGluco — Intelligent Maternal Health & GDM Risk Platform
-- Complete MySQL / MariaDB Production Schema Definition
--
-- Target Database : MySQL 8.0+ / MariaDB 10.5+ (XAMPP & Managed Cloud MySQL)
-- Default Encoding: utf8mb4
-- Default Collate : utf8mb4_unicode_ci
-- Timezone        : UTC (+00:00)
-- Version         : 3.0.0 (Core Platform + Offline Local LLM / RAG Subsystem)
-- Generated Date  : 2026-08-17
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET time_zone = '+00:00';

-- -----------------------------------------------------------------------------
-- Database Initialization
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `matrigluco`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `matrigluco`;

-- =============================================================================
-- DOMAIN 1: AUTHENTICATION, USERS & ACCESS CONTROL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 1: users
-- Purpose: Core application user identity record (Preserves Supabase UUIDs if migrating)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` CHAR(36) NOT NULL COMMENT 'Stable application UUID, preserve Supabase UUID where possible',
    `email` VARCHAR(254) NOT NULL COMMENT 'Normalized login email',
    `password_hash` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Argon2 hash for local authentication, NULL during migration until reset',
    `role` VARCHAR(32) NOT NULL DEFAULT 'user' COMMENT 'Authorization role such as user/admin',
    `status` VARCHAR(32) NOT NULL DEFAULT 'active' COMMENT 'Account lifecycle state',
    `auth_source` VARCHAR(32) NOT NULL DEFAULT 'local' COMMENT 'Origin such as local or migrated_supabase',
    `legacy_auth_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Optional source authentication identifier',
    `email_verified_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'UTC verification time',
    `last_login_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'UTC last successful authentication time',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last update timestamp',
    `deleted_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Soft-delete timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    UNIQUE KEY `uq_users_legacy_auth_id` (`legacy_auth_id`),
    INDEX `idx_users_role_status` (`role`, `status`),
    INDEX `idx_users_created_at` (`created_at`),
    INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Core user identity and authentication credentials';

-- -----------------------------------------------------------------------------
-- Table 2: user_profiles
-- Purpose: Extended demographic and personal profile details (1:1 with users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_profiles` (
    `user_id` CHAR(36) NOT NULL COMMENT 'One-to-one profile owner reference',
    `full_name` VARCHAR(160) NULL DEFAULT NULL COMMENT 'Display name',
    `date_of_birth` DATE NULL DEFAULT NULL COMMENT 'Optional date of birth',
    `phone` VARCHAR(32) NULL DEFAULT NULL COMMENT 'Contact phone',
    `country_code` CHAR(2) NULL DEFAULT NULL COMMENT 'ISO-3166 alpha-2 country code',
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata' COMMENT 'IANA timezone, default Asia/Kolkata',
    `avatar_file_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Profile image file identifier (logical reference to file_assets.id)',
    `preferred_language` VARCHAR(16) NOT NULL DEFAULT 'en' COMMENT 'UI/notification language',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Update timestamp',
    PRIMARY KEY (`user_id`),
    INDEX `idx_user_profiles_phone` (`phone`),
    INDEX `idx_user_profiles_avatar` (`avatar_file_id`),
    CONSTRAINT `fk_user_profiles_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Extended user demographic and preference profiles';

-- -----------------------------------------------------------------------------
-- Table 3: user_sessions
-- Purpose: Active refresh tokens and persistent device sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_sessions` (
    `id` CHAR(36) NOT NULL COMMENT 'Session UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Session owner',
    `refresh_token_hash` CHAR(64) NOT NULL COMMENT 'SHA-256 hash of refresh token, never store raw token',
    `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'IPv4/IPv6 address',
    `user_agent` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Client user agent',
    `issued_at` DATETIME(6) NOT NULL COMMENT 'Session issue time',
    `expires_at` DATETIME(6) NOT NULL COMMENT 'Absolute expiry time',
    `last_seen_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Last refresh/use time',
    `revoked_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Revocation timestamp',
    `revoke_reason` VARCHAR(120) NULL DEFAULT NULL COMMENT 'Logout/security reason',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_sessions_token_hash` (`refresh_token_hash`),
    INDEX `idx_user_sessions_user_id` (`user_id`),
    INDEX `idx_user_sessions_expires_at` (`expires_at`),
    INDEX `idx_user_sessions_revoked_at` (`revoked_at`),
    CONSTRAINT `fk_user_sessions_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User authentication refresh tokens and active device sessions';

-- -----------------------------------------------------------------------------
-- Table 4: auth_tokens
-- Purpose: Single-use tokens for email verification and password reset
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `auth_tokens` (
    `id` CHAR(36) NOT NULL COMMENT 'Token record UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Token owner',
    `token_type` VARCHAR(32) NOT NULL COMMENT 'email_verification or password_reset',
    `token_hash` CHAR(64) NOT NULL COMMENT 'Hash of one-time token',
    `expires_at` DATETIME(6) NOT NULL COMMENT 'Expiry',
    `consumed_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'One-time use marker',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_auth_tokens_hash` (`token_hash`),
    INDEX `idx_auth_tokens_user_type` (`user_id`, `token_type`),
    INDEX `idx_auth_tokens_expires_at` (`expires_at`),
    INDEX `idx_auth_tokens_consumed_at` (`consumed_at`),
    CONSTRAINT `fk_auth_tokens_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Secure single-use verification and password reset tokens';

-- -----------------------------------------------------------------------------
-- Table 5: consent_records
-- Purpose: User consent tracking for privacy, terms, OCR processing, and research
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `consent_records` (
    `id` CHAR(36) NOT NULL COMMENT 'Consent record UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'User who gave or withdrew consent',
    `consent_type` VARCHAR(64) NOT NULL COMMENT 'privacy, terms, OCR processing, research, etc.',
    `document_version` VARCHAR(32) NOT NULL COMMENT 'Version of consent text',
    `granted` TINYINT(1) NOT NULL COMMENT '1 granted, 0 withdrawn/refused',
    `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Audit context',
    `recorded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'UTC event time',
    PRIMARY KEY (`id`),
    INDEX `idx_consent_records_user_type` (`user_id`, `consent_type`),
    INDEX `idx_consent_records_recorded_at` (`recorded_at`),
    CONSTRAINT `fk_consent_records_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Patient legal consent tracking and audit logs';

-- =============================================================================
-- DOMAIN 2: MATERNAL & PREGNANCY CONTEXT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 6: pregnancy_profiles
-- Purpose: Longitudinal obstetric history and current pregnancy context
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pregnancy_profiles` (
    `id` CHAR(36) NOT NULL COMMENT 'Pregnancy profile UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner',
    `is_current` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Current pregnancy flag',
    `pregnancy_number` SMALLINT UNSIGNED NULL DEFAULT NULL COMMENT 'Pregnancy sequence',
    `gravida` SMALLINT UNSIGNED NULL DEFAULT NULL COMMENT 'Total pregnancies if known',
    `para` SMALLINT UNSIGNED NULL DEFAULT NULL COMMENT 'Birth history if known',
    `estimated_due_date` DATE NULL DEFAULT NULL COMMENT 'Expected delivery date',
    `gestational_age_weeks` DECIMAL(4,1) NULL DEFAULT NULL COMMENT 'Recorded gestational age at update',
    `previous_gdm` TINYINT(1) NULL DEFAULT NULL COMMENT 'History of gestational diabetes',
    `family_history_diabetes` TINYINT(1) NULL DEFAULT NULL COMMENT 'Family-history flag',
    `notes` TEXT NULL DEFAULT NULL COMMENT 'User-entered notes, do not log',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation time',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Update time',
    PRIMARY KEY (`id`),
    INDEX `idx_pregnancy_user_current` (`user_id`, `is_current`),
    INDEX `idx_pregnancy_due_date` (`estimated_due_date`),
    CONSTRAINT `fk_pregnancy_profiles_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Obstetric history and active gestational monitoring profiles';

-- =============================================================================
-- DOMAIN 3: CLINICAL MACHINE LEARNING & RISK INFERENCE REGISTRY
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 7: model_versions
-- Purpose: Registry of trained ML algorithms, artifact paths, features & hyperparameters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `model_versions` (
    `id` CHAR(36) NOT NULL COMMENT 'Model version UUID',
    `model_key` VARCHAR(80) NOT NULL COMMENT 'Stable logical model identifier',
    `version` VARCHAR(40) NOT NULL COMMENT 'Semantic or build version',
    `algorithm` VARCHAR(120) NOT NULL COMMENT 'Algorithm name',
    `artifact_path` VARCHAR(500) NOT NULL COMMENT 'Model artifact path',
    `preprocessor_path` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Scaler/pipeline artifact path if separate',
    `artifact_sha256` CHAR(64) NULL DEFAULT NULL COMMENT 'Artifact checksum',
    `feature_schema` JSON NOT NULL COMMENT 'Ordered model feature contract',
    `metrics_json` JSON NULL DEFAULT NULL COMMENT 'Validation metrics and evaluation metadata',
    `thresholds_json` JSON NULL DEFAULT NULL COMMENT 'Decision/risk threshold configuration',
    `is_active` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether eligible for inference',
    `trained_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Training time',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Registry creation time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_model_versions_key_ver` (`model_key`, `version`),
    INDEX `idx_model_versions_active` (`is_active`),
    INDEX `idx_model_versions_key` (`model_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Machine learning model governance and artifact registry';

-- -----------------------------------------------------------------------------
-- Table 8: risk_assessments
-- Purpose: Immutable GDM and maternal risk inference calculation results
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `risk_assessments` (
    `id` CHAR(36) NOT NULL COMMENT 'Assessment UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Assessment owner',
    `pregnancy_profile_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Optional pregnancy context',
    `model_version_id` CHAR(36) NOT NULL COMMENT 'Exact model used',
    `probability` DECIMAL(7,6) NOT NULL COMMENT 'Raw model probability from 0 to 1',
    `predicted_class` TINYINT(1) NOT NULL COMMENT 'Model class output',
    `risk_level` VARCHAR(24) NOT NULL COMMENT 'Application display band',
    `status` VARCHAR(24) NOT NULL DEFAULT 'completed' COMMENT 'completed/failed/reviewed',
    `source` VARCHAR(32) NOT NULL DEFAULT 'manual' COMMENT 'manual/report/import/API',
    `input_snapshot` JSON NOT NULL COMMENT 'Immutable normalized request snapshot',
    `explanation_json` JSON NULL DEFAULT NULL COMMENT 'Optional explainability result',
    `disclaimer_version` VARCHAR(32) NULL DEFAULT NULL COMMENT 'Displayed disclaimer version',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Inference timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_risk_assessments_user_created` (`user_id`, `created_at`),
    INDEX `idx_risk_assessments_model` (`model_version_id`),
    INDEX `idx_risk_assessments_level` (`risk_level`),
    INDEX `idx_risk_assessments_pregnancy` (`pregnancy_profile_id`),
    CONSTRAINT `fk_risk_assessments_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_risk_assessments_pregnancy`
        FOREIGN KEY (`pregnancy_profile_id`) REFERENCES `pregnancy_profiles` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_risk_assessments_model`
        FOREIGN KEY (`model_version_id`) REFERENCES `model_versions` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maternal clinical risk assessment and machine learning predictions';

-- -----------------------------------------------------------------------------
-- Table 9: risk_assessment_features
-- Purpose: Granular breakdown of individual feature inputs used in risk assessments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `risk_assessment_features` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Efficient feature row key',
    `assessment_id` CHAR(36) NOT NULL COMMENT 'Parent assessment',
    `feature_name` VARCHAR(100) NOT NULL COMMENT 'Canonical model feature name',
    `numeric_value` DECIMAL(16,6) NULL DEFAULT NULL COMMENT 'Numeric value used by model',
    `text_value` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Text representation when required',
    `unit` VARCHAR(32) NULL DEFAULT NULL COMMENT 'Unit when applicable',
    `source` VARCHAR(32) NOT NULL DEFAULT 'manual' COMMENT 'manual/OCR/derived/imported',
    `is_imputed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether value was imputed/defaulted',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Feature audit time',
    PRIMARY KEY (`id`),
    INDEX `idx_raf_assessment_id` (`assessment_id`),
    INDEX `idx_raf_feature_name` (`feature_name`),
    INDEX `idx_raf_assessment_feature` (`assessment_id`, `feature_name`),
    CONSTRAINT `fk_raf_assessment`
        FOREIGN KEY (`assessment_id`) REFERENCES `risk_assessments` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Granular feature-level audit trail for AI inference inputs';

-- =============================================================================
-- DOMAIN 4: LONGITUDINAL HEALTH MEASUREMENTS & DAILY SUMMARIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 10: health_measurements
-- Purpose: Time-series biometric logs (glucose, blood pressure, weight, HbA1c, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `health_measurements` (
    `id` CHAR(36) NOT NULL COMMENT 'Measurement UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner',
    `pregnancy_profile_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Optional pregnancy context',
    `metric_type` VARCHAR(48) NOT NULL COMMENT 'glucose, hba1c, blood_pressure, weight, bmi, etc.',
    `value_primary` DECIMAL(12,4) NOT NULL COMMENT 'Primary numeric value',
    `value_secondary` DECIMAL(12,4) NULL DEFAULT NULL COMMENT 'Secondary value such as diastolic BP',
    `unit` VARCHAR(32) NOT NULL COMMENT 'mg/dL, %, mmHg, kg, kg/m2, etc.',
    `measurement_context` VARCHAR(48) NULL DEFAULT NULL COMMENT 'fasting, post_meal, random, morning, etc.',
    `source` VARCHAR(32) NOT NULL DEFAULT 'manual' COMMENT 'manual/OCR/device/import',
    `measured_at` DATETIME(6) NOT NULL COMMENT 'When measurement was taken',
    `notes` VARCHAR(1000) NULL DEFAULT NULL COMMENT 'Optional note',
    `metadata_json` JSON NULL DEFAULT NULL COMMENT 'Device/import metadata',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Record creation time',
    PRIMARY KEY (`id`),
    INDEX `idx_health_measurements_user_metric` (`user_id`, `metric_type`, `measured_at`),
    INDEX `idx_health_measurements_measured_at` (`measured_at`),
    INDEX `idx_health_measurements_pregnancy` (`pregnancy_profile_id`),
    CONSTRAINT `fk_health_measurements_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_health_measurements_pregnancy`
        FOREIGN KEY (`pregnancy_profile_id`) REFERENCES `pregnancy_profiles` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Biometric health measurements and longitudinal vitals log';

-- -----------------------------------------------------------------------------
-- Table 11: daily_health_summaries
-- Purpose: Aggregated daily health metrics and trend analysis
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `daily_health_summaries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Summary row',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner',
    `summary_date` DATE NOT NULL COMMENT 'Local summary day',
    `measurement_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Measurements included',
    `average_glucose` DECIMAL(10,3) NULL DEFAULT NULL COMMENT 'Calculated metric',
    `average_systolic` DECIMAL(10,3) NULL DEFAULT NULL COMMENT 'Calculated BP metric',
    `average_diastolic` DECIMAL(10,3) NULL DEFAULT NULL COMMENT 'Calculated BP metric',
    `latest_weight` DECIMAL(10,3) NULL DEFAULT NULL COMMENT 'Latest daily weight',
    `trend_json` JSON NULL DEFAULT NULL COMMENT 'Derived trend metadata',
    `generated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Generation timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_summary_date` (`user_id`, `summary_date`),
    INDEX `idx_dhs_summary_date` (`summary_date`),
    CONSTRAINT `fk_dhs_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Precomputed daily biometric rollups and glycemic trends';

-- =============================================================================
-- DOMAIN 5: MEDICAL FILE ASSETS & OCR EXTRACTION PIPELINE
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 12: file_assets
-- Purpose: Metadata catalog for securely stored medical documents and images
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `file_assets` (
    `id` CHAR(36) NOT NULL COMMENT 'File UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner',
    `storage_provider` VARCHAR(32) NOT NULL DEFAULT 'local' COMMENT 'local/s3/etc.',
    `storage_key` VARCHAR(700) NOT NULL COMMENT 'Private object key/path',
    `original_filename` VARCHAR(255) NOT NULL COMMENT 'Original client filename',
    `mime_type` VARCHAR(120) NOT NULL COMMENT 'Validated MIME type',
    `file_size_bytes` BIGINT UNSIGNED NOT NULL COMMENT 'Size in bytes',
    `sha256` CHAR(64) NULL DEFAULT NULL COMMENT 'Integrity/dedup hash',
    `visibility` VARCHAR(24) NOT NULL DEFAULT 'private' COMMENT 'private by default',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Upload time',
    `deleted_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Soft-delete time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_file_assets_storage_key` (`storage_key`),
    INDEX `idx_file_assets_user` (`user_id`),
    INDEX `idx_file_assets_sha256` (`sha256`),
    INDEX `idx_file_assets_deleted_at` (`deleted_at`),
    CONSTRAINT `fk_file_assets_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Secure binary file storage asset metadata registry';

-- -----------------------------------------------------------------------------
-- Table 13: medical_reports
-- Purpose: Lab reports, clinical documents, and OCR processing pipeline jobs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `medical_reports` (
    `id` CHAR(36) NOT NULL COMMENT 'Report UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Report owner',
    `file_id` CHAR(36) NOT NULL COMMENT 'Source file',
    `report_type` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Lab/report category',
    `report_date` DATE NULL DEFAULT NULL COMMENT 'Date printed on report',
    `processing_status` VARCHAR(32) NOT NULL DEFAULT 'uploaded' COMMENT 'uploaded/queued/processing/completed/failed',
    `celery_task_id` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Background task identifier',
    `ocr_provider` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Configured OCR provider',
    `ocr_confidence` DECIMAL(6,3) NULL DEFAULT NULL COMMENT 'Overall OCR confidence if available',
    `extracted_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Extraction completion time',
    `error_code` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Safe machine-readable error code',
    `error_message` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Sanitized error message, no raw PHI',
    `retention_until` DATETIME(6) NULL DEFAULT NULL COMMENT 'Optional retention deadline',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created time',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Updated time',
    PRIMARY KEY (`id`),
    INDEX `idx_medical_reports_user_created` (`user_id`, `created_at`),
    INDEX `idx_medical_reports_file` (`file_id`),
    INDEX `idx_medical_reports_status` (`processing_status`),
    INDEX `idx_medical_reports_celery` (`celery_task_id`),
    CONSTRAINT `fk_medical_reports_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_medical_reports_file`
        FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Uploaded clinical documents and OCR pipeline processing state';

-- -----------------------------------------------------------------------------
-- Table 14: report_extracted_values
-- Purpose: Normalized clinical parameters extracted from medical reports by OCR/NLP
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `report_extracted_values` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Extracted value row',
    `report_id` CHAR(36) NOT NULL COMMENT 'Parent report',
    `metric_code` VARCHAR(64) NOT NULL COMMENT 'Canonical metric identifier',
    `raw_label` VARCHAR(160) NULL DEFAULT NULL COMMENT 'Label seen in source document',
    `numeric_value` DECIMAL(16,6) NULL DEFAULT NULL COMMENT 'Parsed numeric value',
    `text_value` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Fallback parsed text',
    `unit` VARCHAR(32) NULL DEFAULT NULL COMMENT 'Parsed/normalized unit',
    `reference_range` VARCHAR(120) NULL DEFAULT NULL COMMENT 'Reference range text',
    `confidence` DECIMAL(6,3) NULL DEFAULT NULL COMMENT 'Extraction confidence',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Extraction record time',
    PRIMARY KEY (`id`),
    INDEX `idx_rev_report_id` (`report_id`),
    INDEX `idx_rev_metric_code` (`metric_code`),
    INDEX `idx_rev_report_metric` (`report_id`, `metric_code`),
    CONSTRAINT `fk_rev_report`
        FOREIGN KEY (`report_id`) REFERENCES `medical_reports` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Structured biomarker data extracted from medical lab documents';

-- =============================================================================
-- DOMAIN 6: CLINICAL CONSULTATIONS & TELEHEALTH
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 15: consultations
-- Purpose: Clinical appointments, teleconsultations, and follow-up schedules
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultations` (
    `id` CHAR(36) NOT NULL COMMENT 'Consultation UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner',
    `provider_name` VARCHAR(160) NULL DEFAULT NULL COMMENT 'Provider or clinic name',
    `provider_specialty` VARCHAR(120) NULL DEFAULT NULL COMMENT 'Specialty',
    `mode` VARCHAR(32) NOT NULL DEFAULT 'in_person' COMMENT 'in_person/phone/video',
    `scheduled_at` DATETIME(6) NOT NULL COMMENT 'Scheduled time',
    `status` VARCHAR(32) NOT NULL DEFAULT 'scheduled' COMMENT 'scheduled/completed/cancelled',
    `reason` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Reason for consultation',
    `notes` TEXT NULL DEFAULT NULL COMMENT 'User notes',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created time',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Updated time',
    PRIMARY KEY (`id`),
    INDEX `idx_consultations_user_scheduled` (`user_id`, `scheduled_at`),
    INDEX `idx_consultations_status` (`status`),
    CONSTRAINT `fk_consultations_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Doctor appointments and maternal teleconsultation scheduling';

-- =============================================================================
-- DOMAIN 7: NOTIFICATIONS & COMMUNICATION PREFERENCES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 16: notification_preferences
-- Purpose: User-specific communication opt-ins, channels, and reminder schedules
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification_preferences` (
    `user_id` CHAR(36) NOT NULL COMMENT 'One preference record per user',
    `in_app_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Enable in-app notifications',
    `email_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Enable email notifications',
    `health_reminders_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Health reminder opt-in',
    `risk_alerts_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Risk-result alert opt-in',
    `reminder_time` TIME NULL DEFAULT NULL COMMENT 'Preferred local reminder time',
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata' COMMENT 'IANA timezone',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last preference update',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_notif_prefs_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notification delivery preferences and schedule configuration';

-- -----------------------------------------------------------------------------
-- Table 17: notifications
-- Purpose: Outbox and historical log of user notifications across all channels
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` CHAR(36) NOT NULL COMMENT 'Notification UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Recipient',
    `notification_type` VARCHAR(64) NOT NULL COMMENT 'risk_result/reminder/system/etc.',
    `channel` VARCHAR(24) NOT NULL DEFAULT 'in_app' COMMENT 'in_app/email/etc.',
    `title` VARCHAR(180) NOT NULL COMMENT 'User-facing title',
    `body` TEXT NOT NULL COMMENT 'Message body',
    `severity` VARCHAR(24) NOT NULL DEFAULT 'info' COMMENT 'info/warning/high',
    `action_url` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Optional application deep link',
    `dedupe_key` VARCHAR(160) NULL DEFAULT NULL COMMENT 'Idempotency/deduplication key',
    `status` VARCHAR(24) NOT NULL DEFAULT 'pending' COMMENT 'pending/sent/failed/read',
    `scheduled_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Future delivery time',
    `sent_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Delivery time',
    `read_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Read time',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Created time',
    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user_status` (`user_id`, `status`),
    INDEX `idx_notifications_user_created` (`user_id`, `created_at`),
    INDEX `idx_notifications_dedupe` (`dedupe_key`),
    INDEX `idx_notifications_scheduled` (`scheduled_at`, `status`),
    CONSTRAINT `fk_notifications_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dispatched and queued in-app and push notifications';

-- =============================================================================
-- DOMAIN 8: AI CHATBOT, LOCAL LLM REGISTRY & RAG KNOWLEDGE ENGINE
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 18: llm_models
-- Purpose: Registry for locally hosted GGUF models executed via llama-cpp-python
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `llm_models` (
    `id` CHAR(36) NOT NULL COMMENT 'Model registry UUID',
    `model_key` VARCHAR(100) NOT NULL COMMENT 'Unique logical identifier (e.g., matrigluco-health-assistant)',
    `display_name` VARCHAR(150) NOT NULL COMMENT 'User-facing model name',
    `provider` VARCHAR(50) NOT NULL DEFAULT 'llama_cpp' COMMENT 'Execution runtime: llama_cpp, vllm, ollama, transformers',
    `architecture` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Base architecture (e.g., Llama-3-8B-Instruct, Mistral-7B, Qwen2.5)',
    `model_filename` VARCHAR(255) NOT NULL COMMENT 'File name on filesystem (e.g., matrigluco-assistant-q4.gguf)',
    `model_path` VARCHAR(500) NOT NULL COMMENT 'Local filesystem relative or absolute path to GGUF binary',
    `quantization` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Quantization type: Q4_K_M, Q5_K_M, Q8_0, F16',
    `parameter_size` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Model parameter scale: 3B, 7B, 8B, 14B',
    `context_length` INT UNSIGNED NOT NULL DEFAULT 4096 COMMENT 'Maximum context window tokens supported',
    `temperature` DECIMAL(4,3) NOT NULL DEFAULT 0.700 COMMENT 'Default inference sampling temperature',
    `top_p` DECIMAL(4,3) NOT NULL DEFAULT 0.900 COMMENT 'Default nucleus sampling probability',
    `top_k` INT UNSIGNED NULL DEFAULT 40 COMMENT 'Default top-k tokens considered during generation',
    `max_tokens` INT UNSIGNED NOT NULL DEFAULT 512 COMMENT 'Default maximum response generation tokens',
    `model_version` VARCHAR(50) NOT NULL DEFAULT '1.0.0' COMMENT 'Semantic version of the model build',
    `checksum_sha256` CHAR(64) NULL DEFAULT NULL COMMENT 'SHA-256 integrity checksum of GGUF file',
    `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = primary default model for new chats, 0 = secondary',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = available for inference, 0 = disabled',
    `loaded_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Timestamp when model was loaded into worker memory',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Registration timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Update timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_llm_models_key` (`model_key`),
    INDEX `idx_llm_model_active` (`is_active`),
    INDEX `idx_llm_model_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Metadata and configuration registry for local GGUF LLMs';

-- -----------------------------------------------------------------------------
-- Table 19: user_ai_preferences
-- Purpose: Patient AI privacy controls and conversational response style settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_ai_preferences` (
    `id` CHAR(36) NOT NULL COMMENT 'Preference UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner user ID (1:1 with users)',
    `chatbot_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = AI assistant active for user, 0 = disabled',
    `allow_health_context` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Explicit opt-in to let assistant use stored vitals/history in context',
    `save_chat_history` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = retain conversations, 0 = ephemeral sessions only',
    `preferred_language` VARCHAR(20) NOT NULL DEFAULT 'en' COMMENT 'Preferred conversational language code',
    `response_style` VARCHAR(24) NOT NULL DEFAULT 'balanced' COMMENT 'Tone: concise, balanced, detailed, simple',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Record creation timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last adjustment timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_user_ai_pref_user` (`user_id`),
    CONSTRAINT `fk_user_ai_pref_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User privacy settings and stylistic preferences for AI assistant';

-- -----------------------------------------------------------------------------
-- Table 20: prompt_templates
-- Purpose: Version-controlled system prompts, safety guardrails, and RAG templates
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prompt_templates` (
    `id` CHAR(36) NOT NULL COMMENT 'Prompt template UUID',
    `prompt_key` VARCHAR(100) NOT NULL COMMENT 'Unique programmatic key (e.g., system_health_assistant, rag_qa_template)',
    `name` VARCHAR(150) NOT NULL COMMENT 'Descriptive prompt template title',
    `description` TEXT NULL DEFAULT NULL COMMENT 'Usage instructions and context',
    `prompt_type` VARCHAR(40) NOT NULL COMMENT 'Category: system, safety, rag, prediction_explanation, report_explanation',
    `content` LONGTEXT NOT NULL COMMENT 'Full prompt template text with placeholder variables (e.g. {context}, {query})',
    `version` VARCHAR(50) NOT NULL DEFAULT '1.0.0' COMMENT 'Semantic version tag',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = currently used in inference pipeline, 0 = inactive',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Modification timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_prompt_templates_key` (`prompt_key`),
    INDEX `idx_prompt_active` (`is_active`),
    INDEX `idx_prompt_type` (`prompt_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Versioned prompt templates for LLM instruction and guardrails';

-- -----------------------------------------------------------------------------
-- Table 21: knowledge_documents
-- Purpose: Verified medical sources, clinical guidelines, FAQs and policies for RAG
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `knowledge_documents` (
    `id` CHAR(36) NOT NULL COMMENT 'Knowledge document UUID',
    `title` VARCHAR(255) NOT NULL COMMENT 'Document headline or article title',
    `slug` VARCHAR(255) NOT NULL COMMENT 'URL-safe unique identifier',
    `document_type` VARCHAR(48) NOT NULL COMMENT 'Category: medical_education, faq, app_documentation, nutrition, pregnancy, diabetes, gestational_diabetes, policy',
    `source_name` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Publishing authority (e.g., WHO, ADA, ACOG, Ministry of Health)',
    `source_url` VARCHAR(1000) NULL DEFAULT NULL COMMENT 'Canonical web reference URL',
    `file_path` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Path to original source file if uploaded',
    `content_hash` CHAR(64) NULL DEFAULT NULL COMMENT 'SHA-256 hash of raw content for change detection',
    `language` VARCHAR(20) NOT NULL DEFAULT 'en' COMMENT 'Content language code',
    `version` VARCHAR(50) NOT NULL DEFAULT '1.0' COMMENT 'Document editorial version',
    `is_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = approved by medical review team for live RAG retrieval, 0 = draft',
    `verified_by` CHAR(36) NULL DEFAULT NULL COMMENT 'Clinician user ID who verified this document',
    `verified_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Verification timestamp',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = included in FAISS indexing, 0 = archived',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Creation timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Update timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_knowledge_doc_slug` (`slug`),
    INDEX `idx_knowledge_doc_type` (`document_type`),
    INDEX `idx_knowledge_doc_active` (`is_active`),
    INDEX `idx_knowledge_doc_verified` (`is_verified`),
    CONSTRAINT `fk_knowledge_doc_verifier`
        FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Curated clinical knowledge base documents for RAG grounding';

-- -----------------------------------------------------------------------------
-- Table 22: knowledge_chunks
-- Purpose: Partitioned text chunks indexed in FAISS vector store with embedding IDs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `knowledge_chunks` (
    `id` CHAR(36) NOT NULL COMMENT 'Knowledge chunk UUID',
    `document_id` CHAR(36) NOT NULL COMMENT 'Parent knowledge document reference',
    `chunk_index` INT UNSIGNED NOT NULL COMMENT 'Sequential position index of chunk within document (0-indexed)',
    `content` LONGTEXT NOT NULL COMMENT 'Extracted text content of the chunk',
    `token_count` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Token count computed by tokenizer',
    `embedding_reference` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Vector database key reference (e.g. chunk:uuid in FAISS)',
    `metadata_json` JSON NULL DEFAULT NULL COMMENT 'Structural metadata (section headers, tags, keywords)',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Chunk creation timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_document_chunk` (`document_id`, `chunk_index`),
    INDEX `idx_knowledge_chunk_document` (`document_id`),
    INDEX `idx_knowledge_chunk_embedding` (`embedding_reference`),
    CONSTRAINT `fk_knowledge_chunk_doc`
        FOREIGN KEY (`document_id`) REFERENCES `knowledge_documents` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Partitioned text chunks for FAISS dense vector search';

-- -----------------------------------------------------------------------------
-- Table 23: chat_conversations
-- Purpose: User conversation sessions with domain classification and message counters
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_conversations` (
    `id` CHAR(36) NOT NULL COMMENT 'Conversation UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'Owner user ID',
    `llm_model_id` CHAR(36) NULL DEFAULT NULL COMMENT 'LLM model assigned to conversation',
    `title` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Auto-generated or user-assigned conversation title',
    `conversation_type` VARCHAR(32) NOT NULL DEFAULT 'general' COMMENT 'general, health_education, prediction_explanation, report_explanation, app_support',
    `status` VARCHAR(24) NOT NULL DEFAULT 'active' COMMENT 'Lifecycle state: active, archived, deleted',
    `message_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total messages exchanged in this conversation',
    `last_message_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Timestamp of most recent message',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Conversation start timestamp',
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Last activity timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_chat_conversations_user` (`user_id`),
    INDEX `idx_chat_conversations_status` (`status`),
    INDEX `idx_chat_conversations_updated` (`updated_at`),
    INDEX `idx_chat_user_updated` (`user_id`, `updated_at`),
    INDEX `idx_chat_conversations_model` (`llm_model_id`),
    CONSTRAINT `fk_chat_conversations_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_chat_conversations_model`
        FOREIGN KEY (`llm_model_id`) REFERENCES `llm_models` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chat sessions between patients and AI assistant';

-- -----------------------------------------------------------------------------
-- Table 24: chat_messages
-- Purpose: Immutable turn-by-turn chat history with generation metrics & safety flags
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
    `id` CHAR(36) NOT NULL COMMENT 'Chat message UUID',
    `conversation_id` CHAR(36) NOT NULL COMMENT 'Parent conversation UUID',
    `parent_message_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Preceding message UUID in dialogue tree',
    `role` VARCHAR(24) NOT NULL COMMENT 'Message originator: system, user, assistant',
    `content` LONGTEXT NOT NULL COMMENT 'Full message content text',
    `model_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Model used to generate this response (NULL for user messages)',
    `message_status` VARCHAR(24) NOT NULL DEFAULT 'completed' COMMENT 'Status: pending, generating, completed, failed, blocked',
    `prompt_tokens` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Input tokens evaluated for this turn',
    `completion_tokens` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Output tokens generated by model',
    `total_tokens` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Total tokens processed in turn',
    `generation_time_ms` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Inference generation latency in milliseconds',
    `temperature` DECIMAL(4,3) NULL DEFAULT NULL COMMENT 'Sampling temperature applied during generation',
    `stop_reason` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Generation termination reason: stop_token, length, safety_filter',
    `safety_flag` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = safety guardrail triggered / content flagged, 0 = safe',
    `safety_category` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Safety category if flagged: medical_advice_disclaimer, urgent_symptom, inappropriate',
    `error_code` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Error code if generation failed',
    `error_message` TEXT NULL DEFAULT NULL COMMENT 'Sanitized error description on failure',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Message creation timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_chat_messages_conversation` (`conversation_id`, `created_at`),
    INDEX `idx_chat_messages_role` (`role`),
    INDEX `idx_chat_messages_model` (`model_id`),
    INDEX `idx_chat_messages_parent` (`parent_message_id`),
    INDEX `idx_chat_messages_status` (`message_status`),
    CONSTRAINT `fk_chat_messages_conv`
        FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_chat_messages_parent`
        FOREIGN KEY (`parent_message_id`) REFERENCES `chat_messages` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_chat_messages_model`
        FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Granular conversation turn records and generation telemetry';

-- -----------------------------------------------------------------------------
-- Table 25: chat_sources
-- Purpose: Traceability links between AI assistant responses and retrieved RAG chunks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_sources` (
    `id` CHAR(36) NOT NULL COMMENT 'Source link UUID',
    `message_id` CHAR(36) NOT NULL COMMENT 'Generated assistant chat message UUID',
    `knowledge_chunk_id` CHAR(36) NOT NULL COMMENT 'Retrieved knowledge chunk UUID supplied in prompt',
    `relevance_score` DECIMAL(8,6) NULL DEFAULT NULL COMMENT 'Cosine similarity or distance metric from FAISS vector search',
    `source_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Ranking order of chunk presented to LLM context (0 = top match)',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Attribution record timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_chat_message_source` (`message_id`, `knowledge_chunk_id`),
    INDEX `idx_chat_source_message` (`message_id`),
    INDEX `idx_chat_source_chunk` (`knowledge_chunk_id`),
    CONSTRAINT `fk_chat_sources_msg`
        FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_chat_sources_chunk`
        FOREIGN KEY (`knowledge_chunk_id`) REFERENCES `knowledge_chunks` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='RAG source attribution linking AI answers to verified medical chunks';

-- -----------------------------------------------------------------------------
-- Table 26: chat_message_feedback
-- Purpose: User ratings and qualitative evaluations of AI assistant responses
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_message_feedback` (
    `id` CHAR(36) NOT NULL COMMENT 'Feedback record UUID',
    `message_id` CHAR(36) NOT NULL COMMENT 'Target assistant message UUID',
    `user_id` CHAR(36) NOT NULL COMMENT 'User providing feedback',
    `rating` VARCHAR(24) NOT NULL COMMENT 'Binary rating: helpful, not_helpful',
    `feedback_category` VARCHAR(32) NULL DEFAULT NULL COMMENT 'Category: accurate, helpful, unclear, incorrect, unsafe, irrelevant, other',
    `comment` TEXT NULL DEFAULT NULL COMMENT 'User written feedback commentary',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Feedback submission timestamp',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_chat_feedback_user_message` (`message_id`, `user_id`),
    INDEX `idx_chat_feedback_rating` (`rating`),
    INDEX `idx_chat_feedback_user` (`user_id`),
    CONSTRAINT `fk_chat_feedback_msg`
        FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_chat_feedback_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User feedback and quality evaluations of AI chatbot responses';

-- -----------------------------------------------------------------------------
-- Table 27: conversation_summaries
-- Purpose: Condensed conversational summaries to manage LLM context window limits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversation_summaries` (
    `id` CHAR(36) NOT NULL COMMENT 'Summary UUID',
    `conversation_id` CHAR(36) NOT NULL COMMENT 'Parent conversation UUID',
    `summary` LONGTEXT NOT NULL COMMENT 'Concise chronological narrative summary of earlier messages',
    `summarized_until_message_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Latest message ID included in this summary',
    `model_id` CHAR(36) NULL DEFAULT NULL COMMENT 'LLM model used to produce the summary',
    `message_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of messages consolidated into this summary',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Summary generation timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_conversation_summary` (`conversation_id`, `created_at`),
    INDEX `idx_conversation_summary_model` (`model_id`),
    CONSTRAINT `fk_conv_summary_conv`
        FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_conv_summary_msg`
        FOREIGN KEY (`summarized_until_message_id`) REFERENCES `chat_messages` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_conv_summary_model`
        FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Context condensation summaries for long-running chat sessions';

-- -----------------------------------------------------------------------------
-- Table 28: ai_usage_logs
-- Purpose: Performance diagnostics, latency tracking, token accounting & telemetry
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_usage_logs` (
    `id` CHAR(36) NOT NULL COMMENT 'Log record UUID',
    `user_id` CHAR(36) NULL DEFAULT NULL COMMENT 'User associated with operation',
    `conversation_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Related conversation UUID',
    `message_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Related chat message UUID',
    `model_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Model executing the operation',
    `operation` VARCHAR(32) NOT NULL COMMENT 'Operation type: chat, embedding, retrieval, summary, classification',
    `input_tokens` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Input token count',
    `output_tokens` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Output token count',
    `duration_ms` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Total roundtrip duration in milliseconds',
    `retrieval_duration_ms` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Vector search and FAISS retrieval duration in milliseconds',
    `inference_duration_ms` INT UNSIGNED NULL DEFAULT NULL COMMENT 'llama.cpp model compute duration in milliseconds',
    `memory_usage_mb` DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Process memory consumption snapshot during execution',
    `success` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = successful completion, 0 = failed',
    `error_type` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Exception class or error category on failure',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Operation log timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_ai_usage_created` (`created_at`),
    INDEX `idx_ai_usage_model` (`model_id`),
    INDEX `idx_ai_usage_user` (`user_id`),
    INDEX `idx_ai_usage_operation` (`operation`),
    INDEX `idx_ai_usage_conversation` (`conversation_id`),
    CONSTRAINT `fk_ai_usage_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_ai_usage_conv`
        FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_ai_usage_msg`
        FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_ai_usage_model`
        FOREIGN KEY (`model_id`) REFERENCES `llm_models` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI subsystem performance telemetry and execution logs';

-- =============================================================================
-- DOMAIN 9: DISTRIBUTED BACKGROUND PROCESSING & CELERY JOBS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 29: background_jobs
-- Purpose: Application-level tracking of background asynchronous Celery workers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `background_jobs` (
    `id` CHAR(36) NOT NULL COMMENT 'Application job UUID',
    `celery_task_id` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Celery task id when queued',
    `user_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Owner if user-scoped',
    `task_name` VARCHAR(160) NOT NULL COMMENT 'Stable task identifier (e.g., tasks.reindex_knowledge_base, tasks.process_ocr)',
    `queue_name` VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT 'Celery queue name',
    `state` VARCHAR(24) NOT NULL DEFAULT 'queued' COMMENT 'queued/started/retry/success/failure',
    `entity_type` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Related domain type',
    `entity_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Related domain UUID',
    `progress_percent` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100 UI progress',
    `attempt_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Attempts',
    `error_code` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Sanitized error code',
    `error_message` VARCHAR(500) NULL DEFAULT NULL COMMENT 'Sanitized failure summary',
    `queued_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Queued time',
    `started_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Start time',
    `finished_at` DATETIME(6) NULL DEFAULT NULL COMMENT 'Terminal time',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_background_jobs_celery` (`celery_task_id`),
    INDEX `idx_background_jobs_user` (`user_id`),
    INDEX `idx_background_jobs_state` (`state`),
    INDEX `idx_background_jobs_task` (`task_name`),
    INDEX `idx_background_jobs_entity` (`entity_type`, `entity_id`),
    INDEX `idx_background_jobs_queued_at` (`queued_at`),
    CONSTRAINT `fk_background_jobs_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Asynchronous Celery background task execution log and state tracking';

-- =============================================================================
-- DOMAIN 10: ENTERPRISE AUDIT LOGGING & SECURITY EVENT MONITORING
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table 30: audit_logs
-- Purpose: Append-only compliance audit trail of critical clinical & data actions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Append-only audit row',
    `actor_user_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Authenticated actor when applicable',
    `event_name` VARCHAR(120) NOT NULL COMMENT 'Stable audit event name (e.g., auth.login, chat.create, assessment.predict)',
    `resource_type` VARCHAR(80) NULL DEFAULT NULL COMMENT 'Affected resource type',
    `resource_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Affected resource UUID',
    `request_id` VARCHAR(64) NULL DEFAULT NULL COMMENT 'Request correlation ID',
    `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Request source',
    `user_agent` VARCHAR(512) NULL DEFAULT NULL COMMENT 'Client context',
    `metadata_json` JSON NULL DEFAULT NULL COMMENT 'Non-sensitive structured metadata',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Event time',
    PRIMARY KEY (`id`),
    INDEX `idx_audit_logs_actor` (`actor_user_id`),
    INDEX `idx_audit_logs_event` (`event_name`),
    INDEX `idx_audit_logs_resource` (`resource_type`, `resource_id`),
    INDEX `idx_audit_logs_created_at` (`created_at`),
    INDEX `idx_audit_logs_request_id` (`request_id`),
    CONSTRAINT `fk_audit_logs_actor`
        FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Append-only compliance audit trail for sensitive operations';

-- -----------------------------------------------------------------------------
-- Table 31: security_events
-- Purpose: Security incident tracking, threat detection, and brute-force defence
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `security_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Security event row',
    `user_id` CHAR(36) NULL DEFAULT NULL COMMENT 'Related user if known',
    `event_type` VARCHAR(80) NOT NULL COMMENT 'login_failed/token_reuse/rate_limit/prompt_injection',
    `severity` VARCHAR(24) NOT NULL DEFAULT 'info' COMMENT 'info/warning/critical',
    `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'Source address',
    `details_json` JSON NULL DEFAULT NULL COMMENT 'Sanitized context',
    `occurred_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Event timestamp',
    PRIMARY KEY (`id`),
    INDEX `idx_security_events_user` (`user_id`),
    INDEX `idx_security_events_type_severity` (`event_type`, `severity`),
    INDEX `idx_security_events_occurred_at` (`occurred_at`),
    INDEX `idx_security_events_ip` (`ip_address`),
    CONSTRAINT `fk_security_events_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Security telemetry, intrusion detection, and authentication failure log';

-- =============================================================================
-- SEED DATA & CORE MODEL REGISTRY BOOTSTRAP
-- =============================================================================

-- 1. Seed default active ML model version for live GDM risk inference (scikit-learn / XGBoost)
INSERT INTO `model_versions` (
    `id`, `model_key`, `version`, `algorithm`, `artifact_path`,
    `feature_schema`, `metrics_json`, `thresholds_json`, `is_active`, `trained_at`, `created_at`
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'gdm_risk_model',
    '1.0.0',
    'XGBoostClassifier',
    'models/ml/gdm_xgboost_v1.joblib',
    JSON_OBJECT(
        'features', JSON_ARRAY(
            JSON_OBJECT('name', 'glucose', 'type', 'float', 'unit', 'mg/dL', 'required', true),
            JSON_OBJECT('name', 'bmi', 'type', 'float', 'unit', 'kg/m2', 'required', true),
            JSON_OBJECT('name', 'age', 'type', 'int', 'unit', 'years', 'required', true),
            JSON_OBJECT('name', 'pregnancies', 'type', 'int', 'unit', 'count', 'required', false, 'default', 1),
            JSON_OBJECT('name', 'blood_pressure', 'type', 'float', 'unit', 'mmHg', 'required', false, 'default', 80.0),
            JSON_OBJECT('name', 'skin_thickness', 'type', 'float', 'unit', 'mm', 'required', false, 'default', 20.0),
            JSON_OBJECT('name', 'insulin', 'type', 'float', 'unit', 'mu_U/ml', 'required', false, 'default', 79.0),
            JSON_OBJECT('name', 'diabetes_pedigree', 'type', 'float', 'unit', 'score', 'required', false, 'default', 0.47)
        )
    ),
    JSON_OBJECT('roc_auc', 0.892, 'f1_score', 0.841, 'accuracy', 0.865, 'sensitivity', 0.875, 'specificity', 0.858),
    JSON_OBJECT('low_risk_max', 0.30, 'moderate_risk_max', 0.65, 'high_risk_min', 0.65),
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
) ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- 2. Seed default local GGUF LLM for offline conversational assistant (llama-cpp-python)
INSERT INTO `llm_models` (
    `id`, `model_key`, `display_name`, `provider`, `architecture`,
    `model_filename`, `model_path`, `quantization`, `parameter_size`,
    `context_length`, `temperature`, `top_p`, `top_k`, `max_tokens`,
    `model_version`, `is_default`, `is_active`, `created_at`, `updated_at`
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'matrigluco-health-assistant',
    'Matrigluco Health Assistant',
    'llama_cpp',
    'Llama-3-8B-Instruct',
    'matrigluco-assistant-q4.gguf',
    'models/llm/matrigluco-assistant-q4.gguf',
    'Q4_K_M',
    '8B',
    4096,
    0.700,
    0.900,
    40,
    512,
    '1.0.0',
    1,
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
) ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`), `is_default` = VALUES(`is_default`);

-- 3. Seed default prompt templates for LLM instruction and clinical safety guardrails
INSERT INTO `prompt_templates` (
    `id`, `prompt_key`, `name`, `description`, `prompt_type`, `content`, `version`, `is_active`, `created_at`, `updated_at`
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'system_health_assistant',
    'Core Maternal Health System Prompt',
    'Default system instruction for Matrigluco conversational health assistant',
    'system',
    'You are Matrigluco Health Assistant, an empathetic, evidence-based AI assistant specializing in maternal wellness, gestational diabetes education, and clinical lifestyle support.\n\nCore Principles:\n1. Provide educational, clear, and reassuring guidance.\n2. Do NOT provide binding medical diagnoses or prescribe medications.\n3. Ground your answers in retrieved Matrigluco knowledge when available.\n4. If the user presents emergency or high-risk symptoms, advise them immediately to seek urgent obstetric medical care.\n5. Keep your tone supportive, professional, and accessible.',
    '1.0.0',
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
),
(
    'c0000000-0000-0000-0000-000000000002',
    'rag_grounded_qa',
    'RAG Clinical Question Answering Template',
    'Template with retrieved verified knowledge context injected',
    'rag',
    'Use the following verified clinical context to answer the user query accurately.\n\n[VERIFIED MEDICAL CONTEXT]\n{context}\n\n[PATIENT QUERY]\n{query}\n\nInstructions:\n- Cite details from the context accurately.\n- If the context does not contain enough information, explain what is known and advise consulting their OB-GYN.',
    '1.0.0',
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
),
(
    'c0000000-0000-0000-0000-000000000003',
    'prediction_explanation',
    'GDM Risk Prediction Explainer',
    'Explains machine learning risk assessment results in patient-friendly terms',
    'prediction_explanation',
    'The patient received a Gestational Diabetes Risk assessment score of {risk_level} ({probability}% estimated risk).\nKey contributing biomarkers: {features_summary}.\n\nExplain these findings with compassion and clarity, demystifying what each biomarker represents and outlining practical diet/exercise steps they can discuss with their doctor.',
    '1.0.0',
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
) ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- 4. Seed initial verified clinical knowledge documents
INSERT INTO `knowledge_documents` (
    `id`, `title`, `slug`, `document_type`, `source_name`, `source_url`, `language`, `version`, `is_verified`, `is_active`, `created_at`, `updated_at`
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'Understanding Gestational Diabetes Mellitus (GDM)',
    'understanding-gdm-overview',
    'gestational_diabetes',
    'American Diabetes Association & ACOG Guidelines',
    'https://diabetes.org/diabetes/gestational-diabetes',
    'en',
    '1.0',
    1,
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
),
(
    'd0000000-0000-0000-0000-000000000002',
    'Maternal Glycemic Targets and Monitoring Protocols',
    'maternal-glycemic-targets',
    'medical_education',
    'National Institute for Health and Care Excellence (NICE)',
    'https://www.nice.org.uk/guidance/ng3',
    'en',
    '1.0',
    1,
    1,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
) ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- 5. Seed initial knowledge chunks for FAISS embedding indexing
INSERT INTO `knowledge_chunks` (
    `id`, `document_id`, `chunk_index`, `content`, `token_count`, `embedding_reference`, `metadata_json`, `created_at`
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    0,
    'Gestational Diabetes Mellitus (GDM) is defined as carbohydrate intolerance resulting in hyperglycemia with onset or first recognition during pregnancy, typically between weeks 24 and 28. Placental hormones such as human placental lactogen (hPL), cortisol, and progesterone cause physiological insulin resistance to ensure adequate glucose supply for fetal development. When maternal beta-cell compensation is insufficient, maternal blood glucose levels rise above safe thresholds.',
    76,
    'chunk:e0000000-0000-0000-0000-000000000001',
    JSON_OBJECT('section', 'Pathophysiology', 'tags', JSON_ARRAY('gdm', 'pathophysiology', 'placental_hormones')),
    CURRENT_TIMESTAMP(6)
),
(
    'e0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    0,
    'Standard glycemic targets for gestational diabetes monitoring:\n- Fasting blood glucose: <= 95 mg/dL (5.3 mmol/L)\n- 1-hour postprandial: <= 140 mg/dL (7.8 mmol/L)\n- 2-hour postprandial: <= 120 mg/dL (6.7 mmol/L)\n- Target HbA1c during pregnancy: < 6.0% (42 mmol/mol) if achievable without significant hypoglycemia.',
    68,
    'chunk:e0000000-0000-0000-0000-000000000002',
    JSON_OBJECT('section', 'Glycemic Targets', 'tags', JSON_ARRAY('glucose_targets', 'fasting', 'postprandial', 'hba1c')),
    CURRENT_TIMESTAMP(6)
) ON DUPLICATE KEY UPDATE `content` = VALUES(`content`);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- END OF SCHEMA DEFINITION (31 PRODUCTION TABLES)
-- =============================================================================
