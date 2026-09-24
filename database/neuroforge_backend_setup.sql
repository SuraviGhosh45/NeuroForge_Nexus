-- ============================================================
-- NeuroForge Nexus Backend Database Setup
-- MySQL 8.x
-- Database: neuroforge
-- ============================================================

CREATE DATABASE IF NOT EXISTS neuroforge
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE neuroforge;


-- ============================================================
-- HELPER PROCEDURE
-- MySQL 8.x does not support:
-- ADD COLUMN IF NOT EXISTS
-- ============================================================

DROP PROCEDURE IF EXISTS neuroforge_add_column_if_missing;

DELIMITER $$

CREATE PROCEDURE neuroforge_add_column_if_missing(
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

        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END IF;

END$$

DELIMITER ;


-- ============================================================
-- USERS
-- ============================================================

CALL neuroforge_add_column_if_missing(
    'users',
    'user_code',
    'VARCHAR(50) NULL'
);

CALL neuroforge_add_column_if_missing(
    'users',
    'contact_number',
    'VARCHAR(15) NULL'
);

CALL neuroforge_add_column_if_missing(
    'users',
    'skill',
    'VARCHAR(30) NULL'
);

CALL neuroforge_add_column_if_missing(
    'users',
    'access_role',
    "VARCHAR(30) NOT NULL DEFAULT 'DEVELOPER'"
);

CALL neuroforge_add_column_if_missing(
    'users',
    'active',
    'TINYINT(1) NOT NULL DEFAULT 1'
);

CALL neuroforge_add_column_if_missing(
    'users',
    'availability_status',
    "VARCHAR(20) NOT NULL DEFAULT 'Active'"
);


-- ============================================================
-- NORMALIZE USER DATA
-- ============================================================

UPDATE users
SET user_code = CONCAT('user', id)
WHERE user_code IS NULL
   OR user_code = '';

UPDATE users
SET email = LOWER(email)
WHERE email IS NOT NULL;

UPDATE users
SET availability_status =
    CASE
        WHEN active = 1 THEN 'Active'
        ELSE 'Inactive'
    END
WHERE availability_status IS NULL
   OR availability_status = '';


-- ============================================================
-- NORMALIZE LEGACY ROLES
-- ============================================================

UPDATE users
SET access_role = 'DEVELOPER'
WHERE access_role = 'TEAM_MEMBER';


-- Project Manager
UPDATE users u
JOIN projects p
    ON p.project_manager_id = u.id
SET u.access_role = 'PROJECT_MANAGER';


-- Project Lead
UPDATE users u
JOIN projects p
    ON p.project_lead_id = u.id
SET u.access_role = 'PROJECT_LEAD';


-- Team Lead
UPDATE users u
JOIN team_members tm
    ON tm.user_id = u.id
SET u.access_role = 'TEAM_LEAD'
WHERE LOWER(tm.team_role) = 'team lead';


-- ============================================================
-- PROJECTS
-- ============================================================

CALL neuroforge_add_column_if_missing(
    'projects',
    'priority',
    "VARCHAR(10) NOT NULL DEFAULT 'Medium'"
);

CALL neuroforge_add_column_if_missing(
    'projects',
    'project_lead_id',
    'BIGINT NULL'
);

CALL neuroforge_add_column_if_missing(
    'projects',
    'team_id',
    'BIGINT NULL'
);

CALL neuroforge_add_column_if_missing(
    'projects',
    'project_key',
    'VARCHAR(10) NULL'
);

CALL neuroforge_add_column_if_missing(
    'projects',
    'task_counter',
    'INT NOT NULL DEFAULT 0'
);


-- ============================================================
-- PROJECT PRIORITY BACKFILL
-- ============================================================

UPDATE projects
SET priority =
    CASE
        WHEN start_date IS NULL
          OR end_date IS NULL
            THEN 'Medium'

        WHEN DATEDIFF(end_date, start_date) <= 14
            THEN 'High'

        WHEN DATEDIFF(end_date, start_date) <= 30
            THEN 'Medium'

        ELSE 'Low'
    END
WHERE priority IS NULL
   OR priority = '';


-- ============================================================
-- PROJECT MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS project_members (

    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    PRIMARY KEY (project_id, user_id),

    CONSTRAINT fk_pm_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pm_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- COPY EXISTING TEAM MEMBERS INTO PROJECT MEMBERS
-- ============================================================

INSERT IGNORE INTO project_members (
    project_id,
    user_id
)

SELECT
    p.id,
    tm.user_id

FROM projects p

JOIN team_members tm
    ON tm.team_id = p.team_id

WHERE p.team_id IS NOT NULL;


-- ============================================================
-- PROJECT MEMBER ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS project_member_assignments (

    id BIGINT NOT NULL AUTO_INCREMENT,

    project_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    project_role VARCHAR(40)
        NOT NULL DEFAULT 'Developer',

    member_status VARCHAR(30)
        NOT NULL DEFAULT 'Active',

    assigned_at DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_project_member_assignment (
        project_id,
        user_id
    ),

    KEY idx_pma_project (
        project_id
    ),

    CONSTRAINT fk_pma_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pma_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- PROJECT MEMBER ROLE BACKFILL
-- ============================================================

INSERT IGNORE INTO project_member_assignments (
    project_id,
    user_id,
    project_role,
    member_status
)

SELECT

    pm.project_id,

    pm.user_id,

    CASE u.access_role

        WHEN 'TEAM_LEAD'
            THEN 'Team Lead'

        WHEN 'TESTER'
            THEN 'Tester'

        WHEN 'QA'
            THEN 'QA'

        WHEN 'PROJECT_LEAD'
            THEN 'Project Lead'

        WHEN 'PROJECT_MANAGER'
            THEN 'Project Manager'

        WHEN 'ADMIN'
            THEN 'Admin'

        ELSE 'Developer'

    END,

    CASE
        WHEN u.active = 1
            THEN 'Active'

        ELSE 'Inactive'

    END

FROM project_members pm

JOIN users u
    ON u.id = pm.user_id;


-- ============================================================
-- TEAMS
-- ============================================================

CALL neuroforge_add_column_if_missing(
    'teams',
    'team_code',
    'VARCHAR(30) NULL'
);

CALL neuroforge_add_column_if_missing(
    'teams',
    'project_id',
    'BIGINT NULL'
);


-- ============================================================
-- TEAM CODE
-- ============================================================

UPDATE teams
SET team_code =
    CONCAT(
        'TEAM-',
        LPAD(id, 2, '0')
    )

WHERE team_code IS NULL
   OR team_code = '';


-- ============================================================
-- CONNECT TEAM TO PROJECT
-- ============================================================

UPDATE teams t

JOIN (

    SELECT
        team_id,
        MAX(id) AS project_id

    FROM projects

    WHERE team_id IS NOT NULL

    GROUP BY team_id

) x

ON x.team_id = t.id

SET t.project_id = x.project_id

WHERE t.project_id IS NULL;


-- ============================================================
-- NORMALIZE TEAM MEMBER ROLES
-- ============================================================

UPDATE team_members tm

JOIN users u
    ON u.id = tm.user_id

SET tm.team_role = 'Team Lead'

WHERE LOWER(tm.team_role) = 'team lead';


-- ============================================================
-- SPRINTS
-- ============================================================

CREATE TABLE IF NOT EXISTS sprints (

    id BIGINT NOT NULL AUTO_INCREMENT,

    project_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,

    goal VARCHAR(255) NULL,

    start_date DATE NULL,

    end_date DATE NULL,

    status VARCHAR(20)
        NOT NULL DEFAULT 'PLANNED',

    capacity_points INT
        NOT NULL DEFAULT 0,

    created_at DATETIME NULL,

    updated_at DATETIME NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_sprint_project_name (
        project_id,
        name
    ),

    KEY idx_sprints_project_status (
        project_id,
        status
    ),

    CONSTRAINT fk_sprint_project

        FOREIGN KEY (project_id)

        REFERENCES projects(id)

        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- TASKS
-- ============================================================

CALL neuroforge_add_column_if_missing(
    'tasks',
    'task_key',
    'VARCHAR(20) NULL'
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'sprint_id',
    'BIGINT NULL'
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'story_points',
    'INT NULL'
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'board_status',
    "VARCHAR(20) NOT NULL DEFAULT 'TODO'"
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'board_position',
    'INT NOT NULL DEFAULT 0'
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'blocked',
    'TINYINT(1) NOT NULL DEFAULT 0'
);

CALL neuroforge_add_column_if_missing(
    'tasks',
    'blocked_reason',
    'VARCHAR(255) NULL'
);


-- ============================================================
-- TASK DEPENDENCIES
-- ============================================================

CREATE TABLE IF NOT EXISTS task_dependencies (

    id BIGINT NOT NULL AUTO_INCREMENT,

    task_id BIGINT NOT NULL,

    depends_on_task_id BIGINT NOT NULL,

    created_at DATETIME NULL,

    PRIMARY KEY (id),

    UNIQUE KEY uk_task_dependency (
        task_id,
        depends_on_task_id
    ),

    CONSTRAINT fk_dep_task

        FOREIGN KEY (task_id)

        REFERENCES tasks(id)

        ON DELETE CASCADE,

    CONSTRAINT fk_dep_blocker

        FOREIGN KEY (depends_on_task_id)

        REFERENCES tasks(id)

        ON DELETE CASCADE

) ENGINE=InnoDB;


-- ============================================================
-- SUBTASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS subtasks (

    id BIGINT NOT NULL AUTO_INCREMENT,

    task_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,

    description VARCHAR(2000) NULL,

    assignee_id BIGINT NULL,

    team_id BIGINT NULL,

    status VARCHAR(30)
        NOT NULL DEFAULT 'To Do',

    priority VARCHAR(20)
        NOT NULL DEFAULT 'Medium',

    due_date DATE NULL,

    created_at DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_subtask_task_title (
        task_id,
        title
    ),

    KEY idx_subtasks_task (
        task_id
    ),

    KEY idx_subtasks_assignee (
        assignee_id
    ),

    CONSTRAINT fk_subtask_task

        FOREIGN KEY (task_id)

        REFERENCES tasks(id)

        ON DELETE CASCADE,

    CONSTRAINT fk_subtask_assignee

        FOREIGN KEY (assignee_id)

        REFERENCES users(id)

        ON DELETE SET NULL,

    CONSTRAINT fk_subtask_team

        FOREIGN KEY (team_id)

        REFERENCES teams(id)

        ON DELETE SET NULL

) ENGINE=InnoDB;


-- ============================================================
-- ADD EXISTING PROJECT MEMBERS TO THEIR PROJECT TEAM
-- ============================================================

INSERT IGNORE INTO team_members (
    team_id,
    user_id,
    team_role
)

SELECT

    p.team_id,

    pma.user_id,

    pma.project_role

FROM project_member_assignments pma

JOIN projects p
    ON p.id = pma.project_id

WHERE p.team_id IS NOT NULL;


-- ============================================================
-- PROJECT KEY BACKFILL
-- ============================================================

UPDATE projects

SET project_key =

    UPPER(

        LEFT(

            REGEXP_REPLACE(
                name,
                '[^A-Za-z]',
                ''
            ),

            3

        )

    )

WHERE project_key IS NULL
   OR project_key = '';


-- ============================================================
-- TASK BOARD STATUS BACKFILL
-- ============================================================

UPDATE tasks t

SET board_status =

    CASE UPPER(
        COALESCE(
            t.status,
            'TODO'
        )
    )

        WHEN 'DONE'
            THEN 'DONE'

        WHEN 'COMPLETED'
            THEN 'DONE'

        WHEN 'IN_PROGRESS'
            THEN 'IN_PROGRESS'

        WHEN 'IN REVIEW'
            THEN 'IN_REVIEW'

        WHEN 'IN_REVIEW'
            THEN 'IN_REVIEW'

        ELSE 'TODO'

    END

WHERE t.board_status IS NULL
   OR t.board_status = '';


-- ============================================================
-- CLEANUP HELPER PROCEDURE
-- ============================================================

DROP PROCEDURE IF EXISTS neuroforge_add_column_if_missing;


-- ============================================================
-- COMPLETE
-- ============================================================