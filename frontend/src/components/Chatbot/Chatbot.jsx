
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PiChatCircleDots,
  PiPaperPlaneRight,
  PiRobot,
  PiX,
} from "react-icons/pi";

import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";

const SUGGESTIONS = [
  "How many projects do I have?",
  "Which projects are in progress?",
  "Show high priority projects",
  "What's on today?",
  "Mark 25 Dec as Holiday",
];

const CHATBOT_EVENTS_KEY = "nfn_calendar_events_";

const lower = (value) => String(value ?? "").toLowerCase();

const describe = (p) =>
  `• ${p.name}${p.code ? ` (${p.code})` : ""} — ${
    p.status || "Not Started"
  }${p.priority ? `, ${p.priority} priority` : ""}`;

const listOf = (title, list) =>
  list.length === 0
    ? `${title}\nNone found.`
    : `${title}\n${list.map(describe).join("\n")}`;

const daysUntil = (dateString) => {
  if (!dateString) return null;

  const end = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(end.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((end - today) / 86400000);
};

const pad2 = (n) => String(n).padStart(2, "0");

const toISO = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const formatDisplayDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);

  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const monthIndex = (token) => {
  const t = lower(token).slice(0, 3);
  const idx = MONTHS.indexOf(t);

  return idx === -1 ? null : idx;
};

/*
 * Find the first date mentioned in the user's message.
 */
const extractDate = (text) => {
  const q = text.trim();
  const today = new Date();

  if (/\btoday\b/i.test(q)) {
    return {
      iso: toISO(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      ),
      matchText: "today",
    };
  }

  if (/\btomorrow\b/i.test(q)) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);

    return {
      iso: toISO(
        t.getFullYear(),
        t.getMonth() + 1,
        t.getDate()
      ),
      matchText: "tomorrow",
    };
  }

  if (/\byesterday\b/i.test(q)) {
    const t = new Date(today);
    t.setDate(t.getDate() - 1);

    return {
      iso: toISO(
        t.getFullYear(),
        t.getMonth() + 1,
        t.getDate()
      ),
      matchText: "yesterday",
    };
  }

  let m = q.match(
    /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/
  );

  if (m) {
    return {
      iso: toISO(+m[1], +m[2], +m[3]),
      matchText: m[0],
    };
  }

  m = q.match(
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/
  );

  if (m) {
    let year = +m[3];

    if (year < 100) {
      year += 2000;
    }

    return {
      iso: toISO(year, +m[2], +m[1]),
      matchText: m[0],
    };
  }

  /*
   * 25 Dec
   * 25 December
   * 25 Dec 2026
   * 25th December 2026
   */
  m = q.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s*,?\s*(\d{4}))?/i
  );

  if (m) {
    const mi = monthIndex(m[2]);

    if (mi !== null) {
      let year = m[3]
        ? +m[3]
        : today.getFullYear();

      let iso = toISO(
        year,
        mi + 1,
        +m[1]
      );

      /*
       * If a date without a year has already passed,
       * use the next occurrence.
       */
      if (
        !m[3] &&
        new Date(`${iso}T00:00:00`) <
          new Date(
            `${toISO(
              today.getFullYear(),
              today.getMonth() + 1,
              today.getDate()
            )}T00:00:00`
          )
      ) {
        year += 1;

        iso = toISO(
          year,
          mi + 1,
          +m[1]
        );
      }

      return {
        iso,
        matchText: m[0],
      };
    }
  }

  /*
   * Dec 25
   * December 25
   * Dec 25 2026
   */
  m = q.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/i
  );

  if (m) {
    const mi = monthIndex(m[1]);

    if (mi !== null) {
      let year = m[3]
        ? +m[3]
        : today.getFullYear();

      let iso = toISO(
        year,
        mi + 1,
        +m[2]
      );

      if (
        !m[3] &&
        new Date(`${iso}T00:00:00`) <
          new Date(
            `${toISO(
              today.getFullYear(),
              today.getMonth() + 1,
              today.getDate()
            )}T00:00:00`
          )
      ) {
        year += 1;

        iso = toISO(
          year,
          mi + 1,
          +m[2]
        );
      }

      return {
        iso,
        matchText: m[0],
      };
    }
  }

  return null;
};

/*
 * Extract event name from:
 * Mark 25 Dec as Holiday
 * Add 25 Dec as Diwali
 * Save 25 Dec named Team Outing
 */
