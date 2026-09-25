import { PiList, PiSignOut, PiTrash, PiCaretDown } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, formatRole, normalizeRole } from "../../constants/roles.js";
import Sidebar from "./Sidebar.jsx";
import ChatBot from "../Chatbot/Chatbot.jsx";

const ROLE_STYLES = {
  [ROLES.ADMIN]: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  [ROLES.PROJECT_MANAGER]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [ROLES.PROJECT_LEAD]: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  [ROLES.TEAM_LEAD]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [ROLES.DEVELOPER]: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  [ROLES.TESTER]: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  [ROLES.QA]: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  [ROLES.UNASSIGNED]: "bg-gray-500/10 text-gray-300 border-gray-500/30",
};

const DashboardLayout = ({ children }) => {
  const { currentUser, logout, deleteAccount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = sessionStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const nextOpen = !open;
      sessionStorage.setItem("sidebarOpen", String(nextOpen));
      return nextOpen;
    });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    const result = await deleteAccount();
    setDeleting(false);

    if (!result.success) {
      setDeleteError(result.message);
      return;
    }

    // deleteAccount() already clears the session; nothing else to do here.
  };

  if (!currentUser) return null;

  const currentRole = normalizeRole(currentUser.role);

  const badgeStyle =
    ROLE_STYLES[currentRole] ||
    "bg-gray-500/10 text-gray-300 border-gray-500/30";

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
          <span
            className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold tracking-wide ${badgeStyle}`}
          >
            {formatRole(currentRole)}
          </span>

          <button
            type="button"
            className="rounded-lg p-2 text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
            title="Notifications"
          >
            <FaRegBell size={17} />
          </button>

          {/* Account dropdown */}
          <div className="relative border-l border-[#e8eef8]/10 pl-2">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-[#e8eef8]/5"
            >
              <CgProfile size={24} className="text-[#e8eef8]/80" />

              <div className="hidden text-left md:block">
                <p className="text-xs font-medium leading-tight text-white">
                  {currentUser.fullName || "User"}
                </p>

                <p className="max-w-[120px] truncate text-[10px] text-[#e8eef8]/40">
                  {currentUser.email}
                </p>
              </div>

              <PiCaretDown
                size={14}
                className={`text-[#e8eef8]/40 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#e8eef8]/10 bg-[#0f1422] py-1.5 shadow-xl">
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                >
                  <PiSignOut size={16} />
                  Logout
                </button>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setDeleteError("");
                    setConfirmDeleteOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 transition hover:bg-rose-500/10"
                >
                  <PiTrash size={16} />
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex">
        {sidebarOpen && <Sidebar role={currentUser.role} />}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Delete-account confirmation */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#e8eef8]/10 bg-[#0f1422] p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-white">Delete your account?</h2>
            <p className="mt-2 text-sm text-[#e8eef8]/60">
              This permanently deletes your account. You will be removed from all
              projects and teams, and this cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-[#e8eef8]/10 px-3.5 py-1.5 text-xs text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-lg bg-rose-500/90 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global floating chatbot */}
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;