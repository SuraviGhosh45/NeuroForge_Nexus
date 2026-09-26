import { NavLink } from "react-router-dom";
import { getSidebarItems } from "../../config/sidebarConfig.js";
import { PiSparkle } from "react-icons/pi";

const Sidebar = ({ role }) => {
  const items = getSidebarItems(role);

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-slate-700 bg-[#172033] px-3.5 py-5 shadow-lg shadow-slate-900/10 transition-all">
      <div>
        <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  `group flex items-center gap-3.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-blue-400/30 bg-blue-500/15 text-blue-300 shadow-sm"
                      : "border-transparent text-slate-300 hover:border-slate-600 hover:bg-[#24324a] hover:text-white"
                  }`
                }
              >
                <Icon
                  size={19}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-slate-600 bg-[#24324a] p-3 text-xs">
        <div className="mb-1 flex items-center gap-2 font-medium text-white">
          <PiSparkle size={15} className="text-blue-400" />
          <span>NeuroForge SDLC</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Enterprise v2.4</span>

          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;