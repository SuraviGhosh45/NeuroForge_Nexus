import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";
import { canAccessTask, canAccessSubtask } from "../utils/access.js";

const TasksContext = createContext(null);

const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:8080/api"}/tasks`;

export const SEED_TASKS = [
  {
    id: 1,
    title: "Implement Distributed Transaction Coordinator",
    description: "Ensure ACID compliance across multi-partition databases during ledger sync.",
    projectId: 1,
    assigneeId: 5,
    status: "In Progress",
    boardStatus: "In Progress",
    priority: "High",
    dueDate: "2026-10-15",
  },
  {
    id: 2,
    title: "Construct Document Classification ML Pipeline",
    description: "Train vision transformer model to categorize invoices and legal disclosures.",
    projectId: 2,
    assigneeId: 5,
    status: "In Progress",
    boardStatus: "In Progress",
    priority: "Critical",
    dueDate: "2026-10-20",
  },
  {
    id: 3,
    title: "Stateless Session Blacklist with Redis Cache",
    description: "High-performance invalidation mechanism for active tokens upon forced logout.",
    projectId: 3,
    assigneeId: 3,
    status: "Done",
    boardStatus: "Done",
    priority: "Medium",
    dueDate: "2026-02-15",
  },
  {
    id: 4,
    title: "API Gateway Rate Limiting & Throttling",
    description: "Prevent DDOS and ensure SLA guarantees for external partner integrations.",
    projectId: 1,
    assigneeId: 4,
    status: "To Do",
    boardStatus: "To Do",
    priority: "High",
    dueDate: "2026-11-01",
  },
];

export const SEED_SUBTASKS = [
  {
    id: 101,
    taskId: 1,
    title: "Create two-phase commit consensus protocol handler",
    status: "In Progress",
    priority: "High",
    assigneeId: 5,
    dueDate: "2026-10-05",
  },
  {
    id: 102,
    taskId: 1,
    title: "Write automated integration tests for network partitioning",
    status: "To Do",
    priority: "Medium",
    assigneeId: 6,
    dueDate: "2026-10-12",
  },
  {
    id: 103,
    taskId: 2,
    title: "Extract text layout embeddings with OCR engine",
    status: "Done",
    priority: "Critical",
    assigneeId: 5,
    dueDate: "2026-09-10",
  },
  {
    id: 104,
    taskId: 2,
    title: "Validate dataset annotations against compliance criteria",
    status: "In Progress",
    priority: "High",
    assigneeId: 7,
    dueDate: "2026-09-25",
  },
];

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeTask = (task) => {
    if (!task) return task;
    const projId = task.projectId ?? task.project?.id ?? task.project_id ?? null;
    const assId = task.assigneeId ?? task.assignee?.id ?? task.assignee_id ?? null;
    return { ...task, projectId: projId ? Number(projId) : null, assigneeId: assId ? Number(assId) : null };
  };

  const normalizeSubtask = (subtask) => ({
    ...subtask,
    id: Number(subtask.id),
    taskId: Number(subtask.taskId ?? subtask.task?.id),
    assigneeId: subtask.assigneeId == null ? null : Number(subtask.assigneeId ?? subtask.assignee?.id),
    teamId: subtask.teamId == null ? null : Number(subtask.teamId ?? subtask.team?.id),
  });

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    GET http://localhost:8080/api/tasks
         Description: Retrieve all parent tasks.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK -> [ { "id": 1, "title": "Setup CI/CD", "projectId": 2, "assigneeId": 3, "status": "In Progress", "priority": "High", "dueDate": "2026-10-15" } ]
         cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/tasks
         ========================================================================== */
      const response = await axios.get(API_BASE);
      const normalizedTasks = (Array.isArray(response.data) ? response.data : []).map(normalizeTask);
      setTasks(normalizedTasks);

      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    GET http://localhost:8080/api/tasks/{taskId}/subtasks
         Description: Retrieve subtasks belonging to a specific parent task.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK -> [ { "id": 101, "taskId": 1, "title": "Configure GitHub Actions", "status": "To Do", "priority": "High" } ]
         cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/tasks/1/subtasks
         ========================================================================== */
      const subtaskResults = await Promise.all(
        normalizedTasks.map((task) => axios.get(`${API_BASE}/${task.id}/subtasks`))
      );
      setSubtasks(subtaskResults.flatMap((r) => Array.isArray(r.data) ? r.data.map(normalizeSubtask) : []));
    } catch (err) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         If Spring Boot backend is offline, populate seed tasks and subtasks
         so Kanban board, task list, and task detail views remain fully functional.
         ========================================================================== */
      setTasks(SEED_TASKS.map(normalizeTask));
      setSubtasks(SEED_SUBTASKS.map(normalizeSubtask));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const buildPayload = (formData) => ({
    title: formData.title,
    description: formData.description || "",
    projectId: formData.projectId
      ? Number(formData.projectId)
      : formData.project?.id ?? null,
    assigneeId: formData.assigneeId
      ? Number(formData.assigneeId)
      : formData.assignee?.id ?? null,
    status: formData.status,
    priority: formData.priority,
    dueDate: formData.dueDate || null,
  });

  /* ================= PARENT TASK CRUD ================= */

  const createTask = async (formData) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/tasks
         Description: Create a new parent task.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "title": "Design Database Schema", "description": "...", "projectId": 1, "assigneeId": 2, "status": "To Do", "priority": "High", "dueDate": "2026-10-20" }
         Response:    201/200 OK -> { "id": 10, "title": "Design Database Schema", ... }
         cURL:        curl -X POST http://localhost:8080/api/tasks -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"title":"Design Database Schema","projectId":1,"assigneeId":2,"status":"To Do","priority":"High"}'
         ========================================================================== */
      const response = await axios.post(
        API_BASE,
        buildPayload(formData)
      );

      const newTask = normalizeTask(
        response.data || formData
      );

      setTasks((prev) => [...prev, newTask]);

      return {
        success: true,
        data: newTask,
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to create task.";

      console.warn(
        "Backend task creation failed:",
        message
      );

      return {
        success: false,
        message,
      };
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PATCH http://localhost:8080/api/tasks/{taskId}/status
         Description: Update task status (used by execution roles: Developer, Tester, QA, Team Member, and Kanban drag-drop).
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "status": "In Progress" }
         Response:    200 OK -> { "id": 1, "status": "In Progress", "boardStatus": "IN_PROGRESS" }
         cURL:        curl -X PATCH http://localhost:8080/api/tasks/1/status -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"status":"In Progress"}'
         ========================================================================== */
      const response = await axios.patch(`${API_BASE}/${taskId}/status`, {
        status: newStatus,
      });

      const existingTask = getTaskById(taskId);
      const updated = normalizeTask(
        response.data || {
          ...existingTask,
          id: taskId,
          status: newStatus,
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          String(task.id) === String(taskId)
            ? {
                ...task,
                ...updated,
                status: updated.status || newStatus,
                boardStatus: updated.boardStatus || task.boardStatus,
              }
            : task
        )
      );

      return {
        success: true,
        data: updated,
      };
    } catch (err) {
      console.error("Failed to update task status:", err);
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "You are not allowed to update this task status.",
      };
    }
  };

  const updateTask = async (formData) => {
    const existingTask = getTaskById(formData.id);

    const currentUserRaw =
      sessionStorage.getItem("auth_user") ||
      localStorage.getItem("auth_user");

    let currentUser = null;

    try {
      currentUser = currentUserRaw
        ? JSON.parse(currentUserRaw)
        : null;
    } catch (e) {
      currentUser = null;
    }

    const role = currentUser?.role
      ? String(currentUser.role).toUpperCase()
      : "";

    const isExecutionRole = ["DEVELOPER", "TESTER", "QA", "TEAM_MEMBER"].includes(role);

    // Check if this update is strictly a status transition (e.g. from Kanban, My Work, or status dropdown)
    const isStatusOnlyUpdate = existingTask && formData.status && (
      String(formData.status) !== String(existingTask.status) ||
      String(formData.status) !== String(existingTask.boardStatus)
    ) && (
      !formData.title || formData.title === existingTask.title
    ) && (
      formData.description === undefined || formData.description === (existingTask.description || "")
    ) && (
      !formData.priority || formData.priority === existingTask.priority
    );

    if (
      (isExecutionRole || isStatusOnlyUpdate) &&
      existingTask &&
      formData.status &&
      (String(formData.status) !== String(existingTask.status) ||
       String(formData.status) !== String(existingTask.boardStatus))
    ) {
      return updateTaskStatus(formData.id, formData.status);
    }

    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PUT http://localhost:8080/api/tasks/{id}
         Description: Full update of parent task fields (Admin / Project Manager).
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "title": "Updated Task", "description": "...", "projectId": 1, "assigneeId": 2, "status": "In Progress", "priority": "High", "dueDate": "2026-10-25" }
         Response:    200 OK -> { "id": 1, "title": "Updated Task", ... }
         cURL:        curl -X PUT http://localhost:8080/api/tasks/1 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"title":"Updated Task","projectId":1,"status":"In Progress"}'
         ========================================================================== */
      const response = await axios.put(
        `${API_BASE}/${formData.id}`,
        buildPayload(formData)
      );

      const updated = normalizeTask(
        response.data || formData
      );

      setTasks((prev) =>
        prev.map((task) =>
          String(task.id) === String(formData.id)
            ? {
                ...task,
                ...updated,
              }
            : task
        )
      );

      return {
        success: true,
        data: updated,
      };
    } catch (err) {
      console.error(
        "Backend task update failed:",
        err
      );

      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to update task.",
      };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/tasks/{id}
         Description: Delete a parent task and its corresponding subtasks.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/tasks/1 -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.delete(
        `${API_BASE}/${taskId}`
      );
    } catch (err) {
      console.warn(
        "Backend task deletion failed:",
        err.message
      );

      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to delete task.",
      };
    }

    setTasks((prev) =>
      prev.filter(
        (task) =>
          String(task.id) !== String(taskId)
      )
    );

    // Also cleanup subtasks under this parent task
    setSubtasks((prev) =>
      prev.filter(
        (sub) =>
          String(sub.taskId) !==
          String(taskId)
      )
    );

    return { success: true };
  };

  const getTaskById = (taskId) => {
    return (
      tasks.find(
        (t) =>
          String(t.id) === String(taskId)
      ) || null
    );
  };

  /* ================= SUBTASK CRUD ================= */

  const getSubtasksByTaskId = (taskId) =>
    taskId ? subtasks.filter((sub) => String(sub.taskId) === String(taskId)) : [];

  const createSubtask = async (taskId, subtaskData) => {
    if (!taskId || !subtaskData?.title) return { success: false, message: "Task ID and title are required." };
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/tasks/{taskId}/subtasks
         Description: Create a subtask under the specified parent task.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "title": "Write Unit Tests", "description": "...", "assigneeId": 4, "teamId": 1, "status": "To Do", "priority": "Medium", "dueDate": "2026-10-18" }
         Response:    201/200 OK -> { "id": 201, "taskId": 1, "title": "Write Unit Tests", "status": "To Do" }
         cURL:        curl -X POST http://localhost:8080/api/tasks/1/subtasks -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"title":"Write Unit Tests","status":"To Do","priority":"Medium"}'
         ========================================================================== */
      const response = await axios.post(`${API_BASE}/${taskId}/subtasks`, {
        title: subtaskData.title.trim(),
        description: subtaskData.description || "",
        assigneeId: subtaskData.assigneeId ? Number(subtaskData.assigneeId) : null,
        teamId: subtaskData.teamId ? Number(subtaskData.teamId) : null,
        status: subtaskData.status || "To Do",
        priority: subtaskData.priority || "Medium",
        dueDate: subtaskData.dueDate || null,
      });
      const created = normalizeSubtask(response.data);
      setSubtasks((prev) => [...prev, created]);
      return { success: true, data: created };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to create subtask." };
    }
  };

  const updateSubtaskStatus = async (subtaskId, newStatus) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PATCH http://localhost:8080/api/subtasks/{subtaskId}/status
         Description: Transition subtask status (Supported statuses: "To Do", "In Progress", "In Review", "Ready for Testing", "In Testing", "In QA", "Done").
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "status": "In Progress" }
         Response:    200 OK -> { "id": 201, "status": "In Progress" }
         cURL:        curl -X PATCH http://localhost:8080/api/subtasks/201/status -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"status":"In Progress"}'
         ========================================================================== */
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:8080/api"}/subtasks/${subtaskId}/status`,
        {
          status: newStatus || "To Do",
        }
      );
      const updated = normalizeSubtask(response.data);
      setSubtasks((prev) =>
        prev.map((sub) =>
          String(sub.id) === String(subtaskId)
            ? { ...sub, ...updated, status: updated.status || newStatus }
            : sub
        )
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Failed to update subtask status:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update subtask status.",
      };
    }
  };

  const updateSubtask = async (taskId, updatedSubtask) => {
    if (!updatedSubtask?.id) return { success: false, message: "Subtask ID is required." };

    const currentUserRaw = sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
    let currentUser = null;
    try { currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null; } catch { currentUser = null; }
    const role = String(currentUser?.role || "").toUpperCase();
    const isExecutionRole = ["DEVELOPER", "TESTER", "QA", "TEAM_MEMBER"].includes(role);

    const existingSubtask = subtasks.find((s) => String(s.id) === String(updatedSubtask.id));
    const isStatusOnlyUpdate = existingSubtask && updatedSubtask.status && (
      String(updatedSubtask.status) !== String(existingSubtask.status)
    ) && (
      !updatedSubtask.title || updatedSubtask.title === existingSubtask.title
    ) && (
      updatedSubtask.description === undefined || updatedSubtask.description === (existingSubtask.description || "")
    ) && (
      !updatedSubtask.priority || updatedSubtask.priority === existingSubtask.priority
    );

    if (isExecutionRole || isStatusOnlyUpdate) {
      return updateSubtaskStatus(updatedSubtask.id, updatedSubtask.status);
    }

    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PUT http://localhost:8080/api/subtasks/{subtaskId}
         Description: Full update of subtask properties.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "title": "Updated Subtask Title", "description": "...", "assigneeId": 4, "teamId": 1, "status": "In Progress", "priority": "High", "dueDate": "2026-10-25" }
         Response:    200 OK -> { "id": 201, "title": "Updated Subtask Title", ... }
         cURL:        curl -X PUT http://localhost:8080/api/subtasks/201 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"title":"Updated Subtask Title","status":"In Progress"}'
         ========================================================================== */
      const response = await axios.put(`${import.meta.env.VITE_API_BASE || "http://localhost:8080/api"}/subtasks/${updatedSubtask.id}`, {
        title: updatedSubtask.title,
        description: updatedSubtask.description || "",
        assigneeId: updatedSubtask.assigneeId ? Number(updatedSubtask.assigneeId) : null,
        teamId: updatedSubtask.teamId ? Number(updatedSubtask.teamId) : null,
        status: updatedSubtask.status || "To Do",
        priority: updatedSubtask.priority || "Medium",
        dueDate: updatedSubtask.dueDate || null,
      });
      const updated = normalizeSubtask(response.data);
      setSubtasks((prev) => prev.map((sub) => String(sub.id) === String(updated.id) ? { ...sub, ...updated, status: updated.status || updatedSubtask.status } : sub));
      return { success: true, data: updated };
    } catch (error) {
      console.error("Failed to update subtask:", error);
      return { success: false, message: error.response?.data?.message || "Failed to update subtask." };
    }
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    if (!subtaskId) return { success: false, message: "Subtask ID is required." };
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/subtasks/{subtaskId}
         Description: Delete a subtask.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/subtasks/201 -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.delete(`${import.meta.env.VITE_API_BASE || "http://localhost:8080/api"}/subtasks/${subtaskId}`);
      setSubtasks((prev) => prev.filter((sub) => String(sub.id) !== String(subtaskId)));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete subtask." };
    }
  };

  /* ================= SCOPING FILTERS ================= */

  const getVisibleTasks = (
    user,
    projectTeams = {},
    teams = [],
    projects = []
  ) => {
    if (!user) return [];

    return tasks.filter((task) => {
      const project = projects.find(
        (p) =>
          String(p.id) ===
          String(task.projectId)
      );

      return canAccessTask(
        user,
        task,
        project,
        projectTeams,
        teams,
        subtasks
      );
    });
  };

  const getVisibleSubtasks = (
    user,
    projectTeams = {},
    teams = [],
    projects = []
  ) => {
    if (!user) return [];

    return subtasks.filter((sub) => {
      const parentTask =
        getTaskById(sub.taskId);

      const project = projects.find(
        (p) =>
          String(p.id) ===
          String(parentTask?.projectId)
      );

      return canAccessSubtask(
        user,
        sub,
        parentTask,
        project,
        projectTeams,
        teams
      );
    });
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        subtasks,
        loading,
        error,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTaskById,
        createSubtask,
        updateSubtask,
        updateSubtaskStatus,
        deleteSubtask,
        getSubtasksByTaskId,
        getVisibleTasks,
        getVisibleSubtasks,
        refetchTasks: fetchTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () =>
  useContext(TasksContext);