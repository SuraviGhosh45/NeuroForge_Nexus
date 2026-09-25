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

    // deleteAccount() already clears the session; nothing else to do here.
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#070b14] text-[#e8eef8]">
      {/* Modern Top Navbar */}
      <Navbar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onRequestDeleteAccount={() => {
          setDeleteError("");
          setConfirmDeleteOpen(true);
        }}
      />

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