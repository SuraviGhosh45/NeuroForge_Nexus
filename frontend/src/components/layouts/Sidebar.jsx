import { NavLink } from "react-router-dom";
import { getSidebarItems } from "../../config/sidebarConfig.js";

const Sidebar = ({ role }) => {
  const items = getSidebarItems(role);

  return (
    <aside className="w-56 shrink-0 border-r border-[#e8eef8]/10 bg-[#07111f] px-3 py-6">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#e8eef8]/10 font-medium text-[#e8eef8]"
                    : "text-[#e8eef8]/60 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;