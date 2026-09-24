export const ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  PROJECT_LEAD: "project_lead",
  TEAM_LEAD: "team_lead",
  DEVELOPER: "developer",
  TESTER: "tester",
  QA: "qa",
  TEAM_MEMBER: "team_member", // legacy backend value
};

export const MEMBER_ROLES = [
  ROLES.DEVELOPER,
  ROLES.TESTER,
  ROLES.QA,
];

export const ALL_ROLES = [
  ROLES.ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.PROJECT_LEAD,
  ROLES.TEAM_LEAD,
  ROLES.DEVELOPER,
  ROLES.TESTER,
  ROLES.QA,
];

export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return ROLES.DEVELOPER;

  const cleaned = role.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (cleaned) {
    case "admin": return ROLES.ADMIN;
    case "project_manager":
    case "manager":
    case "pm": return ROLES.PROJECT_MANAGER;
    case "project_lead":
    case "lead":
    case "pl": return ROLES.PROJECT_LEAD;
    case "team_lead":
    case "tl": return ROLES.TEAM_LEAD;
    case "developer":
    case "dev": return ROLES.DEVELOPER;
    case "tester":
    case "test": return ROLES.TESTER;
    case "qa":
    case "qa_specialist":
    case "quality_assurance": return ROLES.QA;
    case "team_member":
    case "member": return ROLES.DEVELOPER;
    default: return ROLES.DEVELOPER;
  }
};

export const formatRole = (role) => {
  switch (normalizeRole(role)) {
    case ROLES.ADMIN: return "Admin";
    case ROLES.PROJECT_MANAGER: return "Project Manager";
    case ROLES.PROJECT_LEAD: return "Project Lead";
    case ROLES.TEAM_LEAD: return "Team Lead";
    case ROLES.DEVELOPER: return "Developer";
    case ROLES.TESTER: return "Tester";
    case ROLES.QA: return "QA Specialist";
    default: return "Developer";
  }
};
