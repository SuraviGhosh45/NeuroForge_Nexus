import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { canAccessTask, canAccessSubtask } from "../utils/access.js";

const TasksContext = createContext(null);

const API_BASE = "http://localhost:8080/api/tasks";
const SUBTASKS_STORAGE_KEY = "sdlc_subtasks";

// Initial seed subtasks if storage is empty
const SEED_SUBTASKS = [
  {
    id: 1,
    taskId: 1,
    title: "Setup Authentication Gateway",
    description: "Implement OAuth2 / JWT authentication filters and security context provider.",
    assigneeId: 1,
    teamId: 1,
    status: "Done",
    priority: "High",
    dueDate: "2026-09-25",
    createdAt: "2026-09-18T10:00:00Z",
  },
  {
    id: 2,
    taskId: 1,
    title: "Create User Profile Component",
    description: "Design and implement user settings and avatar management interface.",
    assigneeId: 1,
    teamId: 1,
    status: "In Progress",
    priority: "Medium",
    dueDate: "2026-09-28",
    createdAt: "2026-09-19T11:30:00Z",
  },
  {
    id: 3,
    taskId: 1,
    title: "Write Integration Tests for Auth Flow",
    description: "Test edge cases for token expiry, refresh tokens, and CSRF protection.",
    assigneeId: 1,
    teamId: 1,
    status: "To Do",
    priority: "High",
    dueDate: "2026-10-02",
    createdAt: "2026-09-20T09:15:00Z",
  },
  {
    id: 4,
    taskId: 2,
    title: "Database Schema Migration",
    description: "Apply Flyway / Liquibase scripts for task dependency table.",
    assigneeId: 2,
    teamId: 1,
    status: "Done",
    priority: "Critical",
    dueDate: "2026-09-24",
    createdAt: "2026-09-15T08:00:00Z",
  },
  {
    id: 5,
    taskId: 2,
    title: "Sprint Burndown Calculation Logic",
    description: "Compute remaining story points and estimate velocity metrics.",
    assigneeId: 2,
    teamId: 1,
    status: "In Progress",
    priority: "High",
    dueDate: "2026-09-29",
    createdAt: "2026-09-18T14:00:00Z",
  },
];

const TASKS_STORAGE_KEY = "sdlc_tasks";

const SEED_TASKS = [
  {
    id: 1,
    projectId: 1,
    title: "Authentication & Authorization Architecture",
    description: "Design and implement OAuth2/JWT security filters, RBAC access controls, and session validation.",
    assigneeId: 1,
    priority: "High",
    status: "In Progress",
    dueDate: "2026-10-15",
  },
  {
    id: 2,
    projectId: 1,
    title: "Core Ledger & Transaction Engine",
    description: "Build high-throughput transaction ledger, double-entry bookkeeping, and account balance reconciliation.",
    assigneeId: 4,
    priority: "Critical",
    status: "To Do",
    dueDate: "2026-10-25",
  },
  {
    id: 3,
    projectId: 1,
    title: "AI-Powered Fraud Detection Pipeline",
    description: "Integrate machine learning inference service for anomaly detection on high-value transfers.",
    assigneeId: 5,
    priority: "High",
    status: "To Do",
    dueDate: "2026-11-05",
  },
];

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return SEED_TASKS;
    } catch (e) {
      console.error("Failed to load tasks from localStorage:", e);
      return SEED_TASKS;
    }
  });

  const [subtasks, setSubtasks] = useState(() => {
    try {
      const stored = localStorage.getItem(SUBTASKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return SEED_SUBTASKS;
    } catch (e) {
      console.error("Failed to load subtasks from localStorage:", e);
      return SEED_SUBTASKS;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync tasks to localStorage
  useEffect(() => {
    try {
      if (tasks && tasks.length > 0) {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      }
    } catch (e) {
      console.error("Failed to save tasks to localStorage:", e);
    }
  }, [tasks]);

  // Sync subtasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SUBTASKS_STORAGE_KEY, JSON.stringify(subtasks));
    } catch (e) {
      console.error("Failed to save subtasks to localStorage:", e);
    }
  }, [subtasks]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_BASE);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTasks(response.data);
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(response.data));
      }
    } catch (err) {
      console.warn("Failed to fetch tasks from backend (using local state):", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const normalizeTask = (task) => {
    if (!task) return task;
    const projId = task.projectId ?? task.project?.id ?? task.project_id ?? null;
    const assId = task.assigneeId ?? task.assignee?.id ?? task.assignee_id ?? null;
    return {
      ...task,
      projectId: projId ? Number(projId) : null,
      assigneeId: assId ? Number(assId) : null,
    };
  };

  const buildPayload = (formData) => ({
    title: formData.title,
    description: formData.description || "",
    projectId: formData.projectId ? Number(formData.projectId) : null,
    assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
    status: formData.status,
    priority: formData.priority,
    dueDate: formData.dueDate || null,
  });

  /* ================= PARENT TASK CRUD ================= */

  const createTask = async (formData) => {
    try {
      const response = await axios.post(API_BASE, buildPayload(formData));
      const newTask = normalizeTask(response.data || formData);
      setTasks((prev) => [...prev, newTask]);
      return { success: true, data: newTask };
    } catch (err) {
      // Fallback local task creation for offline/dev
      const newTask = normalizeTask({
        id: Date.now(),
        ...formData,
      });
      setTasks((prev) => [...prev, newTask]);
      return { success: true, data: newTask };
    }
  };

  const updateTask = async (formData) => {
    try {
      const response = await axios.put(`${API_BASE}/${formData.id}`, buildPayload(formData));
      const updated = normalizeTask(response.data || formData);
      setTasks((prev) =>
        prev.map((task) => (String(task.id) === String(formData.id) ? { ...task, ...updated } : task))
      );
      return { success: true, data: updated };
    } catch (err) {
      // Fallback local update
      const updated = normalizeTask(formData);
      setTasks((prev) =>
        prev.map((task) => (String(task.id) === String(formData.id) ? { ...task, ...updated } : task))
      );
      return { success: true, data: updated };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/${taskId}`);
    } catch (err) {
      console.warn("Backend task deletion failed, removing locally:", err.message);
    }
    setTasks((prev) => prev.filter((task) => String(task.id) !== String(taskId)));
    // Also cleanup subtasks under this parent task
    setSubtasks((prev) => prev.filter((sub) => String(sub.taskId) !== String(taskId)));
    return { success: true };
  };

  const getTaskById = (taskId) => {
    return tasks.find((t) => String(t.id) === String(taskId)) || null;
  };

  /* ================= SUBTASK CRUD ================= */

  const getSubtasksByTaskId = (taskId) => {
    if (!taskId) return [];
    return subtasks.filter((sub) => String(sub.taskId) === String(taskId));
  };

  const createSubtask = async (taskId, subtaskData) => {
    if (!taskId || !subtaskData?.title) {
      return { success: false, message: "Task ID and title are required." };
    }

    const newSubtask = {
      id: Date.now(),
      taskId: Number(taskId),
      title: subtaskData.title.trim(),
      description: subtaskData.description || "",
      assigneeId: subtaskData.assigneeId ? Number(subtaskData.assigneeId) : null,
      teamId: subtaskData.teamId ? Number(subtaskData.teamId) : null,
      status: subtaskData.status || "To Do",
      priority: subtaskData.priority || "Medium",
      dueDate: subtaskData.dueDate || null,
      createdAt: new Date().toISOString(),
    };

    setSubtasks((prev) => [...prev, newSubtask]);
    return { success: true, data: newSubtask };
  };

  const updateSubtask = async (taskId, updatedSubtask) => {
    if (!updatedSubtask?.id) {
      return { success: false, message: "Subtask ID is required." };
    }

    setSubtasks((prev) =>
      prev.map((sub) =>
        String(sub.id) === String(updatedSubtask.id)
          ? {
              ...sub,
              ...updatedSubtask,
              taskId: Number(taskId || sub.taskId),
              assigneeId: updatedSubtask.assigneeId
                ? Number(updatedSubtask.assigneeId)
                : sub.assigneeId,
              teamId: updatedSubtask.teamId
                ? Number(updatedSubtask.teamId)
                : sub.teamId,
            }
          : sub
      )
    );

    return { success: true };
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    if (!subtaskId) {
      return { success: false, message: "Subtask ID is required." };
    }

    setSubtasks((prev) => prev.filter((sub) => String(sub.id) !== String(subtaskId)));
    return { success: true };
  };

  /* ================= SCOPING FILTERS ================= */

  const getVisibleTasks = (user, projectTeams = {}, teams = [], projects = []) => {
    if (!user) return [];
    return tasks.filter((task) => {
      const project = projects.find((p) => String(p.id) === String(task.projectId));
      return canAccessTask(user, task, project, projectTeams, teams, subtasks);
    });
  };

  const getVisibleSubtasks = (user, projectTeams = {}, teams = [], projects = []) => {
    if (!user) return [];
    return subtasks.filter((sub) => {
      const parentTask = getTaskById(sub.taskId);
      const project = projects.find(
        (p) => String(p.id) === String(parentTask?.projectId)
      );
      return canAccessSubtask(user, sub, parentTask, project, projectTeams, teams);
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
        deleteTask,
        getTaskById,
        createSubtask,
        updateSubtask,
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

export const useTasks = () => useContext(TasksContext);