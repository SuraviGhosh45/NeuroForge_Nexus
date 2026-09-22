import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  PiArrowLeft,
  PiCheckCircle,
  PiCalendarBlank,
  PiUserCircle,
  PiFolder,
  PiClock,
  PiListChecks,
} from "react-icons/pi";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";

const TASK_STATUSES = ["To Do", "In Progress", "Done"];

const priorityColor = {
  Critical: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  High: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Medium: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  Low: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

const ParentTaskDetailsPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const { tasks, updateTask, getSubtasksByTaskId } = useTasks();
  const { getProjectById } = useProjects();
  const { users } = useUsers();

  const task = tasks.find((t) => String(t.id) === String(taskId));
  const project = getProjectById(projectId);
  const subtasks = getSubtasksByTaskId(taskId);

  const [status, setStatus] = useState(task?.status || "To Do");
  const [updating, setUpdating] = useState(false);

  if (!task) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-white">Parent Task Not Found</h2>
        <p className="mt-1 text-sm text-[#e8eef8]/50">
          The requested task might have been deleted or does not exist in this project.
        </p>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          Back to Project
        </button>
      </div>
    );
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    await updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId || projectId,
      assigneeId: task.assigneeId,
      priority: task.priority,
      dueDate: task.dueDate,
      status: newStatus,
    });
    setUpdating(false);
  };

  const assigneeUser =
    task.assignee ||
    users.find((u) => String(u.id) === String(task.assigneeId));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#e8eef8]/50 hover:text-white transition"
      >
        <PiArrowLeft size={16} />
        Back to Project Workspace
      </button>

      {/* Main Task Container */}
      <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-xl overflow-hidden">
        {/* Workspace Navbar per Section 8 */}
        <div className="flex border-b border-[#e8eef8]/10 bg-[#0a0e17] px-6 py-3">
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20"
            >
              Task Details
            </button>
            <Link
              to={`/projects/${projectId}/tasks/${taskId}/subtasks`}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-white"
            >
              <PiListChecks size={16} />
              Subtasks ({subtasks.length})
            </Link>
          </div>
        </div>

        {/* Task Header Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="rounded-lg border border-[#e8eef8]/10 bg-[#0a0e17] px-2.5 py-1 text-xs text-[#e8eef8]/50 font-mono">
                TASK-{task.id}
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {task.title}
              </h1>
              <p className="mt-2 text-sm text-[#e8eef8]/60 max-w-3xl">
                {task.description || "No description provided for this parent task."}
              </p>
            </div>

            {/* Status Selector */}
            <div className="shrink-0">
              <label className="block text-[11px] font-medium text-[#e8eef8]/50 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={updating}
                className="rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-3.5 py-2 text-xs font-semibold text-white outline-none cursor-pointer focus:border-blue-500"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#e8eef8]/5 pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                <PiFolder size={18} />
              </div>
              <div>
                <p className="text-xs text-[#e8eef8]/40">Project</p>
                <p className="text-sm font-medium text-white">{project?.name || `Project #${projectId}`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                <PiUserCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-[#e8eef8]/40">Assignee</p>
                <p className="text-sm font-medium text-white">{assigneeUser?.fullName || "Unassigned"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <PiClock size={18} />
              </div>
              <div>
                <p className="text-xs text-[#e8eef8]/40">Priority</p>
                <span className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${priorityColor[task.priority] || "text-gray-300"}`}>
                  {task.priority || "Medium"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                <PiCalendarBlank size={18} />
              </div>
              <div>
                <p className="text-xs text-[#e8eef8]/40">Due Date</p>
                <p className="text-sm font-medium text-white">{task.dueDate || "No deadline"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Subtask Preview Bar */}
        <div className="border-t border-[#e8eef8]/10 bg-[#0a0e17] px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-[#e8eef8]/60">
            {subtasks.length} subtask{subtasks.length === 1 ? "" : "s"} decomposed under this parent task
          </span>
          <Link
            to={`/projects/${projectId}/tasks/${taskId}/subtasks`}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            Open Subtask Management →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentTaskDetailsPage;
