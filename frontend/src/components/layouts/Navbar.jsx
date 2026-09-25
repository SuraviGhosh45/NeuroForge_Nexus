import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PiList,
  PiMagnifyingGlass,
  PiBell,
  PiCaretDown,
  PiCaretRight,
  PiSignOut,
  PiTrash,
  PiShieldCheck,
  PiBriefcase,
  PiCompass,
  PiUsersThree,
  PiCode,
  PiBug,
  PiCheckCircle,
  PiFolder,
  PiCalendarBlank,
  PiCheckSquare,
  PiUsers,
  PiGauge,
  PiX,
  PiCommand,
  PiCircleDashed,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { ROLES, formatRole, normalizeRole } from "../../constants/roles.js";

const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    label: "Admin",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/20",
    dot: "bg-purple-400 shadow-purple-500/50",
    icon: PiShieldCheck,
  },
  [ROLES.PROJECT_MANAGER]: {
    label: "Project Manager",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20",
    dot: "bg-blue-400 shadow-blue-500/50",
    icon: PiBriefcase,
  },
  [ROLES.PROJECT_LEAD]: {
    label: "Project Lead",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20",
    dot: "bg-cyan-400 shadow-cyan-500/50",
    icon: PiCompass,
  },
  [ROLES.TEAM_LEAD]: {
    label: "Team Lead",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
    dot: "bg-emerald-400 shadow-emerald-500/50",
    icon: PiUsersThree,
  },
  [ROLES.DEVELOPER]: {
    label: "Developer",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20",
    dot: "bg-amber-400 shadow-amber-500/50",
    icon: PiCode,
  },
  [ROLES.TESTER]: {
    label: "Tester",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20",
    dot: "bg-rose-400 shadow-rose-500/50",
    icon: PiBug,
  },
  [ROLES.QA]: {
    label: "QA Engineer",
    badge: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20",
    dot: "bg-indigo-400 shadow-indigo-500/50",
    icon: PiCheckCircle,
  },
  [ROLES.UNASSIGNED]: {
    label: "Unassigned",
    badge: "border-gray-500/30 bg-gray-500/10 text-gray-300 ring-1 ring-gray-500/20",
    dot: "bg-gray-400 shadow-gray-500/50",
    icon: PiCircleDashed,
  },
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const Navbar = ({
  sidebarOpen,
  toggleSidebar,
  onRequestDeleteAccount,
}) => {
  const { currentUser, logout } = useAuth();
  const { projects = [] } = useProjects();
  const { tasks = [] } = useTasks();
  const location = useLocation();
  const navigate = useNavigate();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Workspace Synchronized",
      description: "All active project and task data are in sync with MySQL.",
      time: "Just now",
      read: false,
      type: "system",
    },
    {
      id: "2",
      title: "Sprint Delivery Tracker",
      description: "Automated calculation of completion & blocked status is active.",
      time: "10m ago",
      read: false,
      type: "project",
    },
    {
      id: "3",
      title: "SDLC Security Guard Active",
      description: "RBAC and scope protections verified for current session.",
      time: "1h ago",
      read: true,
      type: "security",
    },
  ]);

  const accountRef = useRef(null);
  const notifRef = useRef(null);
  const searchModalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAccountMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const role = normalizeRole(currentUser?.role);
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG[ROLES.UNASSIGNED];
  const RoleIcon = roleConfig.icon;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Compute breadcrumbs
  const breadcrumb = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return { title: "Dashboard", category: "Workspace" };
    if (path === "/projects") return { title: "Project Directory", category: "Management" };
    if (path.startsWith("/projects/")) {
      const id = path.split("/")[2];
      const proj = projects.find((p) => String(p.id) === String(id));
      return { title: proj?.name || `Project #${id}`, category: "Project Workspace" };
    }
    if (path.startsWith("/my-tasks")) return { title: "My Work Queue", category: "Workbench" };
    if (path.startsWith("/user-management")) return { title: "User Directory", category: "Administration" };
    if (path.startsWith("/calendar")) return { title: "Calendar Overview", category: "Planning" };
    return { title: "Overview", category: "Workspace" };
  }, [location.pathname, projects]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const matchedProjects = projects
      .filter((p) => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({
        type: "project",
        id: p.id,
        title: p.name,
        subtitle: `Project Code: ${p.code || "—"} • ${p.status || "In Progress"}`,
        link: `/projects/${p.id}`,
        icon: PiFolder,
      }));

    const matchedTasks = tasks
      .filter((t) => t.title?.toLowerCase().includes(q) || t.taskKey?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((t) => ({
        type: "task",
        id: t.id,
        title: t.title,
        subtitle: `${t.taskKey || `Task #${t.id}`} • Priority: ${t.priority || "Medium"} • ${t.status || "To Do"}`,
        link: t.projectId ? `/projects/${t.projectId}` : "/projects",
        icon: PiCheckSquare,
      }));

    const navPages = [
      { title: "Dashboard", link: "/dashboard", icon: PiGauge, desc: "Personal overview & metrics" },
      { title: "Projects", link: "/projects", icon: PiFolder, desc: "All workspace projects" },
      ...(role !== ROLES.ADMIN ? [{ title: "My Work", link: "/my-tasks", icon: PiCheckSquare, desc: "Assigned tasks & subtasks" }] : []),
      ...(role !== ROLES.ADMIN ? [{ title: "Calendar", link: "/calendar", icon: PiCalendarBlank, desc: "Schedule & deadlines" }] : []),
      ...(role === ROLES.ADMIN ? [{ title: "Users", link: "/user-management", icon: PiUsers, desc: "Manage members & permissions" }] : []),
    ]
      .filter((page) => page.title.toLowerCase().includes(q) || page.desc.toLowerCase().includes(q))
      .map((page) => ({
        type: "page",
        id: page.link,
        title: page.title,
        subtitle: page.desc,
        link: page.link,
        icon: page.icon,
      }));

    return [...navPages, ...matchedProjects, ...matchedTasks];
  }, [searchQuery, projects, tasks, role]);

  const handleSelectResult = (link) => {
    setSearchOpen(false);
    navigate(link);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e8eef8]/10 bg-[#070b14]/80 backdrop-blur-xl shadow-lg shadow-black/20 transition-all">
        {/* Subtle top ambient hairline glow */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left section: Toggle + Brand Logo + Breadcrumbs */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8eef8]/10 bg-[#0d1320] text-[#e8eef8]/75 transition-all duration-200 hover:border-[#e8eef8]/20 hover:bg-[#151c2c] hover:text-white active:scale-95"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PiList size={20} />
            </button>

            {/* Brand Logo */}
            <Link
              to="/dashboard"
              className="group flex items-center gap-2.5 transition-all duration-200 hover:opacity-95"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-black text-base shadow-md shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
                <span>N</span>
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>

              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-bold tracking-tight text-white transition-colors group-hover:text-blue-400">
                    NeuroForge
                  </span>
                  <span className="rounded-md border border-blue-500/30 bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-400">
                    Nexus
                  </span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#e8eef8]/40">
                  SDLC Suite
                </span>
              </div>
            </Link>

            {/* Breadcrumb Context */}
            <div className="hidden lg:flex items-center gap-2 border-l border-[#e8eef8]/10 pl-5 text-xs">
              <span className="text-[#e8eef8]/40 font-medium">
                {breadcrumb.category}
              </span>
              <PiCaretRight size={12} className="text-[#e8eef8]/25" />
              <span className="font-semibold text-white truncate max-w-[200px]">
                {breadcrumb.title}
              </span>
            </div>
          </div>

          {/* Center section: Global Search Trigger */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex w-full items-center justify-between rounded-xl border border-[#e8eef8]/10 bg-[#0d1320]/80 px-3.5 py-2 text-xs text-[#e8eef8]/50 shadow-inner transition-all duration-200 hover:border-blue-500/30 hover:bg-[#121929] hover:text-[#e8eef8]/80 hover:shadow-blue-500/5"
            >
              <div className="flex items-center gap-2.5 truncate">
                <PiMagnifyingGlass size={16} className="text-[#e8eef8]/40 transition-colors group-hover:text-blue-400" />
                <span className="truncate">Search projects, tasks, or pages...</span>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-[#e8eef8]/10 bg-[#070b14] px-1.5 py-0.5 text-[10px] font-medium text-[#e8eef8]/40 group-hover:text-[#e8eef8]/70">
                <PiCommand size={10} />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right section: Mobile Search Icon + Role Badge + Notifications + User Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-[#e8eef8]/10 bg-[#0d1320] text-[#e8eef8]/70 transition-all hover:bg-[#151c2c] hover:text-white"
              title="Search"
            >
              <PiMagnifyingGlass size={17} />
            </button>

            {/* Role Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-sm ${roleConfig.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${roleConfig.dot} animate-pulse`} />
              <RoleIcon size={14} className="opacity-90" />
              <span>{formatRole(role)}</span>
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setAccountMenuOpen(false);
                }}
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
                  notificationsOpen
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-md shadow-blue-500/10"
                    : "border-[#e8eef8]/10 bg-[#0d1320] text-[#e8eef8]/70 hover:border-[#e8eef8]/20 hover:bg-[#151c2c] hover:text-white"
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <PiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-md shadow-blue-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-2xl border border-[#e8eef8]/15 bg-[#0e1422] p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-black/40 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-[#e8eef8]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#e8eef8]/40">
                        <PiCheckCircle size={28} className="mx-auto mb-2 text-emerald-400/60" />
                        All caught up! No notifications.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-3 transition-all ${
                            item.read
                              ? "border-[#e8eef8]/5 bg-[#141b2b]/40 text-[#e8eef8]/60"
                              : "border-blue-500/20 bg-blue-500/5 text-[#e8eef8] shadow-sm shadow-blue-500/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-white leading-snug">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-[#e8eef8]/40 whitespace-nowrap">
                              {item.time}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-[#e8eef8]/60 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 border-t border-[#e8eef8]/10 pt-2.5 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-[#e8eef8]/40 font-medium">
                      NeuroForge Event Stream Active
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User Account Menu */}
            <div className="relative border-l border-[#e8eef8]/10 pl-2.5 sm:pl-3.5" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  setAccountMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl border p-1 sm:px-2.5 sm:py-1.5 transition-all duration-200 active:scale-95 ${
                  accountMenuOpen
                    ? "border-blue-500/40 bg-blue-500/10 shadow-md shadow-blue-500/10"
                    : "border-transparent hover:border-[#e8eef8]/10 hover:bg-[#0d1320]"
                }`}
                aria-expanded={accountMenuOpen}
              >
                {/* Avatar with Status Ring */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                  <span>{getInitials(currentUser?.fullName || currentUser?.email)}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070b14] bg-emerald-400" />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold leading-tight text-white truncate max-w-[120px]">
                    {currentUser?.fullName || "User"}
                  </p>
                  <p className="text-[10px] text-[#e8eef8]/40 truncate max-w-[120px]">
                    {currentUser?.email}
                  </p>
                </div>

                <PiCaretDown
                  size={14}
                  className={`text-[#e8eef8]/40 transition-transform duration-200 ${
                    accountMenuOpen ? "rotate-180 text-blue-400" : ""
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-64 rounded-2xl border border-[#e8eef8]/15 bg-[#0e1422] p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/40 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Card */}
                  <div className="rounded-xl border border-[#e8eef8]/10 bg-[#141b2b]/60 p-3.5 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 font-bold text-white text-sm shadow-md">
                        {getInitials(currentUser?.fullName || currentUser?.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser?.fullName || "User"}
                        </p>
                        <p className="text-[11px] text-[#e8eef8]/50 truncate">
                          {currentUser?.email}
                        </p>
                        <span
                          className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleConfig.badge}`}
                        >
                          <RoleIcon size={12} />
                          {formatRole(role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigational Quick Links */}
                  <div className="space-y-0.5 border-b border-[#e8eef8]/10 pb-2 mb-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/75 transition hover:bg-[#e8eef8]/5 hover:text-white"
                    >
                      <PiGauge size={16} className="text-blue-400" />
                      <span>My Dashboard</span>
                    </Link>

                    {role !== ROLES.ADMIN && (
                      <Link
                        to="/my-tasks"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/75 transition hover:bg-[#e8eef8]/5 hover:text-white"
                      >
                        <PiCheckSquare size={16} className="text-amber-400" />
                        <span>My Work Queue</span>
                      </Link>
                    )}

                    <Link
                      to="/projects"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/75 transition hover:bg-[#e8eef8]/5 hover:text-white"
                    >
                      <PiFolder size={16} className="text-cyan-400" />
                      <span>Projects Directory</span>
                    </Link>

                    {role === ROLES.ADMIN && (
                      <Link
                        to="/user-management"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/75 transition hover:bg-[#e8eef8]/5 hover:text-white"
                      >
                        <PiUsers size={16} className="text-purple-400" />
                        <span>User Management</span>
                      </Link>
                    )}

                    {role !== ROLES.ADMIN && (
                      <Link
                        to="/calendar"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/75 transition hover:bg-[#e8eef8]/5 hover:text-white"
                      >
                        <PiCalendarBlank size={16} className="text-emerald-400" />
                        <span>Global Calendar</span>
                      </Link>
                    )}
                  </div>

                  {/* System Status info */}
                  <div className="px-3 py-1.5 mb-1.5 flex items-center justify-between text-[10px] text-[#e8eef8]/40">
                    <span>System Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e8eef8]/80 transition hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      <PiSignOut size={16} />
                      <span>Sign Out</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onRequestDeleteAccount();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                    >
                      <PiTrash size={16} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-20 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            ref={searchModalRef}
            className="w-full max-w-xl rounded-2xl border border-[#e8eef8]/20 bg-[#0d1322] shadow-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-[#e8eef8]/10 px-4 py-3.5">
              <PiMagnifyingGlass size={20} className="text-blue-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search projects, tasks, or sections..."
                className="w-full bg-transparent text-sm text-white placeholder-[#e8eef8]/40 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg p-1 text-[#e8eef8]/40 hover:text-white transition"
                >
                  <PiX size={16} />
                </button>
              )}
              <span className="rounded-md border border-[#e8eef8]/10 bg-[#070b14] px-1.5 py-0.5 text-[10px] font-medium text-[#e8eef8]/40">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {searchQuery.trim() === "" ? (
                <div className="p-6 text-center text-xs text-[#e8eef8]/40">
                  <p className="font-medium text-[#e8eef8]/60 mb-1">Quick Search</p>
                  <p>Type any keyword to search across projects, task keys, titles, and pages.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#e8eef8]/40">
                  No matching results found for "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => handleSelectResult(item.link)}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-[#151d2f] group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e8eef8]/10 bg-[#070b14] text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition">
                          <ItemIcon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#e8eef8]/40 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#e8eef8]/30 group-hover:text-blue-400 transition">
                          Jump →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Footer */}
            <div className="border-t border-[#e8eef8]/10 bg-[#090d18] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#e8eef8]/40">
              <span>Navigate with mouse or keyboard</span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