const extractLabel = (text, dateMatchText) => {
  let rest = text;

  if (dateMatchText) {
    const escapedDate = dateMatchText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    rest = rest.replace(
      new RegExp(escapedDate, "i"),
      " "
    );
  }

  let m =
    rest.match(/\bas\s+(.+)$/i) ||
    rest.match(/\b(?:called|named|titled)\s+(.+)$/i) ||
    rest.match(/\bevent[: ]+([^,.]+)/i);

  if (m) {
    return m[1]
      .trim()
      .replace(/[.?!]+$/, "");
  }

  const stripped = rest
    .replace(
      /\b(mark|set|save|add|remind|note|reminder|on|for|the|my|calendar|date|in|to|please)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  return stripped.length > 1
    ? stripped
    : null;
};

/*
 * Read chatbot calendar events.
 */
const loadCalendarEvents = (userId) => {
  try {
    const raw = localStorage.getItem(
      CHATBOT_EVENTS_KEY + (userId ?? "guest")
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
};

/*
 * Save chatbot calendar events.
 */
const saveCalendarEvents = (
  userId,
  events
) => {
  try {
    localStorage.setItem(
      CHATBOT_EVENTS_KEY + (userId ?? "guest"),
      JSON.stringify(events)
    );

    /*
     * Tell GlobalCalendar that the data changed.
     * This works even when both components are open
     * in the same browser tab.
     */
    window.dispatchEvent(
      new Event("nfn-calendar-events-updated")
    );

    return true;
  } catch {
    return false;
  }
};

const buildReply = ({
  question,
  projects,
  subtasks,
  tasks,
  userId,
}) => {
  const q = lower(question).trim();

  /*
   * Greeting
   */
  if (/^(hi|hello|hey)\b/.test(q)) {
    return "Hi! I'm the NeuroForge assistant. Tell me how can i help you";
  }

  /*
   * Help
   */
  if (
    /\b(help|what can you do)\b/.test(q)
  ) {
    return (
      "You can ask me things like:\n" +
      "• How many projects do I have?\n" +
      "• Which projects are in progress / completed / not started?\n" +
      "• Show high priority projects\n" +
      "• Any upcoming or overdue deadlines?\n" +
      "• Tell me about <project name or code>\n" +
      "• Mark 25 Dec 2026 as Diwali\n" +
      "• What's on today / tomorrow / 25 Dec?"
    );
  }

  const dateHit = extractDate(question);

  /*
   * Always load the SAME calendar data used by GlobalCalendar.
   */
  const calendarEvents =
    loadCalendarEvents(userId);

  /*
   * Date-related commands.
   */
  if (dateHit) {
    const isMarkIntent =
      /\b(mark|set|save|add|remind|note down|reminder)\b/i.test(
        q
      );

    /*
     * CREATE CALENDAR EVENT
     */
    if (isMarkIntent) {
      const label = extractLabel(
        question,
        dateHit.matchText
      );

      if (!label) {
        return `Got the date (${formatDisplayDate(
          dateHit.iso
        )}), but I couldn't tell what to call it. Try: "Mark ${formatDisplayDate(
          dateHit.iso
        )} as Team Outing".`;
      }

      const newEvent = {
        id: `chatbot-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        title: label,

        label,

        dueDate: dateHit.iso,

        priority: "Medium",

        type: "chatbot",

        calendarType: "chatbot",

        createdBy: userId ?? "guest",

        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [
        ...calendarEvents,
        newEvent,
      ];

      const saved = saveCalendarEvents(
        userId,
        updatedEvents
      );

      if (!saved) {
        return "I couldn't save that calendar event because browser storage is unavailable.";
      }

      return `Saved. ${formatDisplayDate(
        dateHit.iso
      )} is now marked as "${label}". It will appear on your NeuroForge Calendar.`;
    }

    /*
     * READ EVENTS FOR A DATE
     */
    const dayEvents = calendarEvents.filter(
      (event) =>
        event?.dueDate === dateHit.iso
    );

    const dueSubtasks = subtasks.filter(
      (s) =>
        s.dueDate === dateHit.iso
    );

    if (
      dayEvents.length === 0 &&
      dueSubtasks.length === 0
    ) {
      return `Nothing marked on ${formatDisplayDate(
        dateHit.iso
      )}. Want me to add something? Try "Mark ${formatDisplayDate(
        dateHit.iso
      )} as ...".`;
    }

    const lines = [
      `Here's what's on ${formatDisplayDate(
        dateHit.iso
      )}:`,
    ];

    /*
     * Chatbot calendar events
     */
    dayEvents.forEach((event) => {
      lines.push(
        `• ${event.title || event.label || "Calendar event"}`
      );
    });

    /*
     * Existing application subtasks
     */
    dueSubtasks.forEach((s) => {
      const parentTask = tasks.find(
        (t) =>
          String(t.id) ===
          String(s.taskId)
      );

      lines.push(
        `• ${
          s.title || s.name || "Subtask"
        } — deliverable due${
          parentTask
            ? ` (${parentTask.title})`
            : ""
        }`
      );
    });

    return lines.join("\n");
  }

  /*
   * Saved calendar events.
   */
  if (
    /\b(my notes|my events|list events|all events|saved events)\b/.test(
      q
    )
  ) {
    if (calendarEvents.length === 0) {
      return "You haven't marked any calendar dates yet.";
    }

    return (
      "Your saved calendar events:\n" +
      calendarEvents
        .slice()
        .sort((a, b) =>
          String(a.dueDate).localeCompare(
            String(b.dueDate)
          )
        )
        .map(
          (event) =>
            `• ${formatDisplayDate(
              event.dueDate
            )}: ${
              event.title ||
              event.label ||
              "Calendar event"
            }`
        )
        .join("\n")
    );
  }

  /*
   * If there are no projects, stop project-specific
   * processing here.
   */
  if (projects.length === 0) {
    return "There are no projects in your scope yet.";
  }

  /*
   * Specific project search.
   */
  const match = projects.find((p) =>
    [p.name, p.code, p.projectKey].some(
      (v) =>
        v &&
        lower(v).length > 1 &&
        q.includes(lower(v))
    )
  );

  if (match) {
    return (
      `${match.name}${
        match.code
          ? ` (${match.code})`
          : ""
      }\n` +
      `Status: ${
        match.status || "Not Started"
      }\n` +
      `Priority: ${
        match.priority || "-"
      }\n` +
      `Project Lead: ${
        match.projectLead?.fullName ||
        "-"
      }\n` +
      `Project Manager: ${
        match.projectManager?.fullName ||
        "-"
      }\n` +
      `Start: ${
        match.startDate || "-"
      }\n` +
      `End: ${
        match.endDate || "-"
      }`
    );
  }

  /*
   * Not started.
   */
  if (
    q.includes("not started") ||
    q.includes("pending") ||
    q.includes("yet to start")
  ) {
    return listOf(
      "Projects not started:",
      projects.filter(
        (p) =>
          !p.status ||
          p.status === "Not Started"
      )
    );
  }

  /*
   * In progress.
   */
  if (
    q.includes("in progress") ||
    q.includes("ongoing") ||
    q.includes("active")
  ) {
    return listOf(
      "Projects in progress:",
      projects.filter(
        (p) =>
          p.status === "In Progress"
      )
    );
  }

  /*
   * On hold.
   */
  if (q.includes("hold")) {
    return listOf(
      "Projects on hold:",
      projects.filter(
        (p) =>
          p.status === "On Hold"
      )
    );
  }

  /*
   * Completed.
   */
  if (
    q.includes("complete") ||
    q.includes("finished") ||
    q.includes("done")
  ) {
    return listOf(
      "Completed projects:",
      projects.filter(
        (p) =>
          p.status === "Completed"
      )
    );
  }

  /*
   * Priority.
   */
  if (q.includes("priority")) {
    if (
      !projects.some(
        (p) => p.priority
      )
    ) {
      return "Priority is not set on these projects yet.";
    }

    const level = [
      "high",
      "medium",
      "low",
    ].find((l) =>
      q.includes(l)
    );

    if (level) {
      return listOf(
        `${
          level[0].toUpperCase() +
          level.slice(1)
        } priority projects:`,
        projects.filter(
          (p) =>
            lower(p.priority) ===
            level
        )
      );
    }
  }

  /*
   * Deadlines.
   */
  if (
    /(deadline|due|ending|end date|overdue|late)/.test(
      q
    )
  ) {
    if (
      !projects.some(
        (p) => p.endDate
      )
    ) {
      return "No end dates are set on these projects yet.";
    }

    const open = projects.filter(
      (p) =>
        p.status !== "Completed"
    );

    const overdue = open.filter(
      (p) => {
        const d = daysUntil(
          p.endDate
        );

        return (
          d !== null &&
          d < 0
        );
      }
    );

    const soon = open.filter(
      (p) => {
        const d = daysUntil(
          p.endDate
        );

        return (
          d !== null &&
          d >= 0 &&
          d <= 14
        );
      }
    );

    if (
      overdue.length === 0 &&
      soon.length === 0
    ) {
      return "No overdue projects, and nothing ends in the next 14 days.";
    }

    return [
      overdue.length
        ? listOf(
            "Overdue:",
            overdue
          )
        : "",

      soon.length
        ? listOf(
            "Ending within 14 days:",
            soon
          )
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /*
   * Count projects.
   */
  if (
    /(how many|count|total|number of)/.test(
      q
    )
  ) {
    const by = (status) =>
      projects.filter(
        (p) =>
          (p.status ||
            "Not Started") ===
          status
      ).length;

    return (
      `You have ${projects.length} project(s):\n` +
      `• Not Started: ${by(
        "Not Started"
      )}\n` +
      `• In Progress: ${by(
        "In Progress"
      )}\n` +
      `• Completed: ${by(
        "Completed"
      )}`
    );
  }

  /*
   * List all projects.
   */
  if (
    /(list|all projects|show projects|show all|everything)/.test(
      q
    )
  ) {
    return listOf(
      "All projects:",
      projects
    );
  }

  return "Sorry, I didn't get that. Type \"help\" to see what I can answer.";
};

const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();

  const { getVisibleProjects } =
    useProjects();

  const {
    tasks = [],
    subtasks = [],
    getVisibleSubtasks,
  } = useTasks();

  const { teams = [] } = useTeams();

  const { projectTeams = {} } =
    useProjectTeam();

  const projects = useMemo(
    () =>
      getVisibleProjects
        ? getVisibleProjects(
            currentUser,
            projectTeams,
            teams
          )
        : [],
    [
      getVisibleProjects,
      currentUser,
      projectTeams,
      teams,
    ]
  );

  const visibleSubtasks = useMemo(
    () =>
      getVisibleSubtasks
        ? getVisibleSubtasks(
            currentUser,
            projectTeams,
            teams,
            projects
          )
        : subtasks,
    [
      getVisibleSubtasks,
      currentUser,
      projectTeams,
      teams,
      projects,
      subtasks,
    ]
  );

  const [open, setOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        from: "bot",
        text: "Hi! I'm the NeuroForge assistant. Tell me how can i help you",
      },
    ]);

  const bottomRef =
    useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, open]);

  const send = (text) => {
    const question = text.trim();

    if (!question) return;

    const reply = buildReply({
      question,
      projects,
      subtasks: visibleSubtasks,
      tasks,
      userId: currentUser?.id,
    });

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text: question,
      },
      {
        from: "bot",
        text: reply,
      },
    ]);

    setInput("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  const handleToggle = () => {
    if (!open) {
      const onProjectsSection =
        location.pathname.startsWith(
          "/projects"
        );

      /*
       * Chatbot opens in the Projects tab.
       */
      if (!onProjectsSection) {
        navigate("/projects");
      }

      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-2xl">
          {/* Chat header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <PiRobot size={22} />

              <span className="font-semibold">
                Project Assistant
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close chat"
              className="text-white/80 transition hover:text-white"
            >
              <PiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.from === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                      message.from ===
                      "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#0a0e17] text-[#e8eef8]/90"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            )}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        send(suggestion)
                      }
                      className="rounded-full border border-[#e8eef8]/15 px-3 py-1 text-xs text-[#e8eef8]/70 transition hover:border-blue-500 hover:text-white"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[#e8eef8]/10 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask about projects or your calendar..."
              className="flex-1 rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-3 py-2 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              aria-label="Send message"
              className="rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-500"
            >
              <PiPaperPlaneRight
                size={18}
              />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          open
            ? "Close chatbot"
            : "Open chatbot"
        }
        title="Chat with assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transition hover:scale-105"
      >
        {open ? (
          <PiX size={26} />
        ) : (
          <PiChatCircleDots
            size={28}
          />
        )}
      </button>
    </>
  );
};

export default ChatBot;

