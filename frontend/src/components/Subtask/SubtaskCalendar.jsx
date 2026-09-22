import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiClock,
  PiUserCircle,
  PiCheckCircle,
} from "react-icons/pi";
import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";
import { canRescheduleSubtask } from "../../utils/access.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityColor = {
  Critical: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Medium: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const SubtaskCalendar = () => {
  const { projectId, taskId, subtaskId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { can } = usePermission();

  const { getTaskById, getSubtasksByTaskId, updateSubtask } = useTasks();
  const { users } = useUsers();

  const parentTask = getTaskById(taskId);
  const subtasks = getSubtasksByTaskId(taskId);
  const currentSubtask = subtasks.find((s) => String(s.id) === String(subtaskId));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSubtask, setSelectedSubtask] = useState(currentSubtask || null);
  const [newDueDate, setNewDueDate] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  // Compute calendar grid days
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

  const getSubtasksForDay = (day) => {
    if (!day) return [];
    const formattedDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return subtasks.filter((s) => s.dueDate === formattedDay);
  };

  const canReschedule = canRescheduleSubtask(currentUser, selectedSubtask);

  const handleReschedule = async () => {
    if (!selectedSubtask || !newDueDate) return;
    await updateSubtask(taskId, {
      id: selectedSubtask.id,
      dueDate: newDueDate,
    });
    setNewDueDate("");
    setSelectedSubtask((prev) => ({ ...prev, dueDate: newDueDate }));
  };

  if (!parentTask) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-white">Task not found</h2>
        <button
          onClick={() => navigate("/tasks")}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-medium text-white"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/${subtaskId}`)}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#e8eef8]/50 hover:text-white transition"
      >
        <PiArrowLeft size={16} />
        Back to Sub Task Details
      </button>

      {/* Main Workspace Wrapper */}
      <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-xl overflow-hidden">
        {/* Workspace Header */}
        <div className="border-b border-[#e8eef8]/10 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-[#e8eef8]/10 bg-[#0a0e17] px-2.5 py-1 text-xs text-[#e8eef8]/50 font-mono">
              TASK-{parentTask.id}
            </span>
            <span className="text-xs text-[#e8eef8]/40">Subtask Schedule</span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {parentTask.title} • Calendar
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/50">
            Timeline schedule and deadlines for subtasks belonging to this parent work item.
          </p>
        </div>

        {/* Workspace Navbar per Section 11 & 13 */}
        <div className="border-b border-[#e8eef8]/10 bg-[#0a0e17] p-2">
          <div className="flex min-w-max gap-1">
            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/${subtaskId}`)}
              className="rounded-xl px-5 py-2 text-xs font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-white"
            >
              Sub Task Details
            </button>

            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/${subtaskId}/kanban`)}
              className="rounded-xl px-5 py-2 text-xs font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-white"
            >
              Kanban
            </button>

            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20"
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Calendar Body & Side Inspector */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {monthName} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-lg border border-[#e8eef8]/10 p-1.5 text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
                >
                  <PiCaretLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-lg border border-[#e8eef8]/10 p-1.5 text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-white"
                >
                  <PiCaretRight size={16} />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#e8eef8]/40 pb-2">
              {DAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-[#0a0e17]/30" />;
                }

                const daySubtasks = getSubtasksForDay(day);
                const isSelected =
                  selectedSubtask?.dueDate ===
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
                    <span className="text-[11px] font-semibold text-[#e8eef8]/60">{day}</span>

                    <div className="space-y-1 overflow-y-auto">
                      {daySubtasks.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSubtask(s)}
                          className={`w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                            priorityColor[s.priority] || "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Item Inspector & Reschedule Control */}
          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0a0e17] p-5">
            <h3 className="text-sm font-semibold text-white">Subtask Details</h3>
            <p className="text-xs text-[#e8eef8]/40 mt-0.5">Selected schedule event</p>

            {selectedSubtask ? (
              <div className="mt-5 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#e8eef8]/40">
                    SUBTASK-{selectedSubtask.id}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1">{selectedSubtask.title}</h4>
                  <p className="text-xs text-[#e8eef8]/60 mt-1">
                    {selectedSubtask.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#e8eef8]/10 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#e8eef8]/40">Status:</span>
                    <span className="font-medium text-white">{selectedSubtask.status || "To Do"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e8eef8]/40">Priority:</span>
                    <span className="font-medium text-white">{selectedSubtask.priority || "Medium"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#e8eef8]/40">Due Date:</span>
                    <span className="font-medium text-amber-400">{selectedSubtask.dueDate || "Not set"}</span>
                  </div>
                </div>

                {/* Reschedule control */}
                <div className="border-t border-[#e8eef8]/10 pt-4">
                  <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">
                    Reschedule Due Date
                  </label>
                  {canReschedule ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#070b14] px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
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
                      View-only schedule. Contact Team Lead to reschedule.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#e8eef8]/40">
                Click any scheduled subtask on the calendar to view details or reschedule.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskCalendar;