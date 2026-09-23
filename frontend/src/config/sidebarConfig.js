import {
  PiSquaresFour,
  PiUser,
  PiFolder,
  PiCalendarBlank,
  PiBriefcase,
} from "react-icons/pi";
import { ROLES, MEMBER_ROLES, normalizeRole } from "../constants/roles.js";

export const sidebarItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: PiSquaresFour,
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
      ...MEMBER_ROLES,
    ],
  },
  {
    label: "Projects",
    path: "/projects",
    icon: PiFolder,
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
      ...MEMBER_ROLES,
    ],
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: PiCalendarBlank,
    roles: [
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
      ...MEMBER_ROLES,
    ],
  },
  {
    label: "My Work",
    path: "/my-tasks",
    icon: PiBriefcase,
    roles: [
      // NOTE: Admin NEVER has My Work
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
      ...MEMBER_ROLES,
    ],
  },
  {
    label: "Users",
    path: "/user-management",
    icon: PiUser,
    roles: [
      ROLES.ADMIN,
    ],
  },
];

export const getSidebarItems = (role) => {
  const normalized = normalizeRole(role);
  return sidebarItems.filter((item) =>
    item.roles.map(normalizeRole).includes(normalized)
  );
};