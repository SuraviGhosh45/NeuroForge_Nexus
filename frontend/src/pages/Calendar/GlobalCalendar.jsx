import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiFunnel,
  PiFolder,
  PiCheckSquareOffset,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";
import { normalizeRole, ROLES } from "../../constants/roles.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityColor = {
  Critical: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Medium: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const GlobalCalendar = () => {
  const { currentUser } = useAuth();
  const { can } = usePermission();
  const { projects, getVisibleProjects } = useProjects();
  const { tasks, subtasks = [], getVisibleSubtasks, updateSubtask } = useTasks();
  const { teams } = useTeams();
  const { users } = useUsers();
  const { projectTeams } = useProjectTeam();

  const role = normalizeRole(currentUser?.role);

  // Scoped datasets
  const visibleProjects = getVisibleProjects(currentUser, projectTeams, teams);
  const visibleSubtasks = getVisibleSubtasks(currentUser, projectTeams, teams, projects);

  // Filters state
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("ALL");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Filtered subtasks based on active filters
  const filteredEvents = useMemo(() => {
    return visibleSubtasks.filter((s) => {
      if (!s.dueDate) return false;

      const parentTask = tasks.find((t) => String(t.id) === String(s.taskId));
      const projId = parentTask?.projectId;

      if (selectedProjectId !== "ALL" && String(projId) !== String(selectedProjectId)) {
        return false;
      }
      if (selectedTeamId !== "ALL" && String(s.teamId) !== String(selectedTeamId)) {
        return false;
      }
      if (selectedUserId !== "ALL" && String(s.assigneeId) !== String(selectedUserId)) {
        return false;
      }
      return true;
    });
  }, [visibleSubtasks, tasks, selectedProjectId, selectedTeamId, selectedUserId]);

  // Calendar days calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      daysArray.push(d);
    }
    return daysArray;
  }, [year, month]);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredEvents.filter((e) => e.dueDate === dateStr);
  };

  const canReschedule = can("subtask:reschedule");

  const handleReschedule = async () => {
    if (!selectedEvent || !newDueDate) return;
    await updateSubtask(selectedEvent.taskId, {
      id: selectedEvent.id,
      dueDate: newDueDate,
    });
    setSelectedEvent((prev) => ({ ...prev, dueDate: newDueDate }));
    setNewDueDate("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Scheduling & Timeline
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            SDLC Master Calendar
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/60">
            Track due dates, sprint milestones, and delivery deadlines across your visible scope.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project filter (Admin, PM, PL, TL) */}
          {role !== ROLES.DEVELOPER && role !== ROLES.TESTER && role !== ROLES.QA && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-xl border border-[#e8eef8]/15 bg-[#0d131f] px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Projects</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Team filter (Admin, PM, PL) */}
          {[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD].includes(role) && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="rounded-xl border border-[#e8eef8]/15 bg-[#0d131f] px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {/* Member filter (Admin, PM, PL, TL) */}
          {[ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD].includes(role) && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="rounded-xl border border-[#e8eef8]/15 bg-[#0d131f] px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {monthName} {year}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="rounded-lg border border-[#e8eef8]/10 p-2 text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white transition"
              >
                <PiCaretLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="rounded-lg border border-[#e8eef8]/10 p-2 text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white transition"
              >
                <PiCaretRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#e8eef8]/40 pb-3">
            {DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-24 rounded-xl bg-[#0a0e17]/40" />;
              }

              const events = getEventsForDay(day);
              const isSelected =
                selectedEvent?.dueDate ===
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              return (
                <div
                  key={`day-${day}`}
                  className={`h-24 rounded-xl border p-1.5 transition flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-[#e8eef8]/5 bg-[#0a0e17] hover:border-[#e8eef8]/20"
                  }`}
                >
                  <span className="text-xs font-semibold text-[#e8eef8]/60">{day}</span>
                  <div className="space-y-1 overflow-y-auto">
                    {events.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                          priorityColor[e.priority] || "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Details & Direct Links */}
        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white">Event Details</h3>
            <p className="text-xs text-[#e8eef8]/40 mt-0.5">Subtask deliverable overview</p>
          </div>

          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-[#e8eef8]/40">
                  SUBTASK-{selectedEvent.id}
                </span>
                <h4 className="text-sm font-semibold text-white mt-1">{selectedEvent.title}</h4>
                <p className="text-xs text-[#e8eef8]/60 mt-1">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-2 border-t border-[#e8eef8]/10 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#e8eef8]/40">Status:</span>
                  <span className="font-medium text-white">{selectedEvent.status || "To Do"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e8eef8]/40">Priority:</span>
                  <span className="font-medium text-white">{selectedEvent.priority || "Medium"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e8eef8]/40">Deadline:</span>
                  <span className="font-medium text-amber-400">{selectedEvent.dueDate}</span>
                </div>
              </div>

              {/* Navigation link to item */}
              {(() => {
                const parentTask = tasks.find((t) => String(t.id) === String(selectedEvent.taskId));
                if (!parentTask?.projectId) return null;
                return (
                  <Link
                    to={`/projects/${parentTask.projectId}/tasks/${parentTask.id}/${selectedEvent.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
                  >
                    Open Subtask Workspace →
                  </Link>
                );
              })()}

              {/* Rescheduling Control */}
              <div className="border-t border-[#e8eef8]/10 pt-4">
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">
                  Reschedule Deadline
                </label>
                {canReschedule ? (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleReschedule}
                      disabled={!newDueDate}
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-blue-500"
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#e8eef8]/40 italic">
                    View-only schedule per role scope. Contact your Team Lead to reschedule.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-[#e8eef8]/40">
              Select any event on the calendar to inspect deliverable details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalCalendar;
