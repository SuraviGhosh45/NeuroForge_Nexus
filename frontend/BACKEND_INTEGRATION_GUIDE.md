# Backend Integration & Team Developer Guide
**NeuroForge SDLC Project Management Platform**
*Target: Spring Boot 3.x / Java 17+ / PostgreSQL or MySQL*

> **STATUS OVERVIEW**:
> - ✅ **Authentication & Session Management**: Fully implemented & active.
> - ✅ **Live User Presence & Status Transitions**: Fully implemented in `UserController` (`PATCH /api/users/{id}/status`) and `User` entity (`availabilityStatus`).
> - ✅ **Task & Subtask Status Transitions**: Fully implemented in `TaskController` (`PATCH /api/tasks/{id}/status`) and `SubtaskController` (`PATCH /api/subtasks/{id}/status`).
> - ✅ **Teams & Project Member Allocations**: Fully implemented in `TeamController` and `ProjectController`.
> - ✅ **AI Assistant SDLC Chatbot**: Fully implemented in `ChatController` (`POST /api/chat`).
> - ✅ **Calendar & Meeting Scheduling Events**: Fully implemented in `CalendarController` (`/api/calendar`).
> - ✅ **Codebase Integration Points**: All 65 frontend integration comments have been cleaned up and verified.

---

## Table of Contents
1. [Team Member Quick Start (Frontend)](#1-team-member-quick-start-frontend)
2. [Completed Backend Architecture & Endpoints](#2-completed-backend-architecture--endpoints)
   - [A. User Status & Presence Integration](#a-user-status--presence-integration)
   - [B. Task & Subtask Status Transition APIs](#b-task--subtask-status-transition-apis)
   - [C. Complete REST API Reference](#c-complete-rest-api-reference)
3. [Remaining Optional Backend Enhancements](#3-remaining-optional-backend-enhancements)
   - [A. Project Custom Repository URL Field](#a-project-custom-repository-url-field)
4. [cURL Verification Commands](#4-curl-verification-commands)
5. [Frontend Integration Points Cleanup Status](#5-frontend-integration-points-cleanup-status)

---

## 1. Team Member Quick Start (Frontend)

To run the frontend and verify the exact UI on any team member's machine:

```bash
# 1. Pull the latest code
git checkout feature/ui-and-feature-advancement
git pull origin feature/ui-and-feature-advancement

# 2. Navigate to frontend directory and install dependencies
cd frontend
npm install

# 3. Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.
- **Offline / Standalone Ready**: If the Spring Boot backend is not running or has an empty database, the frontend automatically hydrates with seed projects, tasks, subtasks, and users.
- **Theme Switching**: Toggle between dark and light themes using the navbar sun/moon toggle.
- **Kanban & Subtask Views**: Seamlessly switch between **Cards**, **Timeline**, and **List** views.
- **AI Assistant Drawer**: Pinned floating trigger in the bottom-right corner sliding in as a right drawer with meeting scheduling and calendar synchronization.

---

## 2. Completed Backend Architecture & Endpoints

### A. User Status & Presence Integration (✅ Completed)
The backend already supports dynamic presence updates for the team:
- **Entity**: `User.java` natively contains `availabilityStatus` (`"Active"`, `"In Meeting"`, `"Offline"`).
- **Endpoint**: `PATCH /api/users/{id}/status`
- **Request DTO**: `StatusUpdateRequest` containing `{ active: boolean, status: string }`
- **Response**: `UserResponse` with updated profile and status.

### B. Task & Subtask Status Transition APIs (✅ Completed)
Kanban drag-and-drop and status dropdowns are natively supported:
- **Task Status**: `PATCH /api/tasks/{id}/status`
  - Accepts `{ status: "To Do" | "In Progress" | "In Review" | "Done" }`
  - Role-protected: Developers can update their own tasks; Leads/Managers can update project tasks.
- **Subtask Status**: `PATCH /api/subtasks/{subtaskId}/status`
  - Accepts `{ status: "To Do" | "In Progress" | "In Review" | "Ready for Testing" | "In Testing" | "In QA" | "Done" }`

---

### C. Complete REST API Reference

All endpoints connect under `http://localhost:8080/api`.

#### 1. Authentication & Session (`/api/auth`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | Fetch authenticated user | ✅ Implemented |
| `POST` | `/signup` | Register new user | ✅ Implemented |
| `POST` | `/login` | Authenticate credentials | ✅ Implemented |
| `POST` | `/logout` | Invalidate token/session | ✅ Implemented |
| `DELETE` | `/api/users/me` | Self-service account delete | ✅ Implemented |

#### 2. Projects (`/api/projects`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all accessible projects | ✅ Implemented |
| `POST` | `/` | Create a project, including an optional GitHub repository URL | ✅ Implemented |
| `PUT` | `/{id}` | Update project fields and its optional GitHub repository URL | ✅ Implemented |
| `PATCH` | `/{id}/status` | Update project status only | ✅ Implemented |
| `DELETE` | `/{id}` | Delete project & cascade | ✅ Implemented |
| `GET` | `/{projectId}/members` | List project team members | ✅ Implemented |
| `POST` | `/{projectId}/members` | Add member to project | ✅ Implemented |
| `PUT` | `/{projectId}/members/{userId}` | Update project role | ✅ Implemented |
| `PATCH` | `/{projectId}/members/{userId}/status` | Update member status | ✅ Implemented |
| `DELETE` | `/{projectId}/members/{userId}` | Remove member from project | ✅ Implemented |

#### 3. Tasks & Subtasks (`/api/tasks` & `/api/subtasks`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks | ✅ Implemented |
| `GET` | `/api/tasks/{taskId}/subtasks` | Get subtasks for parent task | ✅ Implemented |
| `POST` | `/api/tasks` | Create parent task | ✅ Implemented |
| `PATCH` | `/api/tasks/{taskId}/status` | Update task status (Kanban / Execution roles) | ✅ Implemented |
| `PUT` | `/api/tasks/{id}` | Full update (Admin / Project Manager) | ✅ Implemented |
| `DELETE` | `/api/tasks/{taskId}` | Delete parent task | ✅ Implemented |
| `POST` | `/api/tasks/{taskId}/subtasks` | Create subtask under task | ✅ Implemented |
| `PATCH` | `/api/subtasks/{subtaskId}/status` | Update subtask status | ✅ Implemented |
| `PUT` | `/api/subtasks/{subtaskId}` | Full update of subtask | ✅ Implemented |
| `DELETE` | `/api/subtasks/{subtaskId}` | Delete subtask | ✅ Implemented |

#### 4. Users & Presence (`/api/users`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | All users (Admin only) | ✅ Implemented |
| `GET` | `/options` | Assignable users (Managers/Leads) | ✅ Implemented |
| `POST` | `/` | Admin create user | ✅ Implemented |
| `PUT` | `/{id}` | Update user details | ✅ Implemented |
| `PATCH` | `/{id}/role` | Update user role | ✅ Implemented |
| `PATCH` | `/{id}/status` | Update active status | ✅ Implemented |
| `PUT` | `/me` | Update the authenticated user's profile fields (not role/password) | ✅ Implemented |
| `GET` | `/{id}/profile` | Comprehensive profile | ✅ Implemented |
| `DELETE` | `/{id}` | Delete user (Admin only) | ✅ Implemented |

#### 5. Teams (`/api/teams`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teams` | List organizational teams | ✅ Implemented |
| `GET` | `/api/teams/{id}/members` | List members of a team | ✅ Implemented |
| `POST` | `/api/teams` | Create organizational team | ✅ Implemented |
| `PUT` | `/api/teams/{id}` | Update team | ✅ Implemented |
| `DELETE` | `/api/teams/{id}` | Delete team | ✅ Implemented |

#### 6. AI Assistant Query (`/api/chat`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | AI assistant query for projects, tasks & calendar | ✅ Implemented |

#### 7. Bug Reports (`/api/bugs`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bugs` | List bugs in accessible projects | ✅ Implemented |
| `POST` | `/api/bugs` | Create a persistent bug report | ✅ Implemented |
| `PUT` | `/api/bugs/{id}` | Update bug details | ✅ Implemented |
| `PATCH` | `/api/bugs/{id}/status` | Update status and retest result | ✅ Implemented |
| `PATCH` | `/api/bugs/{id}/assignment` | Assign a bug within the project | ✅ Implemented |
| `GET` | `/api/bugs/{id}/comments` | Read persisted bug comments | ✅ Implemented |
| `POST` | `/api/bugs/{id}/comments` | Add a persisted comment | ✅ Implemented |
| `GET` | `/api/bugs/{id}/activity` | Read persisted activity history | ✅ Implemented |
| `POST` | `/api/bugs/{id}/summary` | Generate an AI summary for an accessible bug | ✅ Implemented |
| `DELETE` | `/api/bugs/{id}` | Delete a bug report | ✅ Implemented |

#### 8. Calendar & Scheduling Events (`/api/calendar`)
| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/calendar` | List user visible calendar events | ✅ Implemented |
| `GET` | `/api/calendar/{id}` | Get event details | ✅ Implemented |
| `GET` | `/api/calendar/project/{projectId}` | Get project calendar events | ✅ Implemented |
| `POST` | `/api/calendar` | Create calendar/meeting event | ✅ Implemented |
| `PUT` | `/api/calendar/{id}` | Update calendar event | ✅ Implemented |
| `PATCH` | `/api/calendar/{id}/date` | Reschedule event date/time | ✅ Implemented |
| `PATCH` | `/api/calendar/{id}/status` | Update event status | ✅ Implemented |
| `DELETE` | `/api/calendar/{id}` | Delete calendar event | ✅ Implemented |

---

## 3. Database migration

The setup script creates the current schema without dropping existing data. For an
existing installation, run `backend/src/main/resources/db/V2__calendar_bug_repository_persistence.sql`
against the `neuroforge` database before deploying a backend build that uses the
calendar, bug-report comments/activity, or project repository persistence.

---

## 4. cURL Verification Commands

Backend developers can test the implemented endpoints directly:

### 1. Update User Live Status
```bash
curl -X PATCH http://localhost:8080/api/users/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Meeting","active":true}'
```

### 2. Update Parent Task Status (Kanban Drag & Drop)
```bash
curl -X PATCH http://localhost:8080/api/tasks/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

### 3. Update Subtask Status
```bash
curl -X PATCH http://localhost:8080/api/subtasks/101/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Review"}'
```

---

## 5. Frontend Integration Points Cleanup Status

All **65 `[BACKEND_INTEGRATION_POINT]` comments** across the 18 frontend files have been cleaned up:
- `npm run clean:comments` executed successfully.
- Frontend build compiled and verified with 0 errors via `npm run build`.
