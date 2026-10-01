import {
  PiSquaresFour,
  PiUser,
  PiFolder,
  PiCalendarBlank,
  PiBriefcase,
  PiKanban,
  PiRobot,
  PiGear,
} from "react-icons/pi";
import { ROLES, MEMBER_ROLES, normalizeRole } from "../constants/roles.js";

const ALL_ROLES = [
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.PROJECT_LEAD,
  ROLES.TEAM_LEAD,
  ...MEMBER_ROLES,
];

export const sidebarItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: PiSquaresFour,
    roles: ALL_ROLES,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: PiFolder,
    roles: ALL_ROLES,
  },
  {
    label: "Kanban",
    path: "/kanban",
    icon: PiKanban,
    roles: ALL_ROLES,
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
  {
    label: "AI Assistant",
    path: "/ai-assistant",
    icon: PiRobot,
    roles: ALL_ROLES,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: PiGear,
    roles: ALL_ROLES,
  },
];

export const getSidebarItems = (role) => {
  const normalized = normalizeRole(role);
  return sidebarItems.filter((item) =>
    item.roles.map(normalizeRole).includes(normalized)
  );
};