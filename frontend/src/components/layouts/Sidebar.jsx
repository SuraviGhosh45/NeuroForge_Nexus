import { NavLink } from "react-router-dom";
import { getSidebarItems } from "../../config/sidebarConfig.js";

const Sidebar = ({ role }) => {
  const items = getSidebarItems(role);

  return (
    <aside className="w-64 shrink-0 border-r border-[#e8eef8]/10 bg-[#0a0e17] px-3 py-6 shadow-xl">
      <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/40">
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
                `group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10"
                    : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                }`
              }
            >
              <Icon size={19} className="shrink-0 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;