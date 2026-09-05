import {
  PiSquaresFour,
  PiUsersThree,
  PiListChecks,
  PiUser,
  PiFolder,
} from "react-icons/pi";

export const sidebarItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: PiSquaresFour,
    roles: [
      "Admin",
      "Project Lead",
      "Project Manager",
      "Team Lead",
      "Developer",
      "Tester",
      "QA",
    ],
  },

  {
    label: "Projects",
    path: "/projects",
    icon: PiFolder,
    roles: [
      "Admin",
      "Project Lead",
      "Project Manager",
      "Team Lead",
    ],
  },

  {
    label: "Tasks",
    path: "/tasks",
    icon: PiListChecks,
    roles: [
      "Admin",
      "Project Lead",
      "Project Manager",
      "Team Lead",
    ],
  },

  {
    label: "My Tasks",
    path: "/my-tasks",
    icon: PiListChecks,
    roles: [
      "Team Lead",
      "Developer",
      "Tester",
      "QA",
    ],
  },

  {
    label: "Teams",
    path: "/teams",
    icon: PiUsersThree,
    roles: [
      "Admin",
      "Project Lead",
      "Project Manager",
      "Team Lead",
    ],
  },

  {
    label: "Users",
    path: "/user-management",
    icon: PiUser,
    roles: ["Admin"],
  },
];

export const getSidebarItems = (role) =>
  sidebarItems.filter((item) =>
    item.roles.includes(role)
  );

