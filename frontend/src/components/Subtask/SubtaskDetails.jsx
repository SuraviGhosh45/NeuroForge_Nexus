import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiCheckCircle,
  PiClock,
  PiFolder,
  PiPencilSimple,
  PiTrash,
  PiUserCircle,
} from "react-icons/pi";

import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";

const priorityColor = {
  Critical:
    "text-red-700 border-red-200 bg-red-50",
  High:
    "text-red-700 border-red-200 bg-red-50",
  Medium:
    "text-amber-700 border-amber-200 bg-amber-50",
  Low:
    "text-emerald-700 border-emerald-200 bg-emerald-50",
};

const statusColor = {
  "To Do":
    "text-slate-600 border-slate-200 bg-slate-100",
  "In Progress":
    "text-blue-700 border-blue-200 bg-blue-50",
  "In Review":
    "text-amber-700 border-amber-200 bg-amber-50",
  "Ready for Testing":
    "text-purple-700 border-purple-200 bg-purple-50",
  "In Testing":
    "text-indigo-700 border-indigo-200 bg-indigo-50",
  "In QA":
    "text-cyan-700 border-cyan-200 bg-cyan-50",
  Done:
    "text-emerald-700 border-emerald-200 bg-emerald-50",
};

const SubtaskDetails = () => {
  const {
    projectId,
    taskId,
    subtaskId,
  } = useParams();

  const navigate = useNavigate();

  const {
    getTaskById,
    getSubtasksByTaskId,
    deleteSubtask,
  } = useTasks();

  const { users } = useUsers();
  const { projects } = useProjects();
  const { can } = usePermission();
  const { currentUser } = useAuth();

  const [deleting, setDeleting] = useState(false);

  const parentTask = useMemo(() => {
    return getTaskById(taskId);
  }, [getTaskById, taskId]);

  const subtask = useMemo(() => {
    const subtasks = getSubtasksByTaskId(taskId);

    return subtasks.find(
      (item) =>
        String(item.id) === String(subtaskId)
    );
  }, [
    getSubtasksByTaskId,
    taskId,
    subtaskId,
  ]);

  const project = useMemo(() => {
    return projects?.find(
      (item) =>
        String(item.id) ===
        String(
          parentTask?.projectId || projectId
        )
    );
  }, [
    projects,
    parentTask,
    projectId,
  ]);

  const assignee = useMemo(() => {
    if (!subtask?.assigneeId) {
      return null;
    }

    return users.find(
      (user) =>
        String(user.id) ===
        String(subtask.assigneeId)
    );
  }, [users, subtask]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subtask?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const result = await deleteSubtask(
      taskId,
      subtaskId
    );

    setDeleting(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    navigate(
      `/projects/${projectId}/tasks/${taskId}/subtasks`
    );
  };

  const handleEdit = () => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/subtasks`,
      {
        state: {
          editSubtaskId: subtaskId,
        },
      }
    );
  };

  if (!parentTask || !subtask) {
    return (
      <div className="min-h-full bg-[#E8EEF7] p-6 text-[#172033]">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${projectId}/tasks/${taskId}/subtasks`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#172033]"
          >
            <PiArrowLeft />
            Back to Subtasks
          </button>

          <div className="rounded-2xl border border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#172033]">
              Subtask not found
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              This subtask may have been deleted
              or does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const priorityStyles =
    priorityColor[subtask.priority] ||
    priorityColor.Medium;

  return (
    <div className="min-h-full bg-[#E8EEF7] px-4 py-6 text-[#172033] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${projectId}/tasks/${taskId}/subtasks`
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#172033]"
        >
          <PiArrowLeft />
          Back to Subtasks
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[#172033] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg border border-slate-600 bg-[#24324A] px-3 py-1 text-xs font-medium text-slate-300">
                    SUBTASK-{subtask.id}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusColor[subtask.status] ||
                      statusColor["To Do"]
                    }`}
                  >
                    {subtask.status || "To Do"}
                  </span>

                  <span className="text-sm text-slate-400">
                    Sub Task Details
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  {subtask.title}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  View the details and information
                  associated with this subtask.
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {(can("subtask:edit") ||
                  String(subtask?.assigneeId) ===
                    String(currentUser?.id)) && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-[#24324A] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    <PiPencilSimple />
                    Edit
                  </button>
                )}

                {can("subtask:delete") && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PiTrash />

                    {deleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white p-2">
            <div className="flex min-w-max gap-1">
              <button
                type="button"
                className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                Sub Task Details
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/tasks/${taskId}/${subtaskId}/kanban`
                  )
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#172033]"
              >
                Kanban
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/tasks/${taskId}/${subtaskId}/calendar`
                  )
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#172033]"
              >
                Calendar
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-slate-300 bg-[#F1F5F9] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#2563EB]">
                  <PiCheckCircle size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#172033]">
                    Description
                  </p>

                  <p className="text-xs text-[#64748B]">
                    Subtask information
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#475569]">
                {subtask.description ||
                  "No description has been added for this subtask."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#D97706]">
                    <PiCheckCircle size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Priority
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles}`}
                      >
                        {subtask.priority || "Medium"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <PiUserCircle size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Assignee
                    </p>

                    <p className="mt-2 truncate text-sm font-semibold text-[#172033]">
                      {assignee?.fullName ||
                        assignee?.name ||
                        assignee?.username ||
                        "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <PiCalendarBlank size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Due Date
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#172033]">
                      {subtask.dueDate ||
                        "No due date"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#16A34A]">
                    <PiFolder size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      Project
                    </p>

                    <p className="mt-2 truncate text-sm font-semibold text-[#172033]">
                      {project?.name ||
                        project?.title ||
                        `Project ${projectId}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
                    <PiClock size={18} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-[#475569]">
                      {subtask.createdAt
                        ? new Date(
                            subtask.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
                    <PiFolder size={18} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                      Project
                    </p>

                    <p className="mt-1 text-sm text-[#475569]">
                      {project?.name ||
                        project?.title ||
                        `Project ${projectId}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskDetails;