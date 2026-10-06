import {
  PiSquaresFour,
  PiUsersThree,
  PiListChecks,
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
    label: "Tasks",
    path: "/tasks",
    icon: PiListChecks,
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
      // NOTE: Members do NOT have Tasks menu item; they use My Work
    ],
  },
  {
    label: "Calendar",
    path: "/calendar",
    icon: PiCalendarBlank,
    roles: [
      ROLES.ADMIN,
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
    label: "Teams",
    path: "/teams",
    icon: PiUsersThree,
    roles: [
      ROLES.ADMIN,
      ROLES.PROJECT_MANAGER,
      ROLES.PROJECT_LEAD,
      ROLES.TEAM_LEAD,
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
