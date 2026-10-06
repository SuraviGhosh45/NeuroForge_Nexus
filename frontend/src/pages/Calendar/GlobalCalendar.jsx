import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiFunnel,
  PiFolder,
  PiPlus,
  PiTrash,
  PiX,
} from "react-icons/pi";

import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import axios from "../../services/api.js";

const API = "http://localhost:8080/api/calendar";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const TYPES = ["DEADLINE", "MILESTONE", "MEETING", "REMINDER", "RELEASE", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES = ["PENDING", "COMPLETED", "CANCELLED"];

const pad2 = (value) => String(value).padStart(2, "0");
const toISO = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  const displayDate = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return value.length > 10 && !value.endsWith("T00:00:00")
    ? `${displayDate}, ${date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
    : displayDate;
};

const formatDisplayTime = (eventDate) => {
  if (!eventDate || eventDate.endsWith("T00:00:00")) return "All day";
  const date = new Date(eventDate);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const titleForType = (type) =>
  String(type || "OTHER").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeEvent = (event) => ({
  ...event,
  calendarTitle: event.title || "Calendar Event",
  calendarType: event.source === "SYSTEM" ? "system" : "custom",
});

const GlobalCalendar = () => {
  const { currentUser } = useAuth();
  const { projects = [] } = useProjects();
  const { tasks = [] } = useTasks();
  const { users = [] } = useUsers();
  const { teams = [] } = useTeams();
  const { projectTeams = [] } = useProjectTeam();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("ALL");
  const [events, setEvents] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventDate, setNewEventDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    type: "DEADLINE",
    priority: "MEDIUM",
    projectId: "",
    taskId: "",
    subtaskId: "",
    sprintId: "",
    assignedTo: "",
  });

  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API);
      setEvents(Array.isArray(response.data) ? response.data.map(normalizeEvent) : []);
    } catch (err) {
      console.error("Calendar load failed", err);
      setError(err?.response?.data?.message || "Unable to load calendar events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) loadEvents();
  }, [currentUser?.id]);

  useEffect(() => {
    let active = true;
    if (!form.projectId) {
      setSprints([]);
      return () => { active = false; };
    }
    axios
      .get(`http://localhost:8080/api/sprints/projects/${form.projectId}/sprints`)
      .then((response) => {
        if (active) setSprints(Array.isArray(response.data) ? response.data : response.data?.content || []);
      })
      .catch(() => { if (active) setSprints([]); });
    return () => { active = false; };
  }, [form.projectId]);

  const visibleProjects = useMemo(() => projects, [projects]);

  const projectTasks = useMemo(() => {
    if (!form.projectId) return tasks;
    return tasks.filter((task) => String(task.projectId) === String(form.projectId));
  }, [tasks, form.projectId]);

  const selectedTask = useMemo(
    () => tasks.find((task) => String(task.id) === String(form.taskId)),
    [tasks, form.taskId]
  );

  const projectSubtasks = useMemo(() => {
    if (!selectedTask || !Array.isArray(selectedTask.subtasks)) return [];
    return selectedTask.subtasks;
  }, [selectedTask]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedProjectId !== "ALL" && String(event.projectId) !== String(selectedProjectId)) return false;
      if (selectedUserId !== "ALL" && event.assignedTo != null && String(event.assignedTo) !== String(selectedUserId)) return false;
      if (selectedUserId !== "ALL" && event.assignedTo == null && event.createdBy != null && String(event.createdBy) !== String(selectedUserId)) return false;

      if (selectedTeamId !== "ALL") {
        if (event.assignedTo == null) return false;
        const belongsToTeam = projectTeams.some(
          (item) => String(item.userId ?? item.memberId ?? item.employeeId) === String(event.assignedTo) && String(item.teamId) === String(selectedTeamId)
        );
        if (!belongsToTeam) return false;
      }

      return true;
    });
  }, [events, selectedProjectId, selectedTeamId, selectedUserId, projectTeams]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      cells.push({ date: new Date(year, month, i - firstDay.getDay() + 1), currentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ date: new Date(year, month, day), currentMonth: true });
    }
    while (cells.length < 42) {
      const date = new Date(year, month, cells.length - firstDay.getDay() - daysInMonth + 1);
      cells.push({ date, currentMonth: false });
    }
    return cells;
  }, [currentDate]);

  const getEventsForDay = (day) => {
    const date = toISO(day);
    return filteredEvents.filter((event) => event.eventDate?.slice(0, 10) === date);
  };

  const projectName = (projectId) => {
    if (projectId == null) return "";
    const project = projects.find((item) => String(item.id) === String(projectId));
    return project?.name || project?.title || project?.projectName || `Project ${projectId}`;
  };

  const userName = (userId) => {
    const user = users.find((item) => String(item.id) === String(userId));
    return user?.fullName || user?.name || user?.email || `User ${userId}`;
  };

  const taskName = (taskId) => {
    const task = tasks.find((item) => String(item.id) === String(taskId));
    return task?.title || task?.name || `Task ${taskId}`;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setNewEventDate((event.eventDate || "").slice(0, 16));
  };

  const handleReschedule = async () => {
    if (!selectedEvent?.id || selectedEvent.source === "SYSTEM" || !selectedEvent.editable || !newEventDate) return;
    setSaving(true);
    try {
      await axios.patch(`${API}/${selectedEvent.id}/date`, { eventDate: newEventDate });
      await loadEvents();
      setSelectedEvent((prev) => (prev ? { ...prev, eventDate: newEventDate } : prev));
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to reschedule this event.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (status) => {
    if (!selectedEvent?.id || selectedEvent.source === "SYSTEM" || !selectedEvent.editable) return;
    setSaving(true);
    try {
      await axios.patch(`${API}/${selectedEvent.id}/status`, { status });
      await loadEvents();
      setSelectedEvent((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to update event status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id || selectedEvent.source === "SYSTEM" || !selectedEvent.editable) return;
    if (!window.confirm("Delete this calendar event?")) return;
    setSaving(true);
    try {
      await axios.delete(`${API}/${selectedEvent.id}`);
      setSelectedEvent(null);
      await loadEvents();
    } catch (err) {
      alert(err?.response?.data?.message || "Unable to delete this event.");
    } finally {
      setSaving(false);
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await axios.post(API, {
        title: form.title,
        description: form.description || null,
        eventDate: form.eventDate,
        type: form.type,
        priority: form.priority,
        projectId: form.projectId ? Number(form.projectId) : null,
        taskId: form.taskId ? Number(form.taskId) : null,
        subtaskId: form.subtaskId ? Number(form.subtaskId) : null,
        sprintId: form.sprintId ? Number(form.sprintId) : null,
        assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      });
      setShowCreate(false);
      setForm({ title: "", description: "", eventDate: "", type: "DEADLINE", priority: "MEDIUM", projectId: "", taskId: "", sprintId: "", subtaskId: "", assignedTo: "" });
      await loadEvents();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create this calendar event.");
    } finally {
      setSaving(false);
    }
  };

  const todayISO = toISO(new Date());

  return (
    <div className="min-h-full space-y-6 bg-transparent p-4 text-[#172033] dark:text-slate-100 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400">
            <PiCalendarBlank size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#172033] dark:text-white">SDLC Master Calendar</h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-slate-400">Deadlines, milestones, meetings, releases and reminders.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110">
            <PiPlus size={18} /> Create Event
          </button>
          <button type="button" onClick={() => setCurrentDate(new Date())} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#475569] shadow-sm dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-300">
            Today
          </button>
        </div>
      </div>

      {(error || loading) && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>
          {error || "Loading calendar..."}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><PiFunnel size={18} className="text-[#2563EB]" /> Filters</div>
        <div className="grid gap-3 md:grid-cols-3">
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#1e293b]">
            <option value="ALL">All Projects</option>
            {visibleProjects.map((project) => <option key={project.id} value={project.id}>{project.name || project.title || `Project ${project.id}`}</option>)}
          </select>
          <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#1e293b]">
            <option value="ALL">All Teams</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name || team.teamName || `Team ${team.id}`}</option>)}
          </select>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#1e293b]">
            <option value="ALL">All Users</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.fullName || user.name || user.email || `User ${user.id}`}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <button type="button" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><PiCaretLeft size={20} /></button>
          <h2 className="text-lg font-semibold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button type="button" onClick={() => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><PiCaretRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
          {DAYS.map((day) => <div key={day} className="border-r border-slate-200 px-2 py-3 text-center text-xs font-semibold uppercase text-slate-600 last:border-r-0 dark:border-slate-700 dark:text-slate-300">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, currentMonth }, index) => {
            const dateISO = toISO(date);
            const dayEvents = getEventsForDay(date);
            const isToday = dateISO === todayISO;
            return (
              <div key={`${dateISO}-${index}`} className={`min-h-[120px] border-b border-r border-slate-200 p-2 dark:border-slate-800 ${currentMonth ? "bg-white dark:bg-[#0f172a]" : "bg-slate-50/70 dark:bg-slate-900/40"}`}>
                <div className={`mb-1 text-xs font-semibold ${isToday ? "inline-flex rounded-full bg-blue-600 px-2 py-1 text-white" : currentMonth ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>{date.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 4).map((event) => (
                    <button key={`${event.source}-${event.id ?? `${event.type}-${event.title}`}`} type="button" onClick={() => handleEventClick(event)} className={`w-full rounded-lg border px-2 py-1 text-left ${event.source === "SYSTEM" ? "border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300" : "border-amber-100 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"}`}>
                      <div className="line-clamp-2 text-[11px] font-semibold">{event.calendarTitle}</div>
                      <div className="mt-0.5 text-[9px] uppercase opacity-70">{titleForType(event.type)}</div>
                    </button>
                  ))}
                  {dayEvents.length > 4 && <div className="px-1 text-[10px] font-medium text-slate-500">+{dayEvents.length - 4} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 p-4 backdrop-blur-sm">
          <form onSubmit={submitCreate} className="w-full max-w-2xl space-y-4 rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create Calendar Event</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><PiX size={20} /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <input required type="datetime-local" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">{TYPES.map((type) => <option key={type}>{type}</option>)}</select>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select>
              <select value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value, taskId: "", sprintId: "", subtaskId: "", assignedTo: "" }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Personal Event</option>{visibleProjects.map((project) => <option key={project.id} value={project.id}>{project.name || project.title || `Project ${project.id}`}</option>)}</select>
              <select value={form.taskId} onChange={(e) => setForm((f) => ({ ...f, taskId: e.target.value, subtaskId: "" }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Related Task (optional)</option>{projectTasks.map((task) => <option key={task.id} value={task.id}>{task.title || task.name}</option>)}</select>
              <select value={form.sprintId} onChange={(e) => setForm((f) => ({ ...f, sprintId: e.target.value }))} disabled={!form.projectId} className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"><option value="">Related Sprint (optional)</option>{sprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name || `Sprint ${sprint.id}`}</option>)}</select>
              <select value={form.subtaskId} onChange={(e) => setForm((f) => ({ ...f, subtaskId: e.target.value }))} disabled={!form.taskId} className="rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"><option value="">Related Subtask (optional)</option>{projectSubtasks.map((subtask) => <option key={subtask.id} value={subtask.id}>{subtask.title || subtask.name}</option>)}</select>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="">Assignee (optional)</option>{users.map((user) => <option key={user.id} value={user.id}>{user.fullName || user.name || user.email}</option>)}</select>
            </div>
            <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button><button disabled={saving} type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Create Event"}</button></div>
          </form>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div><h3 className="font-semibold">{selectedEvent.calendarTitle}</h3><p className="mt-1 text-xs text-slate-500">{selectedEvent.source === "SYSTEM" ? "System deadline" : "Calendar event"}</p></div>
              <button type="button" onClick={() => setSelectedEvent(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><PiX size={20} /></button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Date</p><p className="mt-1 text-sm font-semibold">{formatDisplayDate(selectedEvent.eventDate)}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Type</p><p className="mt-1 text-sm font-semibold">{titleForType(selectedEvent.type)}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Time</p><p className="mt-1 text-sm font-semibold">{formatDisplayTime(selectedEvent.eventDate)}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Priority</p><p className="mt-1 text-sm font-semibold">{selectedEvent.priority}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 text-sm font-semibold">{selectedEvent.overdue ? "Overdue" : titleForType(selectedEvent.status)}</p></div>
              </div>
              {selectedEvent.description && <div><p className="text-xs uppercase tracking-wide text-slate-500">Description</p><p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{selectedEvent.description}</p></div>}
              {selectedEvent.projectId != null && <div className="flex items-center gap-2 text-xs text-slate-500"><PiFolder size={15} />{projectName(selectedEvent.projectId)}</div>}
              {selectedEvent.taskId != null && <p className="text-sm text-slate-600 dark:text-slate-300">Task: {taskName(selectedEvent.taskId)}</p>}
              {selectedEvent.assignedTo != null && <p className="text-sm text-slate-600 dark:text-slate-300">Assigned to: {userName(selectedEvent.assignedTo)}</p>}
              {selectedEvent.taskId != null && selectedEvent.projectId != null && <Link to={`/projects/${selectedEvent.projectId}/tasks/${selectedEvent.taskId}`} className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">Open Task</Link>}

              {selectedEvent.source !== "SYSTEM" && selectedEvent.editable === true && (
                <>
                  <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                    <label className="text-xs uppercase tracking-wide text-slate-500">Reschedule</label>
                    <div className="mt-2 flex gap-2"><input type="datetime-local" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" /><button disabled={saving} type="button" onClick={handleReschedule} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save</button></div>
                  </div>
                  <div className="flex flex-wrap gap-2"><select value={selectedEvent.status || "PENDING"} onChange={(e) => handleStatus(e.target.value)} disabled={saving} className="rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select><button type="button" disabled={saving} onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"><PiTrash size={16} /> Delete</button></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalCalendar;
