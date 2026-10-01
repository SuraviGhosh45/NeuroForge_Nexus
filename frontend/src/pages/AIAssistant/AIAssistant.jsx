import { useState, useEffect, useRef } from "react";
import {
  PiRobot,
  PiPaperPlaneRight,
  PiTrash,
  PiSparkle,
  PiUser,
  PiCheckCircle,
  PiCalendarBlank,
  PiFolder,
  PiListChecks,
  PiArrowSquareOut,
  PiCopy,
  PiArrowsClockwise,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import axios from "../../services/api.js";

const CHATBOT_EVENTS_KEY = "nfn_calendar_events_";

const lower = (value) => String(value ?? "").toLowerCase();

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const extractDate = (text) => {
  const q = text.trim();
  const today = new Date();

  if (/\btoday\b/i.test(q)) {
    return {
      iso: toISO(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      matchText: "today",
    };
  }

  if (/\btomorrow\b/i.test(q)) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return {
      iso: toISO(t.getFullYear(), t.getMonth() + 1, t.getDate()),
      matchText: "tomorrow",
    };
  }

  let m = q.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) {
    return {
      iso: toISO(+m[1], +m[2], +m[3]),
      matchText: m[0],
    };
  }

  m = q.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/);
  if (m) {
    let year = +m[3];
    if (year < 100) year += 2000;
    return {
      iso: toISO(year, +m[2], +m[1]),
      matchText: m[0],
    };
  }

  return null;
};

const extractLabel = (text, dateMatchText) => {
  let rest = text;
  if (dateMatchText) {
    const escaped = dateMatchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rest = rest.replace(new RegExp(escaped, "i"), " ");
  }

  const m =
    rest.match(/\bas\s+(.+)$/i) ||
    rest.match(/\b(?:called|named|titled)\s+(.+)$/i) ||
    rest.match(/\bevent[: ]+([^,.]+)/i);

  if (m) return m[1].trim().replace(/[.?!]+$/, "");

  const stripped = rest
    .replace(
      /\b(mark|set|save|add|remind|note|reminder|on|for|the|my|calendar|date|in|to|please)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  return stripped.length > 1 ? stripped : null;
};

const loadCalendarEvents = (userId) => {
  try {
    const raw = localStorage.getItem(CHATBOT_EVENTS_KEY + (userId ?? "guest"));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCalendarEvents = (userId, events) => {
  try {
    localStorage.setItem(
      CHATBOT_EVENTS_KEY + (userId ?? "guest"),
      JSON.stringify(events)
    );
    window.dispatchEvent(new Event("nfn-calendar-events-updated"));
    return true;
  } catch {
    return false;
  }
};

const QUICK_PROMPTS = [
  {
    category: "Projects",
    items: [
      "How many projects do I have?",
      "Which projects are in progress?",
      "Show high priority projects",
      "Any upcoming project deadlines?",
    ],
  },
  {
    category: "Tasks & Sprints",
    items: [
      "What tasks are assigned to me?",
      "Show all open parent tasks",
      "Which tasks are overdue?",
      "Give me a sprint progress summary",
    ],
  },
  {
    category: "Calendar & Schedule",
    items: [
      "What's on today?",
      "What's scheduled for tomorrow?",
      "List all my saved events",
      "Mark tomorrow as Sprint Review",
    ],
  },
];

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const { projects = [], getVisibleProjects } = useProjects() || {};
  const { tasks = [], getSubtasksByTaskId } = useTasks() || {};
  const { projectTeams = {} } = useProjectTeam() || {};
  const { users = [] } = useUsers() || {};

  const [messages, setMessages] = useState(() => {
    const initialGreeting = `Hello ${currentUser?.fullName || "there"}! 👋 

I'm your **NeuroForge SDLC AI Assistant**. I can help you monitor projects, inspect sprint deliverables, track deadlines, manage calendar events, and summarize engineering progress across your teams.

Try asking one of the questions on the left or type your own question below!`;

    return [
      {
        id: "msg-init",
        sender: "ai",
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Generate responsive frontend intelligence
  const generateResponse = (query) => {
    const q = lower(query).trim();
    const userId = currentUser?.id;

    if (/^(hi|hello|hey|greetings|hola)\b/.test(q)) {
      return `Hi ${currentUser?.fullName || "there"}! How can I assist you with your projects, tasks, or schedule today?`;
    }

    if (/\b(help|what can you do|commands|capabilities)\b/.test(q)) {
      return `Here are some of the things you can ask me:
• **Projects**: "How many projects do I have?", "Which projects are in progress?", "Show high priority projects"
• **Details**: "Tell me about <project name or code>"
• **Tasks**: "What tasks are assigned to me?", "Show open parent tasks", "Which tasks are overdue?"
• **Calendar**: "What's on today?", "What's scheduled for tomorrow?", "Mark 25 Dec as Team Outing"
• **Team Members**: "Who is on project <name>?" or "Show active users"`;
    }

    // Date / Calendar intent
    const dateHit = extractDate(query);
    const calendarEvents = loadCalendarEvents(userId);

    if (dateHit) {
      const isMarkIntent = /\b(mark|set|save|add|remind|note|reminder)\b/i.test(q);

      if (isMarkIntent) {
        const label = extractLabel(query, dateHit.matchText);
        if (!label) {
          return `Got the date (${formatDisplayDate(dateHit.iso)}), but couldn't detect the event title. Try: "Mark ${formatDisplayDate(dateHit.iso)} as Sprint Review".`;
        }

        const newEvent = {
          id: `chatbot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: label,
          label,
          dueDate: dateHit.iso,
          priority: "Medium",
          type: "chatbot",
          calendarType: "chatbot",
          createdBy: userId ?? "guest",
          createdAt: new Date().toISOString(),
        };

        const updated = [...calendarEvents, newEvent];
        saveCalendarEvents(userId, updated);
        return `✅ Event saved! **${formatDisplayDate(dateHit.iso)}** is now marked as **"${label}"**. It will also appear in your NeuroForge Calendar.`;
      }

      // Query events for date
      const dayEvents = calendarEvents.filter((e) => e?.dueDate === dateHit.iso);
      const dueTasks = tasks.filter((t) => t.dueDate === dateHit.iso);

      if (dayEvents.length === 0 && dueTasks.length === 0) {
        return `📅 Nothing scheduled on **${formatDisplayDate(dateHit.iso)}**. You can add an event by typing: "Mark ${formatDisplayDate(dateHit.iso)} as [Event Name]".`;
      }

      const lines = [`📅 **Schedule for ${formatDisplayDate(dateHit.iso)}:**`];
      dayEvents.forEach((ev) => lines.push(`• 📌 **Calendar Event**: ${ev.title || ev.label}`));
      dueTasks.forEach((t) => lines.push(`• 📋 **Task Deadline**: ${t.title} (${t.status || "To Do"})`));
      return lines.join("\n");
    }

    if (/\b(saved events|all events|list events|my events)\b/.test(q)) {
      if (calendarEvents.length === 0) {
        return "You don't have any custom calendar events saved yet. Try: 'Mark tomorrow as Sprint Retrospective'.";
      }
      return `📅 **Your Saved Calendar Events (${calendarEvents.length}):**\n` +
        calendarEvents
          .map((e) => `• **${formatDisplayDate(e.dueDate)}**: ${e.title || e.label}`)
          .join("\n");
    }

    // Projects queries
    if (/\b(how many projects|count projects|number of projects)\b/.test(q)) {
      const activeCount = projects.filter((p) => p.status === "In Progress").length;
      const completedCount = projects.filter((p) => p.status === "Completed").length;
      return `📊 You have **${projects.length} project(s)** in your scope:\n• **${activeCount}** In Progress\n• **${completedCount}** Completed\n• **${projects.length - activeCount - completedCount}** Not Started / On Hold.`;
    }

    if (/\b(in progress|ongoing projects|active projects)\b/.test(q)) {
      const inProgress = projects.filter((p) => p.status === "In Progress");
      if (inProgress.length === 0) return "No projects are currently marked as 'In Progress'.";
      return `🚀 **Projects In Progress (${inProgress.length}):**\n` +
        inProgress.map((p) => `• **${p.name}** (${p.code || "No Code"}) — Lead: ${p.projectLead?.fullName || "Unassigned"}`).join("\n");
    }

    if (/\b(high priority|critical projects|important projects)\b/.test(q)) {
      const highPriority = projects.filter((p) => ["High", "Critical"].includes(p.priority));
      if (highPriority.length === 0) return "No projects are currently flagged as High or Critical priority.";
      return `🔥 **High & Critical Priority Projects (${highPriority.length}):**\n` +
        highPriority.map((p) => `• **${p.name}** [${p.priority}] — Status: ${p.status || "Not Started"}`).join("\n");
    }

    if (/\b(deadlines?|overdue|upcoming)\b/.test(q)) {
      const today = new Date().toISOString().split("T")[0];
      const withDeadlines = projects.filter((p) => p.endDate);
      if (withDeadlines.length === 0) return "No target completion dates recorded for projects yet.";
      return `⏰ **Project Target Dates:**\n` +
        withDeadlines.map((p) => `• **${p.name}**: Due ${formatDisplayDate(p.endDate)} (${p.status})`).join("\n");
    }

    // Tasks queries
    if (/\b(my tasks|assigned to me|my work)\b/.test(q)) {
      const myTasks = tasks.filter((t) => String(t.assigneeId ?? t.assignee?.id) === String(userId));
      if (myTasks.length === 0) return `You currently have **0 parent tasks** directly assigned to you. Check the "My Work" page or ask your Project Lead for tasks!`;
      return `📋 **Tasks Assigned to You (${myTasks.length}):**\n` +
        myTasks.map((t) => `• **${t.title}** [${t.status}] — Priority: ${t.priority || "Medium"}, Due: ${t.dueDate || "No deadline"}`).join("\n");
    }

    if (/\b(all tasks|open tasks|tasks list|parent tasks)\b/.test(q)) {
      if (tasks.length === 0) return "No tasks found in the database.";
      const open = tasks.filter((t) => t.status !== "Done");
      return `📌 **Active Parent Tasks (${open.length} of ${tasks.length} total):**\n` +
        open.slice(0, 7).map((t) => `• **${t.title}** [${t.status}] — Assignee: ${t.assignee?.fullName || "Unassigned"}`).join("\n") +
        (open.length > 7 ? `\n...and ${open.length - 7} more tasks.` : "");
    }

    // Project Name search
    const matchedProject = projects.find((p) =>
      [p.name, p.code].some((term) => term && lower(term).length > 2 && q.includes(lower(term)))
    );

    if (matchedProject) {
      const members = projectTeams[String(matchedProject.id)] || [];
      return `📁 **Project: ${matchedProject.name} (${matchedProject.code || "N/A"})**
• **Status**: ${matchedProject.status || "Not Started"}
• **Priority**: ${matchedProject.priority || "Medium"}
• **Project Lead**: ${matchedProject.projectLead?.fullName || "Unassigned"}
• **Project Manager**: ${matchedProject.projectManager?.fullName || "Unassigned"}
• **Timeline**: ${matchedProject.startDate || "N/A"} to ${matchedProject.endDate || "N/A"}
• **Team Size**: ${members.length} members
• **Description**: ${matchedProject.description || "No description provided."}`;
    }

    // Role specific default fallback
    return `I received your question: "${query}".\n\nBased on your active ${currentUser?.role || "Developer"} session, you can monitor live sprint metrics, check team assignments in Projects, or manage deliverables in Kanban. Try asking:\n• "Which projects are in progress?"\n• "What tasks are assigned to me?"\n• "What's on today?"`;
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    /* ==========================================================================
       [BACKEND_INTEGRATION_POINT]
       Endpoint:    POST http://localhost:8080/api/ai/assistant/chat
       Description: Submit user query to backend LLM / Spring AI assistant pipeline.
       Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
       Payload:     { "message": query, "context": { "role": currentUser?.role, "userId": currentUser?.id } }
       Response:    200 OK -> { "reply": "...", "confidence": 0.98 }
       cURL:        curl -X POST http://localhost:8080/api/ai/assistant/chat -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"message":"What projects are active?"}'
       Fallback:    Full client-side SDLC query evaluation if backend is offline.
       ========================================================================== */
    try {
      // Optional backend attempt
      const res = await axios.post("http://localhost:8080/api/ai/assistant/chat", {
        message: query,
        context: { role: currentUser?.role, userId: currentUser?.id },
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            sender: "ai",
            text: res.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Backend offline or endpoint not present: smoothly handle on frontend
    }

    // Frontend fallback response simulation
    setTimeout(() => {
      const reply = generateResponse(query);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai`,
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: "ai",
        text: `Chat cleared. How can I assist you with your projects, tasks, or calendar?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <PiRobot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Engineering Assistant
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Copilot
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Intelligent SDLC context engine • Project metrics, sprint deliverables, and schedule insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shadow-xs"
            title="Clear current conversation"
          >
            <PiTrash size={15} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Suggested Queries & Context Stats */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Context Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Live Workspace Scope
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {projects.length}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Projects in Scope
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {tasks.length}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Active Tasks
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompt Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#111827] space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <PiSparkle className="text-indigo-500" size={16} />
              <span>Recommended Prompts</span>
            </div>

            {QUICK_PROMPTS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {group.category}
                </p>
                <div className="space-y-1">
                  {group.items.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="w-full text-left rounded-lg border border-slate-200/80 bg-slate-50/60 px-2.5 py-1.5 text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/80 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Conversation Window */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#111827] h-[640px]">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                      isAi
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {isAi ? <PiRobot size={18} /> : <PiUser size={16} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`group relative max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition ${
                      isAi
                        ? "border border-slate-200 bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-[#1e293b] dark:text-slate-100"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    <div
                      className={`mt-2 flex items-center justify-between gap-4 text-[10px] ${
                        isAi
                          ? "text-slate-400 dark:text-slate-500"
                          : "text-blue-100/80"
                      }`}
                    >
                      <span>{msg.timestamp}</span>

                      {isAi && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition hover:text-slate-700 dark:hover:text-slate-200"
                          title="Copy reply text"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <PiCheckCircle className="text-emerald-500" size={13} />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <PiCopy size={13} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <PiRobot size={18} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-[#1e293b] dark:text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Assistant is analyzing SDLC workspace...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions strip above input */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-slate-400 font-medium shrink-0">Try asking:</span>
            {["Which projects are in progress?", "What tasks are assigned to me?", "What's on today?"].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(chip)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-600 dark:hover:text-blue-300 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about projects, tasks, sprints, or schedules..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <PiPaperPlaneRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
