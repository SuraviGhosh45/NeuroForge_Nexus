import { PiList, PiSignOut } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, formatRole, normalizeRole } from "../../constants/roles.js";
import Sidebar from "./Sidebar.jsx";

const ROLE_STYLES = {
  [ROLES.ADMIN]: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  [ROLES.PROJECT_MANAGER]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [ROLES.PROJECT_LEAD]: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  [ROLES.TEAM_LEAD]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [ROLES.DEVELOPER]: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  [ROLES.TESTER]: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  [ROLES.QA]: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
};

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = sessionStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const nextOpen = !open;
      sessionStorage.setItem("sidebarOpen", String(nextOpen));
      return nextOpen;
    });
  };

  if (!currentUser) return null;

  const currentRole = normalizeRole(currentUser.role);
  const badgeStyle = ROLE_STYLES[currentRole] || "bg-gray-500/10 text-gray-300 border-gray-500/30";

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8eef8]">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#e8eef8]/10 bg-[#0a0e17]/80 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Hide navigation" : "Show navigation"}
            className="rounded-lg p-1.5 text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
          >
            <PiList size={22} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[#e8eef8]">
                NeuroForge Nexus
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-[#e8eef8]/40">
                SDLC Management Suite
              </span>
            </div>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-4">
          {/* Active Role Badge */}
          <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold tracking-wide ${badgeStyle}`}>
            {formatRole(currentRole)}
          </span>

          <button
            type="button"
            className="rounded-lg p-2 text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
            title="Notifications"
          >
            <FaRegBell size={17} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-[#e8eef8]/10">
            <CgProfile size={24} className="text-[#e8eef8]/80" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-white leading-tight">
                {currentUser.fullName || "User"}
              </p>
              <p className="text-[10px] text-[#e8eef8]/40 truncate max-w-[120px]">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8eef8]/10 bg-[#0f1422] px-3 py-1.5 text-xs text-[#e8eef8]/70 transition hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
          >
            <PiSignOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex">
        {sidebarOpen && <Sidebar role={currentUser.role} />}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;