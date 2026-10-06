import { useState, useMemo, useEffect } from "react";
import {
  PiCalendarBlank,
  PiCalendar,
  PiCaretLeft,
  PiCaretRight,
  PiFunnel,
  PiFolder,
  PiCheckSquareOffset,
  PiX,
  PiWarningCircle,
  PiDownloadSimple,
  PiListBullets,
  PiFlag,
  PiCheckCircle,
  PiClock,
} from "react-icons/pi";

import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";
import { normalizeRole, ROLES } from "../../constants/roles.js";

const CHATBOT_EVENTS_KEY = "nfn_calendar_events_";

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad2 = (value) => String(value).padStart(2, "0");

const toISO = (date) => {
  return `${date.getFullYear()}-${pad2(
    date.getMonth() + 1
  )}-${pad2(date.getDate())}`;
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getChatbotEvents = (userId) => {
  try {
    const raw = localStorage.getItem(
      CHATBOT_EVENTS_KEY + (userId ?? "guest")
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const isItemOverdue = (dueDate, status, boardStatus, todayISO = toISO(new Date())) => {
  if (!dueDate) return false;
  const cleanStatus = (status || boardStatus || "").toUpperCase().replace(/\s+/g, "_");
  if (cleanStatus === "DONE" || cleanStatus === "COMPLETED") return false;
  return dueDate < todayISO;
};

const GlobalCalendar = () => {
  const { currentUser } = useAuth();

  const { projects = [] } = useProjects();
  const { tasks = [], updateSubtask, updateTask } = useTasks();
  const { teams = [] } = useTeams();
  const { users = [] } = useUsers();
  const { projectTeams = [] } = useProjectTeam();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month" | "week" | "agenda"

  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("ALL");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Drag and drop state
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [chatbotEvents, setChatbotEvents] = useState(
    () => getChatbotEvents(currentUser?.id)
  );

  useEffect(() => {
    const reloadEvents = () => {
      setChatbotEvents(
        getChatbotEvents(currentUser?.id)
      );
    };

    reloadEvents();

    window.addEventListener(
      "nfn-calendar-events-updated",
      reloadEvents
    );

    window.addEventListener(
      "storage",
      reloadEvents
    );

    return () => {
      window.removeEventListener(
        "nfn-calendar-events-updated",
        reloadEvents
      );

      window.removeEventListener(
        "storage",
        reloadEvents
      );
    };
  }, [currentUser?.id]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];

    try {
      const role = normalizeRole(currentUser.role);

      if (
        role === ROLES.ADMIN ||
        role === ROLES.PROJECT_MANAGER
      ) {
        return projects;
      }

      const userId = String(currentUser.id);

      const assignedProjectIds = new Set(
        projectTeams
          .filter(
            (pt) =>
              String(
                pt.userId ??
                  pt.memberId ??
                  pt.employeeId
              ) === userId
          )
          .map((pt) => String(pt.projectId))
      );

      if (assignedProjectIds.size === 0) {
        return projects;
      }

      return projects.filter((project) =>
        assignedProjectIds.has(
          String(project.id)
        )
      );
    } catch {
      return projects;
    }
  }, [
    currentUser,
    projects,
    projectTeams,
  ]);

  const visibleSubtasks = useMemo(() => {
    if (!currentUser) return [];

    const visibleProjectIds = new Set(
      visibleProjects.map((project) =>
        String(project.id)
      )
    );

    const allSubtasks = tasks.flatMap((task) => {
      const subtasks = Array.isArray(task.subtasks)
        ? task.subtasks
        : [];

      return subtasks.map((subtask) => ({
        ...subtask,
        taskId: task.id,
        projectId: task.projectId,
        parentTask: task,
      }));
    });

    return allSubtasks.filter((subtask) => {
      if (!subtask.dueDate) return false;

      if (
        visibleProjectIds.size > 0 &&
        subtask.projectId != null &&
        !visibleProjectIds.has(
          String(subtask.projectId)
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    currentUser,
    tasks,
    visibleProjects,
  ]);

  const todayISO = toISO(new Date());

  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];

    const visibleProjectIds = new Set(
      visibleProjects.map((project) => String(project.id))
    );

    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      if (
        visibleProjectIds.size > 0 &&
        task.projectId != null &&
        !visibleProjectIds.has(String(task.projectId))
      ) {
        return false;
      }

      return true;
    });
  }, [currentUser, tasks, visibleProjects]);

  const filteredEvents = useMemo(() => {
    // 1. Parent tasks with due dates
    const taskEvents = visibleTasks.filter((task) => {
      if (
        selectedProjectId !== "ALL" &&
        task.projectId != null &&
        String(task.projectId) !== String(selectedProjectId)
      ) {
        return false;
      }

      if (
        selectedUserId !== "ALL" &&
        String(task.assigneeId ?? task.assignee?.id) !== String(selectedUserId)
      ) {
        return false;
      }

      return true;
    });

    const normalizedTaskEvents = taskEvents.map((task) => {
      const titleLower = String(task.title || "").toLowerCase();
      const isMilestone =
        task.priority === "Critical" ||
        titleLower.includes("release") ||
        titleLower.includes("milestone") ||
        titleLower.includes("sprint");

      return {
        ...task,
        calendarType: "task",
        calendarTitle: task.title || "Task Deadline",
        isMilestone,
        isOverdue: isItemOverdue(task.dueDate, task.status, task.boardStatus),
      };
    });

    // 2. Subtasks
    const subtaskEvents =
      visibleSubtasks.filter((subtask) => {
        const parentTask = tasks.find(
          (task) =>
            String(task.id) ===
            String(subtask.taskId)
        );

        const projId =
          subtask.projectId ??
          parentTask?.projectId;

        if (
          selectedProjectId !== "ALL" &&
          String(projId) !==
            String(selectedProjectId)
        ) {
          return false;
        }

        if (
          selectedTeamId !== "ALL" &&
          String(subtask.teamId) !==
            String(selectedTeamId)
        ) {
          return false;
        }

        if (
          selectedUserId !== "ALL" &&
          String(subtask.assigneeId) !==
            String(selectedUserId)
        ) {
          return false;
        }

        return true;
      });

    const normalizedSubtaskEvents =
      subtaskEvents.map((subtask) => ({
        ...subtask,
        calendarType: "subtask",
        calendarTitle:
          subtask.title ||
          subtask.name ||
          "Subtask",
        isOverdue: isItemOverdue(subtask.dueDate, subtask.status, subtask.boardStatus),
      }));

    // 3. Chatbot events, meetings, and overdue alerts
    const normalizedChatbotEvents =
      chatbotEvents
        .filter((event) => {
          if (!event?.dueDate) return false;

          if (
            selectedProjectId !== "ALL" &&
            event.projectId != null &&
            String(event.projectId) !==
              String(selectedProjectId)
          ) {
            return false;
          }

          if (
            selectedTeamId !== "ALL" &&
            event.teamId != null &&
            String(event.teamId) !==
              String(selectedTeamId)
          ) {
            return false;
          }

          if (
            selectedUserId !== "ALL" &&
            event.assigneeId != null &&
            String(event.assigneeId) !==
              String(selectedUserId)
          ) {
            return false;
          }

          return true;
        })
        .map((event) => {
          const isOverdue =
            event.isOverdueAlert ||
            (!event.isMeeting &&
              event.type !== "meeting" &&
              isItemOverdue(event.dueDate, event.status, null));

          return {
            ...event,
            calendarType: "chatbot",
            calendarTitle:
              event.title ||
              event.label ||
              "Calendar Event",
            isOverdue,
          };
        });

    const all = [
      ...normalizedTaskEvents,
      ...normalizedSubtaskEvents,
      ...normalizedChatbotEvents,
    ];

    if (showOverdueOnly) {
      return all.filter((ev) => ev.isOverdue);
    }

    return all;
  }, [
    visibleTasks,
    visibleSubtasks,
    tasks,
    chatbotEvents,
    selectedProjectId,
    selectedTeamId,
    selectedUserId,
    showOverdueOnly,
  ]);

  // Workload Collision Detector: detects team members with >= 3 deliverables on same date
  const workloadCollisionsByDate = useMemo(() => {
    const map = {};

    filteredEvents.forEach((ev) => {
      if (!ev.dueDate) return;
      const dateKey = ev.dueDate;
      const rawAssignee = ev.assigneeId ?? ev.assignee?.id;
      if (!rawAssignee) return;

      const userKey = String(rawAssignee);
      if (!map[dateKey]) map[dateKey] = {};
      if (!map[dateKey][userKey]) {
        const u = users.find((usr) => String(usr.id) === userKey);
        const name = u?.fullName || u?.name || u?.email || `User #${userKey}`;
        map[dateKey][userKey] = {
          userId: userKey,
          userName: name,
          items: [],
        };
      }
      map[dateKey][userKey].items.push(ev);
    });

    const result = {};
    Object.entries(map).forEach(([dateKey, userMap]) => {
      const collisions = Object.values(userMap).filter(
        (u) => u.items.length >= 3
      );
      if (collisions.length > 0) {
        result[dateKey] = collisions;
      }
    });

    return result;
  }, [filteredEvents, users]);

  // Month grid cells
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells = [];

    for (let i = 0; i < startDay; i++) {
      const date = new Date(
        year,
        month,
        i - startDay + 1
      );

      cells.push({
        date,
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push({
        date: new Date(
          year,
          month,
          day
        ),
        currentMonth: true,
      });
    }

    while (cells.length < 42) {
      const day =
        cells.length -
        startDay -
        daysInMonth +
        1;

      cells.push({
        date: new Date(
          year,
          month + 1,
          day
        ),
        currentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  // Week view columns (current 7 days)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Agenda view grouped items
  const agendaItemsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((ev) => {
      if (!ev.dueDate) return;
      if (!map[ev.dueDate]) map[ev.dueDate] = [];
      map[ev.dueDate].push(ev);
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateString, events]) => ({
        dateString,
        date: new Date(`${dateString}T00:00:00`),
        events,
      }));
  }, [filteredEvents]);

  const getEventsForDay = (day) => {
    const dateString = toISO(day);

    return filteredEvents.filter(
      (event) =>
        event.dueDate === dateString
    );
  };

  // Navigation handlers
  const goToPrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    } else if (viewMode === "week") {
      setCurrentDate(
        (prev) => {
          const d = new Date(prev);
          d.setDate(d.getDate() - 7);
          return d;
        }
      );
    } else {
      // Agenda: jump back 1 week
      setCurrentDate(
        (prev) => {
          const d = new Date(prev);
          d.setDate(d.getDate() - 7);
          return d;
        }
      );
    }
  };

  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
      );
    } else if (viewMode === "week") {
      setCurrentDate(
        (prev) => {
          const d = new Date(prev);
          d.setDate(d.getDate() + 7);
          return d;
        }
      );
    } else {
      // Agenda: jump forward 1 week
      setCurrentDate(
        (prev) => {
          const d = new Date(prev);
          d.setDate(d.getDate() + 7);
          return d;
        }
      );
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setNewDueDate(event.dueDate || "");
  };

  // Drag and Drop rescheduling
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.setData("application/json", JSON.stringify(event));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, dateString) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDate !== dateString) {
      setDragOverDate(dateString);
    }
  };

  const handleDragLeave = (dateString) => {
    if (dragOverDate === dateString) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e, targetDateISO) => {
    e.preventDefault();
    setDragOverDate(null);

    let event = draggedEvent;
    if (!event) {
      try {
        const raw = e.dataTransfer.getData("application/json");
        if (raw) event = JSON.parse(raw);
      } catch {
        // fallback
      }
    }

    if (!event || !targetDateISO || event.dueDate === targetDateISO) {
      return;
    }

    // Execute reschedule
    if (event.calendarType === "task") {
      if (typeof updateTask === "function") {
        updateTask(event.id, { dueDate: targetDateISO });
        showToast(
          `✅ Rescheduled "${event.calendarTitle || "Task"}" to ${formatDisplayDate(targetDateISO)}`
        );
      }
    } else if (event.calendarType === "subtask") {
      if (typeof updateSubtask === "function") {
        updateSubtask(event.taskId, { id: event.id, dueDate: targetDateISO });
        showToast(
          `✅ Rescheduled "${event.calendarTitle || "Subtask"}" to ${formatDisplayDate(targetDateISO)}`
        );
      }
    } else if (event.calendarType === "chatbot") {
      const userId = currentUser?.id ?? "guest";
      const existing = getChatbotEvents(userId);
      const updated = existing.map((ev) =>
        String(ev.id) === String(event.id)
          ? { ...ev, dueDate: targetDateISO }
          : ev
      );
      localStorage.setItem(CHATBOT_EVENTS_KEY + userId, JSON.stringify(updated));
      setChatbotEvents(updated);
      window.dispatchEvent(new Event("nfn-calendar-events-updated"));
      showToast(
        `✅ Rescheduled "${event.calendarTitle || "Event"}" to ${formatDisplayDate(targetDateISO)}`
      );
    }

    setDraggedEvent(null);
  };

  // Modal Reschedule Action
  const handleReschedule = () => {
    if (!selectedEvent || !newDueDate) {
      return;
    }

    if (selectedEvent.calendarType === "chatbot") {
      try {
        const userId = currentUser?.id ?? "guest";
        const existingEvents = getChatbotEvents(userId);

        const updatedEvents = existingEvents.map((event) =>
          String(event.id) === String(selectedEvent.id)
            ? { ...event, dueDate: newDueDate }
            : event
        );

        localStorage.setItem(
          CHATBOT_EVENTS_KEY + userId,
          JSON.stringify(updatedEvents)
        );

        setChatbotEvents(updatedEvents);
        window.dispatchEvent(new Event("nfn-calendar-events-updated"));

        setSelectedEvent({
          ...selectedEvent,
          dueDate: newDueDate,
        });

        showToast(
          `✅ Rescheduled to ${formatDisplayDate(newDueDate)}`
        );
        return;
      } catch {
        return;
      }
    }

    if (selectedEvent.calendarType === "task") {
      if (typeof updateTask === "function") {
        updateTask(selectedEvent.id, {
          dueDate: newDueDate,
        });

        setSelectedEvent({
          ...selectedEvent,
          dueDate: newDueDate,
        });

        showToast(
          `✅ Rescheduled task to ${formatDisplayDate(newDueDate)}`
        );
      }
      return;
    }

    if (typeof updateSubtask === "function") {
      updateSubtask(selectedEvent.taskId, {
        id: selectedEvent.id,
        dueDate: newDueDate,
      });

      setSelectedEvent({
        ...selectedEvent,
        dueDate: newDueDate,
      });

      showToast(
        `✅ Rescheduled subtask to ${formatDisplayDate(newDueDate)}`
      );
    }
  };

  // Export Schedule to .ics (Google Calendar, Apple, Outlook)
  const handleExportICS = () => {
    if (!filteredEvents.length) {
      showToast("No scheduled deliverables to export.");
      return;
    }

    const formatICSDate = (dateStr) => {
      return dateStr.replace(/-/g, "");
    };

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NeuroForge Nexus//SDLC Master Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:NeuroForge SDLC Schedule",
      "X-WR-TIMEZONE:UTC",
    ];

    filteredEvents.forEach((ev) => {
      if (!ev.dueDate) return;
      const dateRaw = formatICSDate(ev.dueDate);
      const uid = `nfn-${ev.calendarType || "event"}-${ev.id || Math.random()}@neuroforge.io`;
      const summary = ev.calendarTitle || ev.title || "SDLC Deliverable";
      const desc = `Category: ${ev.calendarType || "Task"}\\nStatus: ${ev.status || "Open"}\\nPriority: ${ev.priority || "Normal"}`;

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dateRaw}T090000Z`,
        `DTSTART;VALUE=DATE:${dateRaw}`,
        `SUMMARY:${summary.replace(/,/g, "\\,").replace(/;/g, "\\;")}`,
        `DESCRIPTION:${desc}`,
        `STATUS:${ev.status === "Done" ? "COMPLETED" : "CONFIRMED"}`,
        "END:VEVENT"
      );
    });

    icsLines.push("END:VCALENDAR");

    const blob = new Blob([icsLines.join("\r\n")], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `neuroforge-sdlc-schedule-${todayISO}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("📅 Downloaded neuroforge-sdlc-schedule.ics for Google Calendar & Outlook!");
  };

  const projectName = (projectId) => {
    if (projectId == null) return "";

    const project = projects.find(
      (item) =>
        String(item.id) ===
        String(projectId)
    );

    return (
      project?.name ||
      project?.title ||
      project?.projectName ||
      ""
    );
  };

  const teamName = (teamId) => {
    if (teamId == null) return "";

    const team = teams.find(
      (item) =>
        String(item.id) ===
        String(teamId)
    );

    return (
      team?.name ||
      team?.teamName ||
      ""
    );
  };

  const userName = (userId) => {
    if (userId == null) return "";

    const user = users.find(
      (item) =>
        String(item.id) ===
        String(userId)
    );

    return (
      user?.fullName ||
      user?.name ||
      user?.email ||
      ""
    );
  };

  // Event category helper for styling & icons
  const getEventCategoryMeta = (event) => {
    if (event.isOverdue) {
      return {
        category: "overdue",
        label: "Overdue",
        style:
          "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-200 ring-1 ring-rose-400/30",
        badge: "bg-rose-600 text-white",
        icon: PiWarningCircle,
        iconColor: "text-rose-600 dark:text-rose-400",
      };
    }
    if (event.type === "meeting" || event.isMeeting) {
      return {
        category: "meeting",
        label: "Meeting",
        style:
          "border-amber-200 bg-amber-50/90 text-amber-800 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
        badge: "bg-amber-500 text-white",
        icon: PiCalendarBlank,
        iconColor: "text-amber-600 dark:text-amber-400",
      };
    }
    if (event.isMilestone) {
      return {
        category: "milestone",
        label: "Milestone",
        style:
          "border-emerald-200 bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
        badge: "bg-emerald-600 text-white",
        icon: PiFlag,
        iconColor: "text-emerald-600 dark:text-emerald-400",
      };
    }
    if (event.calendarType === "subtask") {
      return {
        category: "subtask",
        label: "Subtask",
        style:
          "border-purple-200 bg-purple-50/90 text-purple-800 hover:bg-purple-100 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300",
        badge: "bg-purple-600 text-white",
        icon: PiCheckSquareOffset,
        iconColor: "text-purple-600 dark:text-purple-400",
      };
    }
    return {
      category: "task",
      label: "Parent Task",
      style:
        "border-blue-200 bg-blue-50/90 text-blue-800 hover:bg-blue-100 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300",
      badge: "bg-blue-600 text-white",
      icon: PiFolder,
      iconColor: "text-blue-600 dark:text-blue-400",
    };
  };

  // Header display string
  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === "week") {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${MONTHS[first.getMonth()].slice(0, 3)} ${first.getDate()} – ${
        first.getMonth() !== last.getMonth()
          ? `${MONTHS[last.getMonth()].slice(0, 3)} `
          : ""
      }${last.getDate()}, ${last.getFullYear()}`;
    }
    return `Agenda • ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="min-h-full bg-transparent space-y-5 p-4 text-[#172033] dark:text-slate-100 sm:p-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-white dark:text-slate-900 shadow-2xl animate-fade-in">
          <PiCheckCircle size={18} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400 shadow-xs">
              <PiCalendarBlank size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                SDLC Master Calendar
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Multi-view scheduling, drag-and-drop delivery tracking, and team workload alerts.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "month"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <PiCalendarBlank size={14} />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "week"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <PiCalendar size={14} />
              <span>Week</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("agenda")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "agenda"
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <PiListBullets size={14} />
              <span>Agenda</span>
            </button>
          </div>

          {/* Export Schedule to .ics */}
          <button
            type="button"
            onClick={handleExportICS}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
            title="Export schedule to .ics for Google Calendar, Outlook, Apple Calendar"
          >
            <PiDownloadSimple size={15} />
            <span className="hidden sm:inline">Export Schedule (.ics)</span>
            <span className="sm:hidden">.ics</span>
          </button>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Color-Coded Legends */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f172a] space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <PiFunnel size={18} className="text-blue-600 dark:text-blue-400" />
            Filters & Scope
          </div>

          <button
            type="button"
            onClick={() => setShowOverdueOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              showOverdueOnly
                ? "border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300 ring-2 ring-rose-500/20"
                : "border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50/50 dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30"
            }`}
          >
            <PiWarningCircle
              size={15}
              className={showOverdueOnly ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}
            />
            <span>{showOverdueOnly ? "Showing Overdue Only" : "Filter Overdue Tasks"}</span>
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="ALL">All Projects</option>
            {visibleProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || project.title || project.projectName || `Project ${project.id}`}
              </option>
            ))}
          </select>

          <select
            value={selectedTeamId}
            onChange={(event) => setSelectedTeamId(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="ALL">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name || team.teamName || `Team ${team.id}`}
              </option>
            ))}
          </select>

          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="ALL">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.name || user.email || `User ${user.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Color-Coded Event Category Legends */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
            Category Legend:
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            🔵 Parent Tasks
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 font-medium text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            🟣 Subtasks
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            🟢 Milestones / Releases
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            🟠 Meetings
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-0.5 font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            🔴 Overdue
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300 ml-auto">
            <PiWarningCircle size={13} className="text-amber-600" />
            ⚠️ Collision: &ge;3 tasks/person
          </span>
        </div>
      </div>

      {/* Main Calendar Display Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={goToPrevious}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Previous period"
          >
            <PiCaretLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {getHeaderTitle()}
            </h2>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5">
              {filteredEvents.length} items
            </span>
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Next period"
          >
            <PiCaretRight size={20} />
          </button>
        </div>

        {/* ============================================================ */}
        {/* VIEW A: MONTH GRID VIEW */}
        {/* ============================================================ */}
        {viewMode === "month" && (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="border-r border-slate-200 dark:border-slate-700/60 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, currentMonth }, index) => {
                const dateISO = toISO(date);
                const dayEvents = getEventsForDay(date);
                const isToday = dateISO === todayISO;
                const isDragOver = dragOverDate === dateISO;
                const collisions = workloadCollisionsByDate[dateISO];

                return (
                  <div
                    key={`${dateISO}-${index}`}
                    onDragOver={(e) => handleDragOver(e, dateISO)}
                    onDragLeave={() => handleDragLeave(dateISO)}
                    onDrop={(e) => handleDrop(e, dateISO)}
                    className={`min-h-[135px] border-r border-b border-slate-200 p-2 last:border-r-0 dark:border-slate-800 transition-colors ${
                      isDragOver
                        ? "bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/50 inset-0 z-10"
                        : currentMonth
                        ? "bg-white dark:bg-[#0f172a]"
                        : "bg-slate-50/70 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-blue-600 text-white shadow-xs"
                            : currentMonth
                            ? "text-slate-700 dark:text-slate-200"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {date.getDate()}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Workload Crunch Indicator */}
                        {collisions && collisions.length > 0 && (
                          <span
                            title={`⚠️ Workload Crunch: ${collisions
                              .map((c) => `${c.userName}: ${c.items.length} tasks`)
                              .join("; ")}`}
                            className="flex items-center gap-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:text-amber-300"
                          >
                            <PiWarningCircle size={10} className="text-amber-600" />
                            {collisions.reduce((acc, c) => acc + c.items.length, 0)}
                          </span>
                        )}

                        {dayEvents.length > 0 && (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 4).map((event) => {
                        const meta = getEventCategoryMeta(event);
                        const IconComponent = meta.icon;

                        return (
                          <button
                            key={`${event.calendarType}-${event.id}`}
                            type="button"
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                            onClick={() => handleEventClick(event)}
                            className={`w-full rounded-lg border px-2 py-1 text-left transition cursor-grab active:cursor-grabbing ${meta.style}`}
                            title={`Drag to reschedule • Click for details (${meta.label})`}
                          >
                            <div className="flex items-start gap-1.5">
                              <IconComponent
                                size={12}
                                className={`mt-0.5 shrink-0 ${meta.iconColor}`}
                              />

                              <span className="line-clamp-2 text-[11px] font-semibold leading-tight">
                                {event.isOverdue && (
                                  <span className="text-[9px] uppercase tracking-wider font-bold mr-1 text-rose-600 dark:text-rose-400">
                                    [Overdue]
                                  </span>
                                )}
                                {event.time && (
                                  <span className="text-[10px] font-medium mr-1 opacity-85">
                                    {event.time}
                                  </span>
                                )}
                                {event.calendarTitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {dayEvents.length > 4 && (
                        <div className="px-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          +{dayEvents.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW B: WEEK VIEW (7 Stacked Day Columns) */}
        {/* ============================================================ */}
        {viewMode === "week" && (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              {weekDays.map((date) => {
                const dateISO = toISO(date);
                const isToday = dateISO === todayISO;
                const collisions = workloadCollisionsByDate[dateISO];

                return (
                  <div
                    key={dateISO}
                    className="border-r border-slate-200 dark:border-slate-700/60 px-3 py-3 text-center last:border-r-0"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {DAYS[date.getDay()]}
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          isToday
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-800 dark:text-white"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    {collisions && (
                      <div className="mt-1 flex justify-center">
                        <span
                          title={`Workload Collision: ${collisions
                            .map((c) => `${c.userName}: ${c.items.length}`)
                            .join(", ")}`}
                          className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300"
                        >
                          <PiWarningCircle size={10} />
                          Crunch ({collisions.reduce((acc, c) => acc + c.items.length, 0)})
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 min-h-[460px]">
              {weekDays.map((date) => {
                const dateISO = toISO(date);
                const dayEvents = getEventsForDay(date);
                const isDragOver = dragOverDate === dateISO;

                return (
                  <div
                    key={dateISO}
                    onDragOver={(e) => handleDragOver(e, dateISO)}
                    onDragLeave={() => handleDragLeave(dateISO)}
                    onDrop={(e) => handleDrop(e, dateISO)}
                    className={`border-r border-slate-200 dark:border-slate-800 p-2.5 last:border-r-0 transition-colors space-y-2 ${
                      isDragOver
                        ? "bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/50"
                        : "bg-white dark:bg-[#0f172a]"
                    }`}
                  >
                    {dayEvents.length === 0 ? (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-2 text-center text-[11px] text-slate-400">
                        Drop deliverables here
                      </div>
                    ) : (
                      dayEvents.map((event) => {
                        const meta = getEventCategoryMeta(event);
                        const IconComponent = meta.icon;
                        const pName = projectName(event.projectId);

                        return (
                          <div
                            key={`${event.calendarType}-${event.id}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                            onClick={() => handleEventClick(event)}
                            className={`rounded-xl border p-2.5 text-left transition cursor-grab active:cursor-grabbing shadow-2xs ${meta.style}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider opacity-85">
                                <IconComponent size={12} className={meta.iconColor} />
                                {meta.label}
                              </span>

                              {event.priority && (
                                <span className="text-[9px] font-bold uppercase rounded px-1 py-0.2 bg-black/5 dark:bg-white/10">
                                  {event.priority}
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1 text-xs font-bold leading-snug">
                              {event.calendarTitle}
                            </h4>

                            {event.time && (
                              <p className="mt-1 text-[11px] font-medium flex items-center gap-1 text-amber-800 dark:text-amber-200">
                                <PiClock size={12} />
                                {event.time}
                              </p>
                            )}

                            {pName && (
                              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                📁 {pName}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW C: AGENDA / TIMELINE VIEW */}
        {/* ============================================================ */}
        {viewMode === "agenda" && (
          <div className="p-4 sm:p-6 space-y-6">
            {agendaItemsByDate.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                <PiCalendarBlank size={36} className="mx-auto mb-2 opacity-60" />
                No scheduled deliverables match the current filters.
              </div>
            ) : (
              agendaItemsByDate.map(({ dateString, date, events }) => {
                const isToday = dateString === todayISO;
                const collisions = workloadCollisionsByDate[dateString];

                return (
                  <div key={dateString} className="space-y-3">
                    {/* Sticky Date Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isToday
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {date.toLocaleDateString("en-IN", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h3>
                        {isToday && (
                          <span className="rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-400/30 px-2 py-0.5 text-[10px] font-bold">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {collisions && (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <PiWarningCircle size={12} />
                            Crunch Alert ({collisions.reduce((acc, c) => acc + c.items.length, 0)} items)
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {events.length} deliverable(s)
                        </span>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {events.map((event) => {
                        const meta = getEventCategoryMeta(event);
                        const IconComponent = meta.icon;
                        const pName = projectName(event.projectId);
                        const aName = userName(event.assigneeId ?? event.assignee?.id);

                        return (
                          <div
                            key={`${event.calendarType}-${event.id}`}
                            onClick={() => handleEventClick(event)}
                            className={`rounded-xl border p-3 text-left transition hover:shadow-sm cursor-pointer ${meta.style}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="inline-flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
                                <IconComponent size={13} className={meta.iconColor} />
                                {meta.label}
                              </span>

                              {event.priority && (
                                <span className="text-[9px] font-bold uppercase rounded px-1.5 py-0.5 bg-black/5 dark:bg-white/10">
                                  {event.priority}
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1.5 text-xs font-bold leading-snug">
                              {event.calendarTitle}
                            </h4>

                            {event.time && (
                              <p className="mt-1 text-[11px] font-medium flex items-center gap-1">
                                <PiClock size={13} />
                                {event.time}
                              </p>
                            )}

                            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-black/5 dark:border-white/5 pt-2">
                              <span>📁 {pName || "Workspace"}</span>
                              {aName && <span>👤 {aName}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Event Details & Rescheduling Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/60">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEvent.calendarTitle ||
                    selectedEvent.title ||
                    selectedEvent.name ||
                    "Calendar Deliverable"}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      getEventCategoryMeta(selectedEvent).badge
                    }`}
                  />
                  {getEventCategoryMeta(selectedEvent).label}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <PiX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Overdue Warning */}
              {selectedEvent.isOverdue && (
                <div className="flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                  <PiWarningCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="font-bold text-rose-700 dark:text-rose-300">Overdue Deadline</p>
                    <p className="mt-0.5 font-normal text-rose-600 dark:text-rose-400">
                      The scheduled deadline was {formatDisplayDate(selectedEvent.dueDate)}. You can update or drag-and-drop to reschedule.
                    </p>
                  </div>
                </div>
              )}

              {/* Meeting Time */}
              {selectedEvent.time && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/60 dark:bg-amber-950/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Meeting Time
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-950 dark:text-amber-100">
                    🕒 {selectedEvent.time}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Scheduled Due Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDisplayDate(selectedEvent.dueDate)}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Description
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                {projectName(selectedEvent.projectId) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Project
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-900 dark:text-white truncate">
                      {projectName(selectedEvent.projectId)}
                    </p>
                  </div>
                )}

                {teamName(selectedEvent.teamId) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Team
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-900 dark:text-white truncate">
                      {teamName(selectedEvent.teamId)}
                    </p>
                  </div>
                )}

                {userName(selectedEvent.assigneeId ?? selectedEvent.assignee?.id) && (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Assignee
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-900 dark:text-white truncate">
                      {userName(selectedEvent.assigneeId ?? selectedEvent.assignee?.id)}
                    </p>
                  </div>
                )}
              </div>

              {/* Reschedule Date Picker */}
              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Reschedule Deliverable
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(event) => setNewDueDate(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={handleReschedule}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:brightness-110"
                  >
                    Save Date
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalCalendar;
