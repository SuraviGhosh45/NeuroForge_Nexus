import { PiList } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";

const DashboardLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  // ProtectedRoute already guards against this, but stay safe
  // in case this layout is ever reused elsewhere.
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#07111f] text-[#e8eef8]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e8eef8]/10 bg-[#07111f] px-6 py-4">
        <div className="flex items-center gap-4">
          <PiList
            size={24}
            className="cursor-pointer text-[#e8eef8]/70 transition hover:text-[#e8eef8]"
          />
          <h1 className="text-xl font-semibold text-[#e8eef8]">NeuroForge Nexus</h1>
        </div>

        <div className="flex items-center gap-5">
          <span className="rounded-md border border-[#e8eef8]/15 px-3 py-2 text-sm text-[#e8eef8]/80">
            {currentUser.role}
          </span>

          <FaRegBell size={20} className="cursor-pointer text-[#e8eef8]/70" />
          <CgProfile size={24} className="cursor-pointer text-[#e8eef8]/70" />

          <button
            onClick={logout}
            className="rounded-md border border-[#e8eef8]/15 px-3 py-2 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + page content */}
      <div className="flex">
        <Sidebar role={currentUser.role} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;