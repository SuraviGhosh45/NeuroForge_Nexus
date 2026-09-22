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
    "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

  High:
    "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

  Medium:
    "text-[#f0d090] border-[#f0d090]/30 bg-[#f0d090]/5",

  Low:
    "text-[#a0d0a0] border-[#a0d0a0]/30 bg-[#a0d0a0]/5",
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

  const [deleting, setDeleting] =
    useState(false);

  // --------------------------------------------------
  // PARENT TASK
  // --------------------------------------------------

  const parentTask = useMemo(() => {
    return getTaskById(taskId);
  }, [getTaskById, taskId]);

  // --------------------------------------------------
  // CURRENT SUBTASK
  // --------------------------------------------------

  const subtask = useMemo(() => {
    const subtasks =
      getSubtasksByTaskId(taskId);

    return subtasks.find(
      (item) =>
        String(item.id) ===
        String(subtaskId)
    );
  }, [
    getSubtasksByTaskId,
    taskId,
    subtaskId,
  ]);

  // --------------------------------------------------
  // PROJECT
  // --------------------------------------------------

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

  // --------------------------------------------------
  // ASSIGNEE
  // --------------------------------------------------

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

  // --------------------------------------------------
  // DELETE SUBTASK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // EDIT SUBTASK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // SUBTASK NOT FOUND
  // --------------------------------------------------

  if (!parentTask || !subtask) {
    return (
      <div className="min-h-full bg-[#07111f] p-6 text-[#e8eef8]">

        <div className="mx-auto max-w-5xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${projectId}/tasks/${taskId}/subtasks`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
          >
            <PiArrowLeft />
            Back to Subtasks
          </button>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">

            <p className="text-lg font-semibold">
              Subtask not found
            </p>

            <p className="mt-2 text-sm text-[#e8eef8]/50">
              This subtask may have been deleted
              or does not exist.
            </p>

          </div>

        </div>
      </div>
    );
  }

  const priorityStyles =
    priorityColor[subtask.priority] || "";

  return (
    <div className="min-h-full bg-[#07111f] px-4 py-6 text-[#e8eef8] sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1200px]">

        {/* -------------------------------------------------- */}
        {/* BACK */}
        {/* -------------------------------------------------- */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${projectId}/tasks/${taskId}/subtasks`
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
        >
          <PiArrowLeft />
          Back to Subtasks
        </button>

        {/* -------------------------------------------------- */}
        {/* MAIN CONTAINER */}
        {/* -------------------------------------------------- */}

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">

          {/* -------------------------------------------------- */}
          {/* HEADER */}
          {/* -------------------------------------------------- */}

          <div className="border-b border-[#e8eef8]/10 p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-3 py-1 text-xs text-[#e8eef8]/50">
                    SUBTASK-{subtask.id}
                  </span>

                  <span className="text-sm text-[#e8eef8]/40">
                    Sub Task Details
                  </span>

                </div>

                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                  {subtask.title}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e8eef8]/50">
                  View the details and information
                  associated with this subtask.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex shrink-0 gap-2">

                {(can("subtask:edit") || String(subtask?.assigneeId) === String(currentUser?.id)) && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-4 py-2.5 text-sm font-medium text-[#e8eef8]/70 transition hover:border-blue-400/20 hover:bg-blue-400/5 hover:text-blue-400"
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
                    className="inline-flex items-center gap-2 rounded-xl border border-[#f0a0a0]/20 bg-[#f0a0a0]/5 px-4 py-2.5 text-sm font-medium text-[#f0a0a0] transition hover:bg-[#f0a0a0]/10 disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* -------------------------------------------------- */}
          {/* SUBTASK WORKSPACE NAVIGATION */}
          {/* -------------------------------------------------- */}

          <div className="overflow-x-auto border-b border-[#e8eef8]/10 p-2">

            <div className="flex min-w-max gap-1">

              {/* SUB TASK DETAILS */}

              <button
                type="button"
                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white"
              >
                Sub Task Details
              </button>

              {/* KANBAN */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/tasks/${taskId}/${subtaskId}/kanban`
                  )
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#e8eef8]/50 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                Kanban
              </button>

              {/* CALENDAR */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/tasks/${taskId}/${subtaskId}/calendar`
                  )
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#e8eef8]/50 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                Calendar
              </button>

            </div>

          </div>

          {/* -------------------------------------------------- */}
          {/* CONTENT */}
          {/* -------------------------------------------------- */}

          <div className="p-6">

            {/* DESCRIPTION */}

            <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/5 text-blue-400">
                  <PiCheckCircle size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Description
                  </p>

                  <p className="text-xs text-[#e8eef8]/30">
                    Subtask information
                  </p>
                </div>

              </div>

              <p className="mt-5 text-sm leading-7 text-[#e8eef8]/60">
                {subtask.description ||
                  "No description has been added for this subtask."}
              </p>

            </div>

            {/* INFORMATION CARDS */}

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* PRIORITY */}

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0d090]/5 text-[#f0d090]">
                    <PiCheckCircle size={20} />
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-[#e8eef8]/30">
                      Priority
                    </p>

                    <div className="mt-2">

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs ${priorityStyles}`}
                      >
                        {subtask.priority ||
                          "Medium"}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ASSIGNEE */}

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/5 text-blue-400">
                    <PiUserCircle size={20} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wide text-[#e8eef8]/30">
                      Assignee
                    </p>

                    <p className="mt-2 truncate text-sm font-medium text-[#e8eef8]/80">
                      {assignee?.fullName ||
                        assignee?.name ||
                        assignee?.username ||
                        "Unassigned"}
                    </p>

                  </div>

                </div>

              </div>

              {/* DUE DATE */}

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/5 text-blue-400">
                    <PiCalendarBlank size={20} />
                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wide text-[#e8eef8]/30">
                      Due Date
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#e8eef8]/80">
                      {subtask.dueDate ||
                        "No due date"}
                    </p>

                  </div>

                </div>

              </div>

              {/* PROJECT */}

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/5 text-emerald-400">
                    <PiFolder size={20} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wide text-[#e8eef8]/30">
                      Project
                    </p>

                    <p className="mt-2 truncate text-sm font-medium text-[#e8eef8]/80">
                      {project?.name ||
                        project?.title ||
                        `Project ${projectId}`}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* CREATED INFORMATION */}

            <div className="mt-5 rounded-2xl border border-[#e8eef8]/10 bg-[#07111f]/50 p-5">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8eef8]/5 text-[#e8eef8]/50">
                    <PiClock size={18} />
                  </div>

                  <div>

                    <p className="text-[11px] uppercase tracking-wide text-[#e8eef8]/30">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-[#e8eef8]/70">
                      {subtask.createdAt
                        ? new Date(
                            subtask.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8eef8]/5 text-[#e8eef8]/50">
                    <PiFolder size={18} />
                  </div>

                  <div>

                    <p className="text-[11px] uppercase tracking-wide text-[#e8eef8]/30">
                      Project
                    </p>

                    <p className="mt-1 text-sm text-[#e8eef8]/70">
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