import { NavLink } from "react-router-dom";
import { getSidebarItems } from "../../config/sidebarConfig.js";
import { PiSparkle, PiX } from "react-icons/pi";

const Sidebar = ({ role, isOpen = true, onClose }) => {
  const items = getSidebarItems(role);

  return (
    <aside
      className={`fixed inset-y-0 left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#172033] px-3.5 py-5 shadow-2xl md:shadow-xs dark:shadow-lg dark:shadow-slate-900/10 transition-all duration-300 md:sticky md:z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
      }`}
    >
      <div>
        <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Close navigation"
          >
            <PiX size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3.5 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "border-blue-200 bg-blue-50/90 text-slate-900 font-semibold shadow-xs dark:border-blue-400/30 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-transparent text-slate-700 font-medium hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-[#24324a] dark:hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white"
                      }`}
                    />

                    <span className={isActive ? "text-slate-900 dark:text-blue-300 font-semibold" : ""}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-[#24324a] p-3 text-xs transition-colors">
        <div className="mb-1 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <PiSparkle size={15} className="text-blue-600 dark:text-blue-400" />
          <span>NeuroForge SDLC</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400">
          <span className="font-medium">Enterprise v2.4</span>

          <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
            Live
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;