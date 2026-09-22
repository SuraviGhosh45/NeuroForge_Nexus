export const ROLES = {
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
  PROJECT_LEAD: "project_lead",
  TEAM_LEAD: "team_lead",
  DEVELOPER: "developer",
  TESTER: "tester",
  QA: "qa",
};

export const MEMBER_ROLES = [
  ROLES.DEVELOPER,
  ROLES.TESTER,
  ROLES.QA,
];

/**
 * Normalizes any role input (e.g. "Admin", "ADMIN", "Project Manager", "project_manager")
 * to the canonical lowercase underscore format (e.g. "admin", "project_manager").
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return ROLES.DEVELOPER;
  const cleaned = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  
  if (cleaned === "admin") return ROLES.ADMIN;
  if (cleaned === "project_manager" || cleaned === "manager" || cleaned === "pm") return ROLES.PROJECT_MANAGER;
  if (cleaned === "project_lead" || cleaned === "lead" || cleaned === "pl") return ROLES.PROJECT_LEAD;
  if (cleaned === "team_lead" || cleaned === "tl") return ROLES.TEAM_LEAD;
  if (cleaned === "developer" || cleaned === "dev") return ROLES.DEVELOPER;
  if (cleaned === "tester" || cleaned === "test") return ROLES.TESTER;
  if (cleaned === "qa") return ROLES.QA;
  
  return cleaned;
};

/**
 * Human-readable display label for a role
 */
export const formatRole = (role) => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.ADMIN:
      return "Admin";
    case ROLES.PROJECT_MANAGER:
      return "Project Manager";
    case ROLES.PROJECT_LEAD:
      return "Project Lead";
    case ROLES.TEAM_LEAD:
      return "Team Lead";
    case ROLES.DEVELOPER:
      return "Developer";
    case ROLES.TESTER:
      return "Tester";
    case ROLES.QA:
      return "QA Specialist";
    default:
      return role || "Member";
  }
};