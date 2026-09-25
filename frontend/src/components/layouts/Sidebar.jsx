import { NavLink } from "react-router-dom";
import { getSidebarItems } from "../../config/sidebarConfig.js";
import { PiCheckCircle, PiSparkle } from "react-icons/pi";

const Sidebar = ({ role }) => {
  const items = getSidebarItems(role);

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 flex flex-col justify-between border-r border-[#e8eef8]/10 bg-[#070b14]/70 backdrop-blur-xl px-3.5 py-5 shadow-2xl transition-all">
      <div>
        <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-[#e8eef8]/40">
          Navigation
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10 font-semibold"
                      : "text-[#e8eef8]/65 hover:border-[#e8eef8]/10 hover:bg-[#e8eef8]/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Info Card */}
      <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d1320]/60 p-3 text-xs">
        <div className="flex items-center gap-2 text-white font-medium mb-1">
          <PiSparkle size={15} className="text-blue-400" />
          <span>NeuroForge SDLC</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#e8eef8]/40">
          <span>Enterprise v2.4</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;