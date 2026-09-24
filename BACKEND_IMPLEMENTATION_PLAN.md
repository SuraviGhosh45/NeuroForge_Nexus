# NeuroForge Nexus — Backend Implementation Plan

## Role model

| Role | Scope | Core backend responsibilities |
|---|---|---|
| Admin | Global | Users, roles, projects, teams, tasks, sprints, board, dependencies |
| Project Manager | Managed/member projects | Create/manage projects, team assignment, tasks, sprints, dependencies |
| Project Lead | Led/member projects | Project/team/task/subtask management within led projects |
| Team Lead | Assigned project teams | Team/member operations, task/subtask coordination, board movement |
| Developer | Assigned projects / own tasks | View assigned project work, update own task/subtask progress |
| Tester | Assigned projects / own tasks | View assigned project work, update own task/subtask progress |
| QA | Assigned projects / own tasks | View assigned project work, update own task/subtask progress |

## Execution order

1. **Database foundation** — normalize users and roles, add project lead/team ownership, persistent project member assignments, teams, sprints/tasks/board state, and subtasks.
2. **Authentication/RBAC** — make role resolution server-side and ignore privileged role claims during self-registration.
3. **Project access** — enforce project manager/lead/team-lead/member scopes in backend services.
4. **Teams and project members** — persist team/member assignments and project roles instead of browser-only state.
5. **Task/subtask operations** — enforce create/edit/delete/status/assignment rules and project membership.
6. **Sprint/Kanban/dependency operations** — apply the same server-side scopes to boards, sprints, blocking, and dependencies.
7. **Dashboard/My Work** — return role-scoped data and assignment-specific task views.
8. **Frontend contract alignment** — remove stale role constants/local-only team/task state and call backend endpoints.
9. **Validation** — compile/static validation, source consistency checks, and package the completed source ZIP.

## Database setup

Run `database/neuroforge_backend_setup.sql` once against MySQL 8.x. Then configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and the bootstrap admin environment variables before starting Spring Boot.

## Verification

This environment does not expose the user's local MySQL service and does not provide a complete Maven/npm toolchain, so the ZIP includes the complete source changes and database migration, while final live DB/browser integration must be run on the user's development machine.
