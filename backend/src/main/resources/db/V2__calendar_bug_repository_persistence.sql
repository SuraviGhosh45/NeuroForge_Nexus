-- MySQL 8.x migration for deployments that already ran the initial backend setup.
-- This migration only adds columns/tables; it does not drop or reset application data.
USE neuroforge;

DROP PROCEDURE IF EXISTS neuroforge_v2_add_column_if_missing;

DELIMITER $$

CREATE PROCEDURE neuroforge_v2_add_column_if_missing(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition VARCHAR(1000)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND COLUMN_NAME = p_column
    ) THEN
        SET @sql = CONCAT(
            'ALTER TABLE `',
            p_table,
            '` ADD COLUMN `',
            p_column,
            '` ',
            p_definition
        );
        PREPARE neuroforge_v2_stmt FROM @sql;
        EXECUTE neuroforge_v2_stmt;
        DEALLOCATE PREPARE neuroforge_v2_stmt;
    END IF;
END$$

DELIMITER ;

CALL neuroforge_v2_add_column_if_missing('projects', 'github_owner', 'VARCHAR(50) NULL');
CALL neuroforge_v2_add_column_if_missing('projects', 'github_repository', 'VARCHAR(100) NULL');

CREATE TABLE IF NOT EXISTS calendar_events (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NULL,
    event_date DATETIME NOT NULL,
    event_type VARCHAR(20) NOT NULL DEFAULT 'OTHER',
    project_id BIGINT NULL,
    task_id BIGINT NULL,
    sprint_id BIGINT NULL,
    subtask_id BIGINT NULL,
    assigned_to BIGINT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    source VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    created_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_calendar_project_date (project_id, event_date),
    KEY idx_calendar_creator_date (created_by, event_date),
    KEY idx_calendar_assignee_date (assigned_to, event_date),
    CONSTRAINT fk_calendar_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_subtask FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bug_reports (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bug_key VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    project_id BIGINT NOT NULL,
    module VARCHAR(255) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'New',
    reported_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    attachments TEXT NULL,
    retest_result VARCHAR(30) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bug_reports_bug_key (bug_key),
    KEY idx_bug_reports_project_created (project_id, created_at),
    KEY idx_bug_reports_assigned_to (assigned_to),
    CONSTRAINT fk_bug_reports_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_bug_reports_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bug_report_comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bug_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bug_comments_bug_created (bug_id, created_at),
    CONSTRAINT fk_bug_comments_bug FOREIGN KEY (bug_id) REFERENCES bug_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bug_report_activity (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bug_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_text TEXT NOT NULL,
    result VARCHAR(30) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bug_activity_bug_created (bug_id, created_at),
    CONSTRAINT fk_bug_activity_bug FOREIGN KEY (bug_id) REFERENCES bug_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP PROCEDURE IF EXISTS neuroforge_v2_add_column_if_missing;
