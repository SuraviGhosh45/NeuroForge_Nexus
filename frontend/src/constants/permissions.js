import { ROLES, MEMBER_ROLES } from "./roles.js";

/**
 * PERMISSIONS defines the single source of truth for Role-Based Access Control.
 * Each key maps to an array of roles permitted to perform the action, or "ALL".
 */
export const PERMISSIONS = {
  // Project actions
  "project:create": [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
  "project:edit": [ROLES.ADMIN, ROLES.PROJECT_MANAGER],
  "project:delete": [ROLES.ADMIN],
  "project:assign": [ROLES.ADMIN, ROLES.PROJECT_MANAGER],

  // Parent task actions
  "task:create": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD],
  "task:edit": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD],
  "task:delete": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD],
  "task:status": "ALL", // Scope rule decides which tasks user can update

  // Subtask actions
  "subtask:create": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],
  "subtask:edit": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],
  "subtask:delete": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],
  "subtask:assign": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],
  "subtask:reschedule": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],
  "subtask:status": "ALL", // scope rule decides: members only on own items

  // Admin management modules
  "user:manage": [ROLES.ADMIN],
  "team:manage": [ROLES.ADMIN],
  "team:view": [ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD],

  // My Work / Personal items
  "mywork:view": [ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD, ...MEMBER_ROLES],
};

/**
 * Checks if a normalized role has permission for an action (Layer 1 check)
 */
export const hasRolePermission = (role, permission) => {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  if (allowed === "ALL") return true;
  return Array.isArray(allowed) && allowed.includes(role);
};
