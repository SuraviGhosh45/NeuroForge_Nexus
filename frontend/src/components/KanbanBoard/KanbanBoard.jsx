import React, { useMemo, useState } from "react";
import KanbanColumn from "./KanbanColumn.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import "./Kanban.css";

const COLUMNS = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "In Review", title: "In Review" },
  { id: "Done", title: "Done" },
];

function KanbanBoard() {
  const { tasks, updateTask, updateTaskStatus } = useTasks();

  const {
    projects,
    selectedProjectId,
    selectProject,
  } = useProjects();

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (event, task) => {
    setDraggedTaskId(task.id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", String(task.id));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();
    event.stopPropagation();

    const taskId =
      event.dataTransfer.getData("taskId") || draggedTaskId;

    if (!taskId) {
      setDraggedTaskId(null);
      return;
    }

    const task = tasks.find(
      (item) => String(item.id) === String(taskId)
    );

    if (!task) {
      setDraggedTaskId(null);
      return;
    }

    if (
      task.status === newStatus ||
      task.boardStatus === newStatus
    ) {
      setDraggedTaskId(null);
      return;
    }

    const result = updateTaskStatus
      ? await updateTaskStatus(task.id, newStatus)
      : await updateTask({
          ...task,
          status: newStatus,
        });

    if (!result.success) {
      console.error(
        "Failed to update task status:",
        result.message
      );
    }

    setDraggedTaskId(null);
  };

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }

    return tasks.filter(
      (task) =>
        String(task.projectId) ===
        String(selectedProjectId)
    );
  }, [tasks, selectedProjectId]);

  const normalizeStatus = (status) => {
    if (!status) return "To Do";

    const upper = String(status)
      .toUpperCase()
      .replace(/\s+/g, "_");

    if (upper === "TODO" || upper === "TO_DO") {
      return "To Do";
    }

    if (upper === "IN_PROGRESS") {
      return "In Progress";
    }

    if (
      upper === "IN_REVIEW" ||
      upper === "READY_FOR_TESTING" ||
      upper === "IN_TESTING" ||
      upper === "IN_QA"
    ) {
      return "In Review";
    }

    if (
      upper === "DONE" ||
      upper === "COMPLETED"
    ) {
      return "Done";
    }

    return status;
  };

  const tasksByStatus = useMemo(() => {
    const groupedTasks = {
      "To Do": [],
      "In Progress": [],
      "In Review": [],
      Done: [],
    };

    projectTasks.forEach((task) => {
      const status = normalizeStatus(
        task.status || task.boardStatus
      );

      if (groupedTasks[status]) {
        groupedTasks[status].push(task);
      } else {
        groupedTasks["To Do"].push(task);
      }
    });

    return groupedTasks;
  }, [projectTasks]);

  const totalTasks = projectTasks.length;
  const completedTasks = tasksByStatus.Done.length;

  const selectedProject = projects.find(
    (project) =>
      String(project.id) ===
      String(selectedProjectId)
  );

  return (
    <section className="min-h-full space-y-6 bg-[#E8EEF7] p-1">
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Kanban Board
          </span>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
            Task Board
          </h1>

          <p className="mt-1 text-sm text-[#475569]">
            Manage and track your project tasks across different stages.
          </p>
        </div>

        <div className="w-full rounded-xl border border-slate-300 bg-[#F1F5F9] p-4 lg:w-72">
          <label
            htmlFor="kanban-project-select"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#64748B]"
          >
            Project
          </label>

          <select
            id="kanban-project-select"
            value={selectedProjectId || ""}
            onChange={(event) =>
              selectProject(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
          >
            {projects.length === 0 ? (
              <option value="">
                No projects available
              </option>
            ) : (
              projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedProject && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#172033]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
          <span>{selectedProject.name}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[#2563EB]">
            T
          </div>

          <div>
            <span className="block text-xs font-medium text-[#64748B]">
              Total Tasks
            </span>
            <strong className="mt-1 block text-xl font-bold text-[#172033]">
              {totalTasks}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-[#475569]">
            T
          </div>

          <div>
            <span className="block text-xs font-medium text-[#64748B]">
              To Do
            </span>
            <strong className="mt-1 block text-xl font-bold text-[#172033]">
              {tasksByStatus["To Do"].length}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-[#4F46E5]">
            P
          </div>

          <div>
            <span className="block text-xs font-medium text-[#64748B]">
              In Progress
            </span>
            <strong className="mt-1 block text-xl font-bold text-[#172033]">
              {tasksByStatus["In Progress"].length}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-[#16A34A]">
            ✓
          </div>

          <div>
            <span className="block text-xs font-medium text-[#64748B]">
              Completed
            </span>
            <strong className="mt-1 block text-xl font-bold text-[#172033]">
              {completedTasks}
            </strong>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#172033]">
              Project Workflow
            </h2>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Drag tasks between columns to update their status.
            </p>
          </div>

          <span className="rounded-full bg-[#172033] px-3 py-1 text-xs font-semibold text-white">
            {totalTasks} task{totalTasks === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[1000px] grid-cols-4 gap-4">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className="min-h-[420px] rounded-xl border border-slate-300 bg-[#F1F5F9] p-3"
              >
                <KanbanColumn
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  draggedTaskId={draggedTaskId}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KanbanBoard;