import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import ChatBot from "../Chatbot/Chatbot.jsx";

const DashboardLayout = ({ children }) => {
  const { currentUser, deleteAccount } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = sessionStorage.getItem("sidebarOpen");
    return saved === null ? true : saved === "true";
  });

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
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#e8eef7] text-[#172033]">
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onRequestDeleteAccount={() => {
          setDeleteError("");
          setConfirmDeleteOpen(true);
        }}
      />

      <div className="flex">
        {sidebarOpen && <Sidebar role={currentUser.role} />}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600">
              !
            </div>

            <h2 className="text-base font-semibold text-[#172033]">
              Delete your account?
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This permanently deletes your account. You will be removed from
              all projects and teams, and this cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
    </div>
  );
};

export default DashboardLayout;