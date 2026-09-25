import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  PiBriefcase,
  PiUsersThree,
  PiKanban,
  PiCalendarBlank,
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
  const {
    tasks,
    subtasks = [],
    updateSubtask,
    updateTask,
  } = useTasks();

  const { projects } = useProjects();
  const { teams } = useTeams();

  const role = normalizeRole(currentUser?.role);

  if (role === ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /*
   * Parent tasks assigned to the logged-in user.
   * These come from the backend /api/tasks endpoint.
   */
  const myParentTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        String(
          task.assigneeId ?? task.assignee?.id
        ) === String(currentUser?.id)
    );
  }, [tasks, currentUser?.id]);

  /*
   * Subtasks assigned to the logged-in user.
   */
  const mySubtasks = useMemo(() => {
    return subtasks.filter(
      (subtask) =>
        String(subtask.assigneeId) ===
        String(currentUser?.id)
    );
  }, [subtasks, currentUser?.id]);

  /*
   * Team Lead: My Team's Work tab.
   */
  const myTeam =
    teams.find(
      (team) =>
        String(team.leadId) ===
        String(currentUser?.id)
    ) || teams[0];

  const teamSubtasks = useMemo(() => {
    return subtasks.filter(
      (subtask) =>
        String(subtask.teamId) ===
        String(myTeam?.id)
    );
  }, [subtasks, myTeam?.id]);

  const now = new Date();

  /*
   * Parent task status update.
   */
  const handleParentTaskStatusChange = async (
    task,
    newStatus
  ) => {
    const res = await updateTask({
      ...task,
      status: newStatus,
    });
    if (res && !res.success) {
      alert(res.message || "Failed to update status");
    }
  };

  /*
   * Subtask status update.
   */
  const handleSubtaskStatusChange = async (
    subtask,
    newStatus
  ) => {
    const res = await updateSubtask(subtask.taskId, {
      ...subtask,
      status: newStatus,
    });
    if (res && !res.success) {
      alert(res.message || "Failed to update status");
    }
  };

  /*
   * Status helper with full normalization to match select options.
   */
  const getStatus = (item) => {
    if (!item) return "To Do";
    const raw = (item.status || item.boardStatus || "To Do").trim();
    const upper = raw.toUpperCase().replace(/\s+/g, "_");
    if (upper === "TODO" || upper === "TO_DO") return "To Do";
    if (upper === "IN_PROGRESS") return "In Progress";
    if (upper === "IN_REVIEW") return "In Review";
    if (upper === "READY_FOR_TESTING") return "Ready for Testing";
    if (upper === "IN_TESTING") return "In Testing";
    if (upper === "IN_QA") return "In QA";
    if (upper === "DONE" || upper === "COMPLETED") return "Done";
    return raw;
  };

  /*
   * All parent tasks + assigned subtasks.
   *
   * Parent tasks are displayed first.
   */
  const allMyItems = useMemo(() => {
    const parentItems = myParentTasks.map(
      (task) => ({
        ...task,
        itemType: "task",
        itemId: task.id,
        itemStatus: getStatus(task),
      })
    );

    const subtaskItems = mySubtasks.map(
      (subtask) => ({
        ...subtask,
        itemType: "subtask",
        itemId: subtask.id,
        itemStatus: getStatus(subtask),
      })
    );

    return [
      ...parentItems,
      ...subtaskItems,
    ];
  }, [myParentTasks, mySubtasks]);

  const teamWorkItems = useMemo(() => {
    return teamSubtasks.map((subtask) => ({
      ...subtask,
      itemType: "subtask",
      itemId: subtask.id,
      itemStatus: getStatus(subtask),
    }));
  }, [teamSubtasks]);

  /*
   * Filter displayed work items.
   */
  const displayedItems = useMemo(() => {
    if (activeTab === "team_work") {
      if (statusFilter === "ALL") {
        return teamWorkItems;
      }

      return teamWorkItems.filter(
        (subtask) =>
          getStatus(subtask) === statusFilter
      );
    }

    let items = allMyItems;

    if (activeTab === "todo") {
      items = items.filter(
        (item) =>
          getStatus(item) === "To Do"
      );
    } else if (activeTab === "in_progress") {
      items = items.filter(
        (item) =>
          getStatus(item) === "In Progress"
      );
    } else if (activeTab === "done") {
      items = items.filter(
        (item) =>
          getStatus(item) === "Done"
      );
    } else if (activeTab === "overdue") {
      items = items.filter(
        (item) =>
          item.dueDate &&
          new Date(item.dueDate) < now &&
          getStatus(item) !== "Done"
      );
    } else if (activeTab === "review") {
      items = items.filter(
        (item) =>
          getStatus(item) === "In Review" ||
          getStatus(item) === "Ready for Testing" ||
          getStatus(item) === "In Testing" ||
          getStatus(item) === "In QA"
      );
    }

    return items;
  }, [
    activeTab,
    statusFilter,
    allMyItems,
    teamWorkItems,
    now,
  ]);

  const todoCount = allMyItems.filter(
    (item) =>
      getStatus(item) === "To Do"
  ).length;

  const inProgressCount = allMyItems.filter(
    (item) =>
      getStatus(item) === "In Progress"
  ).length;

  const completedCount = allMyItems.filter(
    (item) =>
      getStatus(item) === "Done"
  ).length;

  const overdueCount = allMyItems.filter(
    (item) =>
      item.dueDate &&
      new Date(item.dueDate) < now &&
      getStatus(item) !== "Done"
  ).length;

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
          Logged in as{" "}
          <span className="font-semibold text-white">
            {currentUser?.fullName}
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">
            My Tasks
          </span>

          <p className="mt-2 text-2xl font-bold text-white">
            {allMyItems.length}
          </p>

          <p className="mt-1 text-xs text-[#e8eef8]/40">
            {myParentTasks.length} tasks •{" "}
            {mySubtasks.length} subtasks
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">
            In Progress
          </span>

          <p className="mt-2 text-2xl font-bold text-blue-400">
            {inProgressCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">
            Completed
          </span>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">
            Overdue
          </span>

          <p className="mt-2 text-2xl font-bold text-rose-400">
            {overdueCount}
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
          All Items ({allMyItems.length})
        </button>

        <button
          onClick={() => setActiveTab("todo")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "todo"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          To Do ({todoCount})
        </button>

        <button
          onClick={() => setActiveTab("in_progress")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "in_progress"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          In Progress ({inProgressCount})
        </button>

        <button
          onClick={() => setActiveTab("done")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "done"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
          }`}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setActiveTab("overdue")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "overdue"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
              : "text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400"
          }`}
        >
          Overdue ({overdueCount})
        </button>

        {/* Tester / QA */}
        {(role === ROLES.TESTER ||
          role === ROLES.QA) && (
          <button
            onClick={() =>
              setActiveTab("review")
            }
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "review"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
            }`}
          >
            Waiting for Review
          </button>
        )}

        {/* Team Lead */}
        {role === ROLES.TEAM_LEAD && (
          <button
            onClick={() =>
              setActiveTab("team_work")
            }
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition border ${
              activeTab === "team_work"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <PiUsersThree
              size={16}
              className="inline mr-1.5"
            />
            My Team's Work ({teamSubtasks.length})
          </button>
        )}

      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-xl">

        <div className="border-b border-[#e8eef8]/10 px-6 py-4 flex items-center justify-between">

          <h2 className="text-base font-semibold text-white">
            {activeTab === "team_work"
              ? "Team Deliverables"
              : "My Work Items"}
          </h2>

          <span className="text-xs text-[#e8eef8]/40">
            {displayedItems.length} item
            {displayedItems.length === 1
              ? ""
              : "s"}
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
                  <th className="px-6 py-3.5">
                    Work Item
                  </th>

                  <th className="px-6 py-3.5">
                    Parent Task & Project
                  </th>

                  <th className="px-6 py-3.5">
                    Status
                  </th>

                  <th className="px-6 py-3.5">
                    Priority
                  </th>

                  <th className="px-6 py-3.5">
                    Due Date
                  </th>

                  <th className="px-6 py-3.5 text-right">
                    Quick Links
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-[#e8eef8]/5 text-sm">

                {displayedItems.map((item) => {

                  const isParentTask =
                    item.itemType === "task";

                  const parentTask = isParentTask
                    ? item
                    : tasks.find(
                        (task) =>
                          String(task.id) ===
                          String(item.taskId)
                      );

                  const project =
                    projects.find(
                      (project) =>
                        String(project.id) ===
                        String(
                          parentTask?.projectId
                        )
                    );

                  const itemStatus =
                    getStatus(item);

                  const isOverdue =
                    item.dueDate &&
                    new Date(item.dueDate) <
                      now &&
                    itemStatus !== "Done";

                  return (
                    <tr
                      key={`${item.itemType}-${item.id}`}
                      className="transition hover:bg-[#181f2f]/40"
                    >

                      {/* Work Item */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          {isParentTask ? (
                            <PiBriefcase
                              size={17}
                              className="text-blue-400"
                            />
                          ) : (
                            <span className="text-xs text-amber-400">
                              SUB
                            </span>
                          )}

                          <span className="font-medium text-white">
                            {item.title}
                          </span>

                        </div>

                        {item.description && (
                          <p className="text-xs text-[#e8eef8]/40 truncate max-w-sm mt-0.5">
                            {item.description}
                          </p>
                        )}

                      </td>

                      {/* Parent Task & Project */}
                      <td className="px-6 py-4 text-xs text-[#e8eef8]/70">

                        <p className="font-medium text-white">
                          {isParentTask
                            ? "Parent Task"
                            : parentTask?.title ||
                              `Task #${item.taskId}`}
                        </p>

                        <p className="text-[#e8eef8]/40 mt-0.5">
                          {project?.name ||
                            item.project?.name ||
                            "Project"}
                        </p>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        <select
                          value={
                            itemStatus ||
                            "To Do"
                          }
                          onChange={(e) => {

                            const newStatus =
                              e.target.value;

                            if (
                              isParentTask
                            ) {
                              handleParentTaskStatusChange(
                                item,
                                newStatus
                              );
                            } else {
                              handleSubtaskStatusChange(
                                item,
                                newStatus
                              );
                            }

                          }}
                          className="rounded-lg border border-[#e8eef8]/15 bg-[#0a0e17] px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-blue-500"
                        >

                          <option value="To Do">
                            To Do
                          </option>

                          <option value="In Progress">
                            In Progress
                          </option>

                          <option value="In Review">
                            In Review
                          </option>

                          <option value="Ready for Testing">
                            Ready for Testing
                          </option>

                          <option value="In Testing">
                            In Testing
                          </option>

                          <option value="In QA">
                            In QA
                          </option>

                          <option value="Done">
                            Done
                          </option>

                        </select>

                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            priorityColor[
                              item.priority
                            ] ||
                            "border-gray-500/30 text-gray-300"
                          }`}
                        >
                          {item.priority ||
                            "Medium"}
                        </span>

                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-xs">

                        <span
                          className={
                            isOverdue
                              ? "text-rose-400 font-semibold"
                              : "text-[#e8eef8]/60"
                          }
                        >
                          {item.dueDate ||
                            "No deadline"}
                        </span>

                      </td>

                      {/* Quick Links */}
                      <td className="px-6 py-4 text-right">

                        {parentTask?.projectId ? (
                          <div className="inline-flex items-center gap-2">

                            {isParentTask ? (
                              <Link
                                to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}`}
                                title="Task Details"
                                className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                              >
                                <PiBriefcase
                                  size={16}
                                />
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${item.id}`}
                                  title="Subtask Details"
                                  className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                                >
                                  <PiBriefcase
                                    size={16}
                                  />
                                </Link>

                                <Link
                                  to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${item.id}/kanban`}
                                  title="Subtask Kanban"
                                  className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                                >
                                  <PiKanban
                                    size={16}
                                  />
                                </Link>

                                <Link
                                  to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${item.id}/calendar`}
                                  title="Subtask Calendar"
                                  className="rounded-lg p-1.5 text-[#e8eef8]/60 hover:bg-blue-500/10 hover:text-blue-400 transition"
                                >
                                  <PiCalendarBlank
                                    size={16}
                                  />
                                </Link>
                              </>
                            )}

                          </div>
                        ) : (
                          <span className="text-xs text-[#e8eef8]/30">
                            -
                          </span>
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