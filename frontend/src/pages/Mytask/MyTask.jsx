import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  PiBriefcase,
  PiUsersThree,
  PiCheckCircle,
  PiClockCountdown,
  PiKanban,
  PiCalendarBlank,
  PiArrowRight,
  PiCheckSquareOffset,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { ROLES, normalizeRole, formatRole } from "../../constants/roles.js";

const priorityColor = {
  Critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Medium: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const MyTask = () => {
  const { currentUser } = useAuth();
  const { tasks, subtasks = [], updateSubtask, updateTask } = useTasks();
  const { projects } = useProjects();
  const { teams } = useTeams();

  const role = normalizeRole(currentUser?.role);

  // Section 8: Admin is strictly excluded from My Work
  if (role === ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  // Active tab: 'my_work', 'team_work' (Team Lead only), or filter status
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Items assigned to current user
  const mySubtasks = useMemo(() => {
    return subtasks.filter(
      (s) => String(s.assigneeId) === String(currentUser?.id)
    );
  }, [subtasks, currentUser?.id]);

  const myParentTasks = useMemo(() => {
    return tasks.filter(
      (t) => String(t.assigneeId ?? t.assignee?.id) === String(currentUser?.id)
    );
  }, [tasks, currentUser?.id]);

  // Team Lead: My Team's Work tab
  const myTeam = teams.find((t) => String(t.leadId) === String(currentUser?.id)) || teams[0];
  const teamSubtasks = useMemo(() => {
    return subtasks.filter(
      (s) => String(s.teamId) === String(myTeam?.id)
    );
  }, [subtasks, myTeam?.id]);

  const now = new Date();

  // Status transition handler for my subtask
  const handleSubtaskStatusChange = async (subtask, newStatus) => {
    await updateSubtask(subtask.taskId, {
      ...subtask,
      status: newStatus,
    });
  };

  // Determine items to display based on active tab
  const displayedItems = useMemo(() => {
    if (activeTab === "team_work") {
      if (statusFilter === "ALL") return teamSubtasks;
      return teamSubtasks.filter((s) => s.status === statusFilter);
    }

    let items = mySubtasks;
    if (activeTab === "todo") {
      items = items.filter((s) => s.status === "To Do");
    } else if (activeTab === "in_progress") {
      items = items.filter((s) => s.status === "In Progress");
    } else if (activeTab === "done") {
      items = items.filter((s) => s.status === "Done");
    } else if (activeTab === "overdue") {
      items = items.filter((s) => s.dueDate && new Date(s.dueDate) < now && s.status !== "Done");
    } else if (activeTab === "review") {
      // Tester / QA review tab: Ready for Testing or In QA
      items = items.filter(
        (s) => s.status === "Ready for Testing" || s.status === "In Testing" || s.status === "In QA"
      );
    }

    return items;
  }, [activeTab, statusFilter, mySubtasks, teamSubtasks, now]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Personal Workbench • {formatRole(role)}
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            My Work Queue
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/60">
            All work items and deliverables assigned to you across projects.
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d131f] px-4 py-2 text-xs text-[#e8eef8]/60">
          Logged in as <span className="font-semibold text-white">{currentUser?.fullName}</span>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">My Subtasks</span>
          <p className="mt-2 text-2xl font-bold text-white">{mySubtasks.length}</p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">In Progress</span>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {mySubtasks.filter((s) => s.status === "In Progress").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">Completed</span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {mySubtasks.filter((s) => s.status === "Done").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">Overdue</span>
          <p className="mt-2 text-2xl font-bold text-rose-400">
            {
              mySubtasks.filter(
                (s) => s.dueDate && new Date(s.dueDate) < now && s.status !== "Done"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e8eef8]/10 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          All Items ({mySubtasks.length})
        </button>

        <button
          onClick={() => setActiveTab("todo")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "todo"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          To Do ({mySubtasks.filter((s) => s.status === "To Do").length})
        </button>

        <button
          onClick={() => setActiveTab("in_progress")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "in_progress"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          In Progress ({mySubtasks.filter((s) => s.status === "In Progress").length})
        </button>

        <button
          onClick={() => setActiveTab("done")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "done"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          Completed ({mySubtasks.filter((s) => s.status === "Done").length})
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "overdue"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400"
          }`}
        >
          Overdue (
          {
            mySubtasks.filter(
              (s) => s.dueDate && new Date(s.dueDate) < now && s.status !== "Done"
            ).length
          }
          )
        </button>

        {/* Tester & QA Review Tab */}
        {(role === ROLES.TESTER || role === ROLES.QA) && (
          <button
            onClick={() => setActiveTab("review")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "review"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
            }`}
          >
            Waiting for Review
          </button>
        )}

        {/* Team Lead: My Team's Work Tab */}
        {role === ROLES.TEAM_LEAD && (
          <button
            onClick={() => setActiveTab("team_work")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition border ${
              activeTab === "team_work"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <PiUsersThree size={16} className="inline mr-1.5" />
            My Team's Work ({teamSubtasks.length})
          </button>
        )}
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-xl">
        <div className="border-b border-[#e8eef8]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {activeTab === "team_work" ? "Team Deliverables" : "Assigned Subtasks"}
          </h2>
          <span className="text-xs text-[#e8eef8]/40">
            {displayedItems.length} item{displayedItems.length === 1 ? "" : "s"}
          </span>
        </div>

        {displayedItems.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#e8eef8]/40">
            No work items found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e17] border-b border-[#e8eef8]/5 text-left text-xs font-medium text-[#e8eef8]/50">
                <tr>
                  <th className="px-6 py-3.5">Subtask</th>
                  <th className="px-6 py-3.5">Parent Task & Project</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Quick Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eef8]/5 text-sm">
                {displayedItems.map((subtask) => {
                  const parentTask = tasks.find((t) => String(t.id) === String(subtask.taskId));
                  const project = projects.find(
                    (p) => String(p.id) === String(parentTask?.projectId)
                  );
                  const isOverdue =
                    subtask.dueDate &&
                    new Date(subtask.dueDate) < now &&
                    subtask.status !== "Done";

                  return (
                    <tr key={subtask.id} className="transition hover:bg-[#181f2f]/40">
                      {/* Subtask Title */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">{subtask.title}</span>
                        {subtask.description && (
                          <p className="text-xs text-[#e8eef8]/40 truncate max-w-sm mt-0.5">
                            {subtask.description}
                          </p>
                        )}
                      </td>

                      {/* Parent Task & Project */}
                      <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                        <p className="font-medium text-white">{parentTask?.title || `Task #${subtask.taskId}`}</p>
                        <p className="text-[#e8eef8]/40 mt-0.5">{project?.name || "Project"}</p>
                      </td>

                      {/* Status Selector */}
                      <td className="px-6 py-4">
                        <select
                          value={subtask.status || "To Do"}
                          onChange={(e) => handleSubtaskStatusChange(subtask, e.target.value)}
                          className="rounded-lg border border-[#e8eef8]/15 bg-[#0a0e17] px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-blue-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Ready for Testing">Ready for Testing</option>
                          <option value="In Testing">In Testing</option>
                          <option value="In QA">In QA</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>

                      {/* Priority Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            priorityColor[subtask.priority] || "border-gray-500/30 text-gray-300"
                          }`}
                        >
                          {subtask.priority || "Medium"}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-xs">
                        <span className={isOverdue ? "text-rose-400 font-semibold" : "text-[#e8eef8]/60"}>
                          {subtask.dueDate || "No deadline"}
                        </span>
                      </td>

                      {/* Quick Links */}
                      <td className="px-6 py-4 text-right">
                        {parentTask?.projectId ? (
                          <div className="inline-flex items-center gap-2">
                            <Link
                              to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${subtask.id}`}
                              title="Subtask Details"
                              className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                            >
                              <PiBriefcase size={16} />
                            </Link>

                            <Link
                              to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${subtask.id}/kanban`}
                              title="Subtask Kanban"
                              className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                            >
                              <PiKanban size={16} />
                            </Link>

                            <Link
                              to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${subtask.id}/calendar`}
                              title="Subtask Calendar"
                              className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                            >
                              <PiCalendarBlank size={16} />
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-[#e8eef8]/30">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTask;
