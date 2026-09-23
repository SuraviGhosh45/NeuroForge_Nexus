-- ============================================================
-- NeuroForge Nexus - RBAC / JWT / Projects / Teams migration
-- MySQL 8.x.  Run ONCE, BEFORE starting the new backend
-- (spring.jpa.hibernate.ddl-auto=validate refuses to start with missing columns).
-- Database name below matches application.properties (jdbc:mysql://.../neuroforge).
-- ============================================================
USE neuroforge;

-- ------------------------------------------------------------
-- 1) USERS: user id (login handle), contact number, skill, access role, active flag
-- ------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN user_code      VARCHAR(50) NULL,
    ADD COLUMN contact_number VARCHAR(15) NULL,
    ADD COLUMN skill          VARCHAR(30) NULL,     -- BACKEND_DEVELOPER | FRONTEND_DEVELOPER | FULL_STACK_DEVELOPER | DEVOPS | QA_TESTER | UI_UX_DESIGNER
    ADD COLUMN access_role    VARCHAR(30) NOT NULL DEFAULT 'TEAM_MEMBER',   -- ADMIN | PROJECT_MANAGER | TEAM_MEMBER
    ADD COLUMN active         TINYINT(1)  NOT NULL DEFAULT 1;

-- give existing users a unique User ID (they can be renamed later from the Users page)
UPDATE users SET user_code = CONCAT('user', id) WHERE user_code IS NULL;
-- normalise emails so the case-insensitive lookups behave
UPDATE users SET email = LOWER(email);

ALTER TABLE users MODIFY user_code VARCHAR(50) NOT NULL;
CREATE UNIQUE INDEX uk_users_user_code ON users (user_code);

-- OPTIONAL: promote your existing account to Admin (pick ONE way):
--   a) set app.bootstrap-admin.* in application.properties and let the app create the first Admin, or
--   b) UPDATE users SET access_role = 'ADMIN' WHERE email = 'you@example.com';

-- ------------------------------------------------------------
-- 2) PROJECTS: priority + member list (many-to-many, no fixed Team required)
-- ------------------------------------------------------------
ALTER TABLE projects
    ADD COLUMN priority VARCHAR(10) NOT NULL DEFAULT 'Medium';

-- back-fill priority from the date range:  <=14 days High, <=30 days Medium, longer Low
UPDATE projects
SET priority = CASE
    WHEN start_date IS NULL OR end_date IS NULL THEN 'Medium'
    WHEN DATEDIFF(end_date, start_date) <= 14   THEN 'High'
    WHEN DATEDIFF(end_date, start_date) <= 30   THEN 'Medium'
    ELSE 'Low'
END;

CREATE TABLE project_members (
    project_id BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3) TEAMS: belong to a project, have a Team ID
-- ------------------------------------------------------------
ALTER TABLE teams
    ADD COLUMN team_code  VARCHAR(30) NULL,
    ADD COLUMN project_id BIGINT      NULL,
    ADD CONSTRAINT fk_team_project FOREIGN KEY (project_id) REFERENCES projects (id);

UPDATE teams SET team_code = CONCAT('TEAM-', LPAD(id, 2, '0')) WHERE team_code IS NULL;
CREATE UNIQUE INDEX uk_teams_team_code ON teams (team_code);

-- ------------------------------------------------------------
-- 4) BACK-FILL from the OLD model (projects.team_id / project_lead_id / project_manager_id)
--    Skip this block if you have no legacy data worth keeping.
-- ------------------------------------------------------------
-- team -> project link (if a team was used by several projects, the highest project id wins)
UPDATE teams t
JOIN (SELECT team_id, MAX(id) AS pid FROM projects WHERE team_id IS NOT NULL GROUP BY team_id) x
  ON x.team_id = t.id
SET t.project_id = x.pid;

-- old team members become project members
INSERT IGNORE INTO project_members (project_id, user_id)
SELECT p.id, tm.user_id
FROM projects p
JOIN team_members tm ON tm.team_id = p.team_id
WHERE p.team_id IS NOT NULL;

-- old project managers must have a role that is allowed to manage projects
UPDATE users u
JOIN projects p ON p.project_manager_id = u.id
SET u.access_role = 'PROJECT_MANAGER'
WHERE u.access_role = 'TEAM_MEMBER';

-- ------------------------------------------------------------
-- 5) (optional, later) drop the columns the new code no longer uses
-- ------------------------------------------------------------
-- ALTER TABLE projects DROP FOREIGN KEY <fk name for team_id>,       DROP COLUMN team_id;
-- ALTER TABLE projects DROP FOREIGN KEY <fk name for project_lead_id>, DROP COLUMN project_lead_id;
-- (find the constraint names with: SHOW CREATE TABLE projects;)
