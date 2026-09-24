import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiFunnel,
  PiFolder,
  PiCheckSquareOffset,
  PiX,
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
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
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

const GlobalCalendar = () => {
  const { currentUser } = useAuth();

  const { projects = [] } = useProjects();
  const { tasks = [], updateSubtask } = useTasks();
  const { teams = [] } = useTeams();
  const { users = [] } = useUsers();
  const { projectTeams = [] } = useProjectTeam();

  const { can } = usePermission();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState("ALL");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [chatbotEvents, setChatbotEvents] = useState(() =>
    getChatbotEvents(currentUser?.id)
  );

  /*
   * Reload chatbot events when:
   * 1. Calendar opens
   * 2. Chatbot creates a new event in the same browser tab
   * 3. Another browser tab changes localStorage
   */
  useEffect(() => {
    const reloadEvents = () => {
      setChatbotEvents(getChatbotEvents(currentUser?.id));
    };

    reloadEvents();

    window.addEventListener(
      "nfn-calendar-events-updated",
      reloadEvents
    );

    window.addEventListener("storage", reloadEvents);

    return () => {
      window.removeEventListener(
        "nfn-calendar-events-updated",
        reloadEvents
      );

      window.removeEventListener("storage", reloadEvents);
    };
  }, [currentUser?.id]);

  /*
   * Visible projects according to the existing application permissions.
   */
  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];

    try {
      const role = normalizeRole(currentUser.role);

      /*
       * Admin/project-manager users can normally see all projects.
       * For other roles, projectTeams/teams are used where available.
       */
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
              String(pt.userId ?? pt.memberId ?? pt.employeeId) ===
              userId
          )
          .map((pt) =>
            String(pt.projectId)
          )
      );

      if (assignedProjectIds.size === 0) {
        return projects;
      }

      return projects.filter((project) =>
        assignedProjectIds.has(String(project.id))
      );
    } catch {
      return projects;
    }
  }, [
    currentUser,
    projects,
    projectTeams,
  ]);

  /*
   * Subtasks which already belong to the application's calendar.
   */
  const visibleSubtasks = useMemo(() => {
    if (!currentUser) return [];

    const visibleProjectIds = new Set(
      visibleProjects.map((project) => String(project.id))
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
        !visibleProjectIds.has(String(subtask.projectId))
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

  /*
   * Existing subtask calendar events + chatbot events.
   */
  const filteredEvents = useMemo(() => {
    const subtaskEvents = visibleSubtasks.filter((subtask) => {
      const parentTask = tasks.find(
        (task) =>
          String(task.id) === String(subtask.taskId)
      );

      const projId =
        subtask.projectId ?? parentTask?.projectId;

      if (
        selectedProjectId !== "ALL" &&
        String(projId) !== String(selectedProjectId)
      ) {
        return false;
      }

      if (
        selectedTeamId !== "ALL" &&
        String(subtask.teamId) !== String(selectedTeamId)
      ) {
        return false;
      }

      if (
        selectedUserId !== "ALL" &&
        String(subtask.assigneeId) !== String(selectedUserId)
      ) {
        return false;
      }

      return true;
    });

    const normalizedSubtaskEvents = subtaskEvents.map(
      (subtask) => ({
        ...subtask,
        calendarType: "subtask",
        calendarTitle:
          subtask.title ||
          subtask.name ||
          "Subtask",
      })
    );

    const normalizedChatbotEvents = chatbotEvents
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
      .map((event) => ({
        ...event,
        calendarType: "chatbot",
        calendarTitle:
          event.title ||
          event.label ||
          "Calendar Event",
      }));

    return [
      ...normalizedSubtaskEvents,
      ...normalizedChatbotEvents,
    ];
  }, [
    visibleSubtasks,
    tasks,
    chatbotEvents,
    selectedProjectId,
    selectedTeamId,
    selectedUserId,
  ]);

  /*
   * Calendar month information.
   */
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells = [];

    /*
     * Previous month padding.
     */
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

    /*
     * Current month.
     */
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    /*
     * Next month padding.
     */
    while (cells.length < 42) {
      const day = cells.length - startDay - daysInMonth + 1;

      cells.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  const getEventsForDay = (day) => {
    const dateString = toISO(day);

    return filteredEvents.filter(
      (event) => event.dueDate === dateString
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);

    setNewDueDate(event.dueDate || "");
  };

  const handleReschedule = () => {
    if (!selectedEvent || !newDueDate) return;

    /*
     * Chatbot events are stored directly in localStorage.
     */
    if (selectedEvent.calendarType === "chatbot") {
      try {
        const userId = currentUser?.id ?? "guest";

        const existingEvents = getChatbotEvents(userId);

        const updatedEvents = existingEvents.map(
          (event) =>
            String(event.id) ===
            String(selectedEvent.id)
              ? {
                  ...event,
                  dueDate: newDueDate,
                }
              : event
        );

        localStorage.setItem(
          CHATBOT_EVENTS_KEY + userId,
          JSON.stringify(updatedEvents)
        );

        setChatbotEvents(updatedEvents);

        window.dispatchEvent(
          new Event("nfn-calendar-events-updated")
        );

        setSelectedEvent({
          ...selectedEvent,
          dueDate: newDueDate,
        });

        return;
      } catch {
        return;
      }
    }

    /*
     * Existing subtask events continue using the application's
     * TasksContext update function.
     */
    if (typeof updateSubtask === "function") {
      updateSubtask(selectedEvent.taskId, {
        id: selectedEvent.id,
        dueDate: newDueDate,
      });

      setSelectedEvent({
        ...selectedEvent,
        dueDate: newDueDate,
      });
    }
  };

  const projectName = (projectId) => {
    if (projectId == null) return "";

    const project = projects.find(
      (item) =>
        String(item.id) === String(projectId)
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
        String(item.id) === String(teamId)
    );

    return team?.name || team?.teamName || "";
  };

  const userName = (userId) => {
    if (userId == null) return "";

    const user = users.find(
      (item) =>
        String(item.id) === String(userId)
    );

    return (
      user?.fullName ||
      user?.name ||
      user?.email ||
      ""
    );
  };

  const todayISO = toISO(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <PiCalendarBlank size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-white">
                SDLC Master Calendar
              </h1>

              <p className="mt-1 text-sm text-white/50">
                Track subtasks, milestones, delivery deadlines
                and calendar events.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Today
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-white/10 bg-[#0d1320] p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
          <PiFunnel size={18} />
          Filters
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {/* Project */}
          <select
            value={selectedProjectId}
            onChange={(event) =>
              setSelectedProjectId(event.target.value)
            }
            className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="ALL">
              All Projects
            </option>

            {visibleProjects.map((project) => (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name ||
                  project.title ||
                  project.projectName ||
                  `Project ${project.id}`}
              </option>
            ))}
          </select>

          {/* Team */}
          <select
            value={selectedTeamId}
            onChange={(event) =>
              setSelectedTeamId(event.target.value)
            }
            className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="ALL">
              All Teams
            </option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name ||
                  team.teamName ||
                  `Team ${team.id}`}
              </option>
            ))}
          </select>

          {/* User */}
          <select
            value={selectedUserId}
            onChange={(event) =>
              setSelectedUserId(event.target.value)
            }
            className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          >
            <option value="ALL">
              All Users
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.fullName ||
                  user.name ||
                  user.email ||
                  `User ${user.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1320]">
        {/* Month navigation */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
            aria-label="Previous month"
          >
            <PiCaretLeft size={20} />
          </button>

          <h2 className="text-lg font-semibold text-white">
            {MONTHS[currentDate.getMonth()]}{" "}
            {currentDate.getFullYear()}
          </h2>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
            aria-label="Next month"
          >
            <PiCaretRight size={20} />
          </button>
        </div>

        {/* Day headings */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-r border-white/5 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white/40 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map(
            ({ date, currentMonth }, index) => {
              const dateISO = toISO(date);
              const dayEvents =
                getEventsForDay(date);

              const isToday =
                dateISO === todayISO;

              return (
                <div
                  key={`${dateISO}-${index}`}
                  className={`min-h-[125px] border-r border-b border-white/5 p-2 last:border-r-0 ${
                    currentMonth
                      ? "bg-[#0d1320]"
                      : "bg-[#0a0f19]/60"
                  }`}
                >
                  {/* Date number */}
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-blue-600 text-white"
                          : currentMonth
                          ? "text-white/70"
                          : "text-white/20"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-white/30">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1.5">
                    {dayEvents
                      .slice(0, 4)
                      .map((event) => {
                        const isChatbotEvent =
                          event.calendarType ===
                          "chatbot";

                        return (
                          <button
                            key={`${event.calendarType}-${event.id}`}
                            type="button"
                            onClick={() =>
                              handleEventClick(event)
                            }
                            className={`w-full rounded-md border px-2 py-1.5 text-left transition ${
                              isChatbotEvent
                                ? "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/15"
                                : "border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15"
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              {isChatbotEvent ? (
                                <PiCalendarBlank
                                  size={13}
                                  className="mt-0.5 shrink-0 text-amber-400"
                                />
                              ) : (
                                <PiCheckSquareOffset
                                  size={13}
                                  className="mt-0.5 shrink-0 text-blue-400"
                                />
                              )}

                              <span
                                className={`line-clamp-2 text-[11px] font-medium ${
                                  isChatbotEvent
                                    ? "text-amber-200"
                                    : "text-blue-200"
                                }`}
                              >
                                {event.calendarTitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                    {dayEvents.length > 4 && (
                      <div className="px-1 text-[10px] text-white/35">
                        +{dayEvents.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Event details */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101722] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedEvent.calendarTitle ||
                    selectedEvent.title ||
                    selectedEvent.name ||
                    "Calendar Event"}
                </h3>

                <p className="mt-1 text-xs text-white/40">
                  {selectedEvent.calendarType ===
                  "chatbot"
                    ? "Calendar event"
                    : "Subtask deadline"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(null)
                }
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <PiX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Date */}
              <div>
                <p className="text-xs uppercase tracking-wide text-white/35">
                  Date
                </p>

                <p className="mt-1 text-sm text-white">
                  {formatDisplayDate(
                    selectedEvent.dueDate
                  )}
                </p>
              </div>

              {/* Chatbot event details */}
              {selectedEvent.calendarType ===
                "chatbot" && (
                <>
                  {selectedEvent.description && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">
                        Description
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {selectedEvent.priority && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">
                        Priority
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {selectedEvent.priority}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Subtask details */}
              {selectedEvent.calendarType !==
                "chatbot" && (
                <>
                  {projectName(
                    selectedEvent.projectId
                  ) && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">
                        Project
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {projectName(
                          selectedEvent.projectId
                        )}
                      </p>
                    </div>
                  )}

                  {teamName(
                    selectedEvent.teamId
                  ) && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">
                        Team
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {teamName(
                          selectedEvent.teamId
                        )}
                      </p>
                    </div>
                  )}

                  {userName(
                    selectedEvent.assigneeId
                  ) && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/35">
                        Assignee
                      </p>

                      <p className="mt-1 text-sm text-white/70">
                        {userName(
                          selectedEvent.assigneeId
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Reschedule */}
              <div className="border-t border-white/10 pt-4">
                <label className="text-xs uppercase tracking-wide text-white/35">
                  Reschedule
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(event) =>
                      setNewDueDate(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0b111c] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  />

                  <button
                    type="button"
                    onClick={handleReschedule}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Existing subtask workspace */}
              {selectedEvent.calendarType !==
                "chatbot" &&
                selectedEvent.taskId != null && (
                  <Link
                    to={`/tasks/${selectedEvent.taskId}`}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <PiCheckSquareOffset size={17} />
                    Open Subtask Workspace
                  </Link>
                )}

              {/* Project information */}
              {selectedEvent.projectId != null && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <PiFolder size={15} />

                  <span>
                    {projectName(
                      selectedEvent.projectId
                    ) ||
                      `Project ${selectedEvent.projectId}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1320] px-6 py-10 text-center">
          <PiCalendarBlank
            size={32}
            className="mx-auto text-white/20"
          />

          <p className="mt-3 text-sm font-medium text-white/60">
            No calendar events found
          </p>

          <p className="mt-1 text-xs text-white/35">
            Subtask deadlines and chatbot-created events
            will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalCalendar;