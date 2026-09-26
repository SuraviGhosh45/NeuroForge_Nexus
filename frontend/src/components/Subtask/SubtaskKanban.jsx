import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiUserCircle,
  PiLockKey,
} from "react-icons/pi";

import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { canMoveSubtaskKanban } from "../../utils/access.js";

const COLUMNS = [
  {
    id: "To Do",
    title: "To Do",
    color: "text-slate-600",
    dot: "bg-slate-500",
  },
  {
    id: "In Progress",
    title: "In Progress",
    color: "text-[#2563EB]",
    dot: "bg-[#2563EB]",
  },
  {
    id: "In Review",
    title: "In Review",
    color: "text-purple-600",
    dot: "bg-purple-500",
  },
  {
    id: "Done",
    title: "Done",
    color: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
];

const priorityColor = {
  Critical: "text-red-700 border-red-200 bg-red-50",
  High: "text-red-700 border-red-200 bg-red-50",
  Medium: "text-amber-700 border-amber-200 bg-amber-50",
  Low: "text-emerald-700 border-emerald-200 bg-emerald-50",
};

const SubtaskKanban = () => {
  const {
    projectId,
    taskId,
    subtaskId,
  } = useParams();

  const navigate = useNavigate();

  const {
    getTaskById,
    getSubtasksByTaskId,
    updateSubtask,
    updateSubtaskStatus,
  } = useTasks();

  const { users } = useUsers();
  const { currentUser } = useAuth();
  const { getProjectById } = useProjects();
  const { projectTeams = {} } = useProjectTeam();
  const { teams = [] } = useTeams();

  const project = getProjectById(projectId);

  const [draggedSubtaskId, setDraggedSubtaskId] =
    useState(null);

  const [dragOverColumn, setDragOverColumn] =
    useState(null);

  const [isUpdating, setIsUpdating] =
    useState(false);

  if (!projectId || !taskId || !subtaskId) {
    return (
      <div className="min-h-full bg-[#E8EEF7] p-6 text-[#172033]">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#172033]">
              Invalid subtask URL
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              Project, task, or subtask information is
              missing from the URL.
            </p>

            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const parentTask = useMemo(() => {
    return getTaskById(taskId);
  }, [getTaskById, taskId]);

  const subtasks = useMemo(() => {
    return getSubtasksByTaskId(taskId);
  }, [getSubtasksByTaskId, taskId]);

  const getAssignee = (assigneeId) => {
    return users.find(
      (user) =>
        String(user.id) === String(assigneeId)
    );
  };

  const handleDragStart = (
    event,
    subtask
  ) => {
    const canMove = canMoveSubtaskKanban(
      currentUser,
      subtask,
      parentTask,
      project,
      projectTeams,
      teams
    );

    if (!canMove) {
      event.preventDefault();
      return;
    }

    setDraggedSubtaskId(subtask.id);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
      "text/plain",
      String(subtask.id)
    );
  };

  const handleDragEnd = () => {
    setDraggedSubtaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (
    event,
    columnId
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverColumn(columnId);
  };

  const handleDragLeave = (
    event,
    columnId
  ) => {
    const currentTarget =
      event.currentTarget;

    const relatedTarget =
      event.relatedTarget;

    if (
      relatedTarget &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (
    event,
    newStatus
  ) => {
    event.preventDefault();

    const draggedId =
      event.dataTransfer.getData(
        "text/plain"
      ) || draggedSubtaskId;

    setDragOverColumn(null);

    if (!draggedId) {
      setDraggedSubtaskId(null);
      return;
    }

    const draggedSubtask =
      subtasks.find(
        (subtask) =>
          String(subtask.id) ===
          String(draggedId)
      );

    if (!draggedSubtask) {
      setDraggedSubtaskId(null);
      return;
    }

    const canMove = canMoveSubtaskKanban(
      currentUser,
      draggedSubtask,
      parentTask,
      project,
      projectTeams,
      teams
    );

    if (!canMove) {
      setDraggedSubtaskId(null);
      return;
    }

    if (
      (draggedSubtask.status || "To Do") ===
      newStatus
    ) {
      setDraggedSubtaskId(null);
      return;
    }

    setIsUpdating(true);

    const result = updateSubtaskStatus
      ? await updateSubtaskStatus(
          draggedSubtask.id,
          newStatus
        )
      : await updateSubtask(taskId, {
          ...draggedSubtask,
          status: newStatus,
        });

    setIsUpdating(false);
    setDraggedSubtaskId(null);

    if (!result.success) {
      alert(result.message);
    }
  };

  const handleOpenSubtask = (subtask) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/${subtask.id}`
    );
  };

  if (!parentTask) {
    return (
      <div className="min-h-full bg-[#E8EEF7] p-6 text-[#172033]">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${projectId}/tasks/${taskId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#475569] transition hover:text-[#2563EB]"
          >
            <PiArrowLeft />
            Back to Task
          </button>

          <div className="rounded-2xl border border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#172033]">
              Task not found
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              This task may have been deleted or
              does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#E8EEF7] px-4 py-6 text-[#172033] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${projectId}/tasks/${taskId}/${subtaskId}`
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#475569] transition hover:text-[#2563EB]"
        >
          <PiArrowLeft />
          Back to Subtask
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-slate-300 bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
                  TASK-{parentTask.id}
                </span>

                <span className="text-sm text-[#64748B]">
                  Subtask Kanban
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
                {parentTask.title}
              </h1>

              <p className="mt-2 text-sm text-[#475569]">
                Drag and drop subtasks between
                columns to update their status.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border-b border-slate-200 p-2">
            <div className="flex min-w-max gap-1">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${projectId}/tasks/${taskId}/${subtaskId}`
                  )
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#475569] transition hover:bg-[#F1F5F9] hover:text-[#172033]"
              >
                Subtask Details
              </button>

              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
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
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#475569] transition hover:bg-[#F1F5F9] hover:text-[#172033]"
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((column) => {
            const count =
              subtasks.filter((subtask) => {
                const st =
                  subtask.status || "To Do";

                if (column.id === "In Review") {
                  return [
                    "In Review",
                    "Ready for Testing",
                    "In Testing",
                    "In QA",
                  ].includes(st);
                }

                return st === column.id;
              }).length;

            return (
              <div
                key={column.id}
                className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#475569]">
                    {column.title}
                  </p>

                  <span
                    className={`text-sm font-semibold ${column.color}`}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[1000px] grid-cols-4 gap-5">
            {COLUMNS.map((column) => {
              const columnSubtasks =
                subtasks.filter((subtask) => {
                  const st =
                    subtask.status || "To Do";

                  if (column.id === "In Review") {
                    return [
                      "In Review",
                      "Ready for Testing",
                      "In Testing",
                      "In QA",
                    ].includes(st);
                  }

                  return st === column.id;
                });

              const isDropTarget =
                dragOverColumn === column.id;

              return (
                <div
                  key={column.id}
                  onDragOver={(event) =>
                    handleDragOver(
                      event,
                      column.id
                    )
                  }
                  onDragLeave={(event) =>
                    handleDragLeave(
                      event,
                      column.id
                    )
                  }
                  onDrop={(event) =>
                    handleDrop(
                      event,
                      column.id
                    )
                  }
                  className={`min-h-[500px] rounded-2xl border bg-white transition-all duration-200 ${
                    isDropTarget
                      ? "border-blue-300 bg-blue-50/60 shadow-[0_0_0_1px_rgba(37,99,235,0.12)]"
                      : "border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
                      />

                      <h2 className="text-sm font-semibold text-[#172033]">
                        {column.title}
                      </h2>
                    </div>

                    <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#64748B]">
                      {columnSubtasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    {columnSubtasks.length === 0 ? (
                      <div
                        className={`flex min-h-[220px] items-center justify-center rounded-xl border border-dashed transition ${
                          isDropTarget
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-300 bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-sm text-[#64748B]">
                            {isDropTarget
                              ? "Drop subtask here"
                              : "No subtasks"}
                          </p>

                          {!isDropTarget && (
                            <p className="mt-1 text-xs text-slate-400">
                              Drag a card here
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      columnSubtasks.map(
                        (subtask) => {
                          const assignee =
                            getAssignee(
                              subtask.assigneeId
                            );

                          const priorityStyles =
                            priorityColor[
                              subtask.priority
                            ] ||
                            priorityColor.Medium;

                          const isDragging =
                            String(
                              draggedSubtaskId
                            ) ===
                            String(
                              subtask.id
                            );

                          const canDrag =
                            !isUpdating &&
                            canMoveSubtaskKanban(
                              currentUser,
                              subtask,
                              parentTask,
                              project,
                              projectTeams,
                              teams
                            );

                          return (
                            <div
                              key={subtask.id}
                              draggable={canDrag}
                              onDragStart={(event) =>
                                handleDragStart(
                                  event,
                                  subtask
                                )
                              }
                              onDragEnd={
                                handleDragEnd
                              }
                              className={`rounded-xl border bg-[#F8FAFC] p-4 transition-all duration-200 ${
                                canDrag
                                  ? "cursor-grab border-slate-300 hover:border-blue-200 hover:bg-blue-50/30 active:cursor-grabbing"
                                  : "cursor-default opacity-85 border-slate-300 hover:border-slate-400"
                              } ${
                                isDragging
                                  ? "scale-[0.98] border-blue-300 opacity-40"
                                  : ""
                              }`}
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                                  {canDrag ? (
                                    "Drag to move"
                                  ) : (
                                    <>
                                      <PiLockKey
                                        size={12}
                                        className="text-amber-600"
                                      />
                                      <span>
                                        Locked
                                      </span>
                                    </>
                                  )}
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  {subtask.id}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenSubtask(
                                    subtask
                                  )
                                }
                                className="w-full text-left text-sm font-semibold text-[#172033] transition hover:text-[#2563EB]"
                              >
                                {subtask.title}
                              </button>

                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#64748B]">
                                {subtask.description ||
                                  "No description has been added."}
                              </p>

                              <div className="mt-4">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityStyles}`}
                                >
                                  {subtask.priority ||
                                    "Medium"}
                                </span>
                              </div>

                              <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                  <PiUserCircle />

                                  <span className="truncate">
                                    {assignee?.fullName ||
                                      assignee?.name ||
                                      assignee?.username ||
                                      "Unassigned"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                                  <PiCalendarBlank />

                                  <span>
                                    {subtask.dueDate ||
                                      "No due date"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {draggedSubtaskId && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-blue-200 bg-[#172033] px-4 py-2 text-xs font-medium text-blue-200 shadow-xl">
            Dragging subtask — drop it into a column
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtaskKanban;