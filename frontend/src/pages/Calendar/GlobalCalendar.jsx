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

const GlobalCalendar = () => {
  const { currentUser } = useAuth();

  const { projects = [] } = useProjects();
  const { tasks = [], updateSubtask } = useTasks();
  const { teams = [] } = useTeams();
  const { users = [] } = useUsers();
  const { projectTeams = [] } = useProjectTeam();

  const { can } = usePermission();

  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [selectedProjectId, setSelectedProjectId] =
    useState("ALL");

  const [selectedTeamId, setSelectedTeamId] =
    useState("ALL");

  const [selectedUserId, setSelectedUserId] =
    useState("ALL");

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [newDueDate, setNewDueDate] =
    useState("");

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

  const filteredEvents = useMemo(() => {
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
      }));

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

  const getEventsForDay = (day) => {
    const dateString = toISO(day);

    return filteredEvents.filter(
      (event) =>
        event.dueDate === dateString
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
    if (!selectedEvent || !newDueDate) {
      return;
    }

    if (
      selectedEvent.calendarType ===
      "chatbot"
    ) {
      try {
        const userId =
          currentUser?.id ?? "guest";

        const existingEvents =
          getChatbotEvents(userId);

        const updatedEvents =
          existingEvents.map((event) =>
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
          new Event(
            "nfn-calendar-events-updated"
          )
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

    if (
      typeof updateSubtask === "function"
    ) {
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

  const todayISO = toISO(new Date());

  return (
    <div className="min-h-full bg-transparent space-y-6 p-4 text-[#172033] dark:text-slate-100 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-400">
              <PiCalendarBlank size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#172033] dark:text-white">
                SDLC Master Calendar
              </h1>

              <p className="mt-1 text-sm text-[#475569] dark:text-slate-400">
                Track subtasks, milestones, delivery deadlines
                and calendar events.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goToToday}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#475569] shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
        >
          Today
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#172033] dark:text-white">
          <PiFunnel size={18} className="text-[#2563EB] dark:text-blue-400" />
          Filters
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={selectedProjectId}
            onChange={(event) =>
              setSelectedProjectId(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="" className="dark:bg-[#1e293b] dark:text-white">
              All Projects
            </option>

            {visibleProjects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                  className="dark:bg-[#1e293b] dark:text-white"
                >
                  {project.name ||
                    project.title ||
                    project.projectName ||
                    `Project ${project.id}`}
                </option>
              )
            )}
          </select>

          <select
            value={selectedTeamId}
            onChange={(event) =>
              setSelectedTeamId(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="" className="dark:bg-[#1e293b] dark:text-white">
              All Teams
            </option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
                className="dark:bg-[#1e293b] dark:text-white"
              >
                {team.name ||
                  team.teamName ||
                  `Team ${team.id}`}
              </option>
            ))}
          </select>

          <select
            value={selectedUserId}
            onChange={(event) =>
              setSelectedUserId(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-[#1e293b] dark:text-white"
          >
            <option value="" className="dark:bg-[#1e293b] dark:text-white">
              All Users
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
                className="dark:bg-[#1e293b] dark:text-white"
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Previous month"
          >
            <PiCaretLeft size={20} />
          </button>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {MONTHS[currentDate.getMonth()]}{" "}
            {currentDate.getFullYear()}
          </h2>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Next month"
          >
            <PiCaretRight size={20} />
          </button>
        </div>

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
                  className={`min-h-[125px] border-r border-b border-slate-200 p-2 last:border-r-0 dark:border-slate-800 ${
                    currentMonth
                      ? "bg-white dark:bg-[#0f172a]"
                      : "bg-[#F1F5F9] dark:bg-slate-900/40"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-[#2563EB] text-white"
                          : currentMonth
                          ? "text-[#475569]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

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
                              handleEventClick(
                                event
                              )
                            }
                            className={`w-full rounded-lg border px-2 py-1.5 text-left transition ${
                              isChatbotEvent
                                ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                                : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                            }`}
                          >
                            <div className="flex items-start gap-1.5">
                              {isChatbotEvent ? (
                                <PiCalendarBlank
                                  size={13}
                                  className="mt-0.5 shrink-0 text-[#D97706]"
                                />
                              ) : (
                                <PiCheckSquareOffset
                                  size={13}
                                  className="mt-0.5 shrink-0 text-[#2563EB]"
                                />
                              )}

                              <span
                                className={`line-clamp-2 text-[11px] font-semibold ${
                                  isChatbotEvent
                                    ? "text-[#92400E]"
                                    : "text-[#1D4ED8]"
                                }`}
                              >
                                {event.calendarTitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                    {dayEvents.length > 4 && (
                      <div className="px-1 text-[10px] font-medium text-[#64748B]">
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

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/60">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-[#172033] dark:text-white">
                  {selectedEvent.calendarTitle ||
                    selectedEvent.title ||
                    selectedEvent.name ||
                    "Calendar Event"}
                </h3>

                <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
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
                className="rounded-lg p-2 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#172033] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close"
              >
                <PiX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-slate-200 bg-[#F1F5F9] p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-semibold text-[#172033] dark:text-white">
                  {formatDisplayDate(
                    selectedEvent.dueDate
                  )}
                </p>
              </div>

              {selectedEvent.calendarType ===
                "chatbot" && (
                <>
                  {selectedEvent.description && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                        Description
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#475569] dark:text-slate-300">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}

                  {selectedEvent.priority && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                        Priority
                      </p>

                      <span className="mt-1 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1D4ED8] dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        {selectedEvent.priority}
                      </span>
                    </div>
                  )}
                </>
              )}

              {selectedEvent.calendarType !==
                "chatbot" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {projectName(
                    selectedEvent.projectId
                  ) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                        Project
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#172033] dark:text-white">
                        {projectName(
                          selectedEvent.projectId
                        )}
                      </p>
                    </div>
                  )}

                  {teamName(
                    selectedEvent.teamId
                  ) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                        Team
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#172033] dark:text-white">
                        {teamName(
                          selectedEvent.teamId
                        )}
                      </p>
                    </div>
                  )}

                  {userName(
                    selectedEvent.assigneeId
                  ) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
                        Assignee
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#172033] dark:text-white">
                        {userName(
                          selectedEvent.assigneeId
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-slate-400">
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
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={handleReschedule}
                    className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    Save
                  </button>
                </div>
              </div>

              {selectedEvent.calendarType !==
                "chatbot" &&
                selectedEvent.taskId != null && (
                  <Link
                    to={
                      selectedEvent.projectId
                        ? `/projects/${selectedEvent.projectId}/tasks/${selectedEvent.taskId}`
                        : `/tasks/${selectedEvent.taskId}`
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-300 bg-[#F1F5F9] px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                  >
                    <PiCheckSquareOffset size={17} />
                    Open Subtask Workspace
                  </Link>
                )}

              {selectedEvent.projectId != null && (
                <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
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

      {filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <PiCalendarBlank
            size={32}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <p className="mt-3 text-sm font-semibold text-[#475569] dark:text-slate-300">
            No calendar events found
          </p>

          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-500">
            Subtask deadlines and chatbot-created events
            will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalCalendar;