# Backend Integration & Team Developer Guide
**NeuroForge SDLC Project Management Platform**
*Target: Spring Boot 3.x / Java 17+ / PostgreSQL or MySQL*

> **IMPORTANT NOTE**: This guide documents all backend entity, DTO, controller, and database changes required to natively persist the new frontend capabilities. The frontend has been built with **intelligent dual-mode fallbacks** (using verified seed data and in-memory caches) so frontend developers can immediately run and test the complete UI without any backend dependencies or errors.

---

## Table of Contents
1. [Team Member Quick Start (Frontend)](#1-team-member-quick-start-frontend)
2. [Database Schema Migrations (SQL)](#2-database-schema-migrations-sql)
3. [Spring Boot Backend Changes](#3-spring-boot-backend-changes)
   - [A. Project Repository Integration](#a-project-repository-integration)
   - [B. User Status & Presence Integration](#b-user-status--presence-integration)
   - [C. Task & Subtask Status Transition APIs](#c-task--subtask-status-transition-apis)
4. [cURL Verification Commands](#4-curl-verification-commands)

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
- **GitHub Repositories**: Test connected repositories and the "Add Repository" modal.

---

## 2. Database Schema Migrations (SQL)

Execute the following SQL migration script on your database (`PostgreSQL` or `MySQL`):

```sql
-- ============================================================================
-- NeuroForge Platform Migration: Projects Repository & User Status
-- ============================================================================

-- 1. Add repository URL column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS repository VARCHAR(500) DEFAULT NULL;

-- 2. Add status column to users table for live user presence
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- 3. Ensure subtasks table has due_date and appropriate status length
ALTER TABLE subtasks 
ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL;

ALTER TABLE subtasks 
ALTER COLUMN status TYPE VARCHAR(50);

-- Optional: Seed sample repository links
UPDATE projects 
SET repository = 'https://github.com/neuroforge/core-banking-migration' 
WHERE id = 1 AND repository IS NULL;

UPDATE projects 
SET repository = 'https://github.com/neuroforge/ai-document-pipeline' 
WHERE id = 2 AND repository IS NULL;
```

---

## 3. Spring Boot Backend Changes

### A. Project Repository Integration

#### 1. Entity: `com.neuroforge.backend.entity.Project`
Add the `repository` field with getter and setter:

```java
@Column(name = "repository", length = 500)
private String repository;

public String getRepository() {
    return repository;
}

public void setRepository(String repository) {
    this.repository = repository;
}
```

#### 2. DTO: `com.neuroforge.backend.dto.ProjectRequest`
Add `repository` to the request payload:

```java
private String repository;

public String getRepository() {
    return repository;
}

public void setRepository(String repository) {
    this.repository = repository;
}
```

#### 3. Controller: `com.neuroforge.backend.controller.ProjectController`
Add the dedicated PATCH endpoint for partial repository updates:

```java
@PatchMapping("/{id}/repository")
public ResponseEntity<ProjectResponse> updateProjectRepository(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload) {
    String repositoryUrl = payload.get("repository");
    Project updated = projectService.updateRepository(id, repositoryUrl);
    return ResponseEntity.ok(ProjectResponse.fromEntity(updated));
}
```

---

### B. User Status & Presence Integration

#### 1. Entity: `com.neuroforge.backend.entity.User`
Add the `status` field:

```java
@Column(name = "status", length = 50)
private String status = "Active";

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}
```

#### 2. Controller: `com.neuroforge.backend.controller.UserController`
Add status transition endpoint:

```java
@PatchMapping("/{id}/status")
public ResponseEntity<UserResponse> updateUserStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload) {
    String newStatus = payload.get("status");
    User updatedUser = userService.updateStatus(id, newStatus);
    return ResponseEntity.ok(UserResponse.fromEntity(updatedUser));
}
```

---

### C. Task & Subtask Status Transition APIs

#### 1. Tasks: `PATCH /api/tasks/{id}/status`
Ensure `TaskController` supports partial status updates for Kanban drag-and-drop:

```java
@PatchMapping("/{id}/status")
public ResponseEntity<TaskResponse> updateTaskStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload) {
    String newStatus = payload.get("status");
    Task updated = taskService.updateStatus(id, newStatus);
    return ResponseEntity.ok(TaskResponse.fromEntity(updated));
}
```

#### 2. Subtasks: `PATCH /api/subtasks/{subtaskId}/status`
Ensure `SubtaskController` supports direct status updates from Kanban, Timeline, and List views:

```java
@PatchMapping("/{subtaskId}/status")
public ResponseEntity<SubtaskResponse> updateSubtaskStatus(
        @PathVariable Long subtaskId,
        @RequestBody Map<String, String> payload) {
    String newStatus = payload.get("status");
    Subtask updated = subtaskService.updateStatus(subtaskId, newStatus);
    return ResponseEntity.ok(SubtaskResponse.fromEntity(updated));
}
```

Supported Subtask Statuses:
- `"To Do"`
- `"In Progress"`
- `"In Review"`
- `"Ready for Testing"`
- `"In Testing"`
- `"In QA"`
- `"Done"`

---

## 4. cURL Verification Commands

Backend developers can test all endpoints directly using the following cURL commands:

### 1. Update Project Repository
```bash
curl -X PATCH http://localhost:8080/api/projects/1/repository \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"repository":"https://github.com/neuroforge/core-engine"}'
```

### 2. Update User Live Status (Settings & Presence)
```bash
curl -X PATCH http://localhost:8080/api/users/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Meeting"}'
```

### 3. Update Parent Task Status (Kanban / Timeline / List)
```bash
curl -X PATCH http://localhost:8080/api/tasks/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

### 4. Update Subtask Status (Subtask Kanban / Timeline / List)
```bash
curl -X PATCH http://localhost:8080/api/subtasks/101/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Review"}'
```
