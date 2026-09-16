-- ============================================================
-- NeuroForge Nexus - Sprint & Kanban board schema
-- MySQL 8.x
-- ============================================================
CREATE DATABASE IF NOT EXISTS neuroforge_nexus
	CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neuroforge_nexus;

-- 1) Project gets a key prefix (PAY, NEX, ...) and a task counter
ALTER TABLE projects
	ADD COLUMN project_key  VARCHAR(10) NULL AFTER name,
	ADD COLUMN task_counter INT NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX uk_projects_key ON projects (project_key);

-- 2) Sprints
CREATE TABLE sprints (
	id              BIGINT       NOT NULL AUTO_INCREMENT,
	project_id      BIGINT       NOT NULL,
	name            VARCHAR(100) NOT NULL,
	goal            VARCHAR(255) NULL,
	start_date      DATE         NULL,
	end_date        DATE         NULL,
	status          VARCHAR(20)  NOT NULL DEFAULT 'PLANNED',  -- PLANNED | ACTIVE | COMPLETED
	capacity_points INT          NOT NULL DEFAULT 0,
	created_at      DATETIME     NULL,
	updated_at      DATETIME     NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk_sprint_project FOREIGN KEY (project_id)
			REFERENCES projects (id) ON DELETE CASCADE,
	CONSTRAINT uk_sprint_project_name UNIQUE (project_id, name)
) ENGINE=InnoDB;

CREATE INDEX idx_sprints_project_status ON sprints (project_id, status);

-- 3) Task columns for the board
ALTER TABLE tasks
	ADD COLUMN task_key       VARCHAR(20)  NULL,
	ADD COLUMN sprint_id      BIGINT       NULL,
	ADD COLUMN story_points   INT          NULL,
	ADD COLUMN board_status   VARCHAR(20)  NOT NULL DEFAULT 'TODO',  -- TODO | IN_PROGRESS | IN_REVIEW | DONE
	ADD COLUMN board_position INT          NOT NULL DEFAULT 0,
	ADD COLUMN blocked        TINYINT(1)   NOT NULL DEFAULT 0,
	ADD COLUMN blocked_reason VARCHAR(255) NULL;

CREATE UNIQUE INDEX uk_tasks_key ON tasks (task_key);
CREATE INDEX idx_tasks_sprint_column ON tasks (sprint_id, board_status, board_position);

ALTER TABLE tasks
	ADD CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id)
			REFERENCES sprints (id) ON DELETE SET NULL;

-- 4) Dependencies: "task" cannot finish until "depends_on_task" is DONE
CREATE TABLE task_dependencies (
	id                  BIGINT   NOT NULL AUTO_INCREMENT,
	task_id             BIGINT   NOT NULL,
	depends_on_task_id  BIGINT   NOT NULL,
	created_at          DATETIME NULL,
	PRIMARY KEY (id),
	CONSTRAINT fk_dep_task    FOREIGN KEY (task_id)
			REFERENCES tasks (id) ON DELETE CASCADE,
	CONSTRAINT fk_dep_blocker FOREIGN KEY (depends_on_task_id)
			REFERENCES tasks (id) ON DELETE CASCADE,
	CONSTRAINT uk_task_dependency UNIQUE (task_id, depends_on_task_id),
	CONSTRAINT chk_no_self_dependency CHECK (task_id <> depends_on_task_id)
) ENGINE=InnoDB;

-- 5) Backfill existing rows (run once)
UPDATE projects SET project_key = UPPER(LEFT(REGEXP_REPLACE(name,'[^A-Za-z]',''),3))
WHERE project_key IS NULL;

SET SQL_SAFE_UPDATES = 0;

UPDATE tasks t
JOIN projects p ON p.id = t.project_id
SET t.board_status = CASE UPPER(COALESCE(t.status,'TODO'))
				WHEN 'DONE'        THEN 'DONE'
				WHEN 'COMPLETED'   THEN 'DONE'
				WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'
				WHEN 'IN_REVIEW'   THEN 'IN_REVIEW'
				ELSE 'TODO' END
WHERE t.board_status = 'TODO'
	AND t.id IS NOT NULL;

SET SQL_SAFE_UPDATES = 1;
