import { ROLES, normalizeRole } from "../constants/roles.js";

/**
 * Normalizes user ID for safe comparison
 */
const matchId = (a, b) => {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return String(a) === String(b);
};

/**
 * Checks if user is assigned to a project directly or via projectTeams
 */
export const isUserInProjectTeams = (userId, projectId, projectTeams = {}) => {
  if (!projectId || !userId) return false;
  const members = projectTeams[String(projectId)] || [];
  return members.some((m) => matchId(m.userId, userId));
};

/**
 * Layer 2 Data Scope Validator: Projects
 */
export const canAccessProject = (user, project, projectTeams = {}, teams = []) => {
  if (!user || !project) return false;
  const role = normalizeRole(user.role);

  // 1. Admin sees all projects
  if (role === ROLES.ADMIN) return true;

  // 2. Project Manager sees projects they manage
  if (role === ROLES.PROJECT_MANAGER) {
    const managerId = project.projectManager?.id ?? project.projectManagerId ?? project.managerId;
    return matchId(managerId, user.id);
  }

  // 3. Project Lead sees projects they lead
  if (role === ROLES.PROJECT_LEAD) {
    const leadId = project.projectLead?.id ?? project.projectLeadId ?? project.leadId;
    return matchId(leadId, user.id);
  }

  // 4. Team Lead sees projects linked to their team or where they are assigned
  if (role === ROLES.TEAM_LEAD) {
    const projectTeamId = project.team?.id ?? project.teamId;
    if (user.teamId && matchId(projectTeamId, user.teamId)) return true;

    // Check if team lead's managed team matches the project's team
    const ledTeam = teams.find((t) => matchId(t.leadId, user.id));
    if (ledTeam && matchId(projectTeamId, ledTeam.id)) return true;

    // Check project teams table
    const members = projectTeams[String(project.id)] || [];
    const isLeadInProject = members.some(
      (m) => matchId(m.userId, user.id) && (m.projectRole === "Team Lead" || m.projectRole === "Lead")
    );
    if (isLeadInProject) return true;

    // Fallback: assigned to project
    return isUserInProjectTeams(user.id, project.id, projectTeams);
  }

  // 5. Members (Developer, Tester, QA) see projects they are assigned to
  const projectTeamId = project.team?.id ?? project.teamId;
  if (user.teamId && matchId(projectTeamId, user.teamId)) return true;

  return isUserInProjectTeams(user.id, project.id, projectTeams);
};

/**
 * Layer 2 Data Scope Validator: Parent Tasks
 */
export const canAccessTask = (user, task, project, projectTeams = {}, teams = [], subtasks = []) => {
  if (!user || !task) return false;
  const role = normalizeRole(user.role);

  if (role === ROLES.ADMIN) return true;

  if (role === ROLES.PROJECT_MANAGER || role === ROLES.PROJECT_LEAD) {
    return project ? canAccessProject(user, project, projectTeams, teams) : true;
  }

  const taskAssigneeId = task.assignee?.id ?? task.assigneeId;

  if (role === ROLES.TEAM_LEAD) {
    const taskTeamId = task.assignedTeamId ?? task.teamId;
    if (user.teamId && matchId(taskTeamId, user.teamId)) return true;
    if (matchId(taskAssigneeId, user.id)) return true;
    // Or if task is in accessible project
    return project ? canAccessProject(user, project, projectTeams, teams) : true;
  }

  // Member (Dev, Tester, QA)
  if (matchId(taskAssigneeId, user.id)) return true;

  // Has subtask assigned to this user under this task
  const hasMySubtask = (subtasks || []).some(
    (st) => matchId(st.taskId, task.id) && matchId(st.assigneeId ?? st.assignee?.id, user.id)
  );
  if (hasMySubtask) return true;

  return project ? canAccessProject(user, project, projectTeams, teams) : false;
};

/**
 * Layer 2 Data Scope Validator: Subtasks
 */
export const canAccessSubtask = (user, subtask, parentTask, project, projectTeams = {}, teams = []) => {
  if (!user || !subtask) return false;
  const role = normalizeRole(user.role);

  if (role === ROLES.ADMIN) return true;

  if (role === ROLES.PROJECT_MANAGER || role === ROLES.PROJECT_LEAD) {
    return project ? canAccessProject(user, project, projectTeams, teams) : true;
  }

  const subtaskAssigneeId = subtask.assignee?.id ?? subtask.assigneeId;

  if (role === ROLES.TEAM_LEAD) {
    const subtaskTeamId = subtask.teamId ?? subtask.assignedTeamId;
    if (user.teamId && matchId(subtaskTeamId, user.teamId)) return true;
    if (matchId(subtaskAssigneeId, user.id)) return true;
    return project ? canAccessProject(user, project, projectTeams, teams) : true;
  }

  // Member sees only their own subtask
  return matchId(subtaskAssigneeId, user.id);
};

/**
 * Can user reschedule a subtask? (Admin, PM, PL, TL)
 */
export const canRescheduleSubtask = (user, subtask, parentTask, project, projectTeams = {}, teams = []) => {
  if (!user || !subtask) return false;
  const role = normalizeRole(user.role);

  if ([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD].includes(role)) return true;
  if (role === ROLES.TEAM_LEAD) {
    return canAccessSubtask(user, subtask, parentTask, project, projectTeams, teams);
  }
  return false;
};

/**
 * Can user drag/move a subtask on Kanban?
 */
export const canMoveSubtaskKanban = (user, subtask, parentTask, project, projectTeams = {}, teams = []) => {
  if (!user || !subtask) return false;
  const role = normalizeRole(user.role);

  // Admin, PM, Project Lead can move any card
  if ([ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD].includes(role)) return true;

  // Team Lead can move cards of own team
  if (role === ROLES.TEAM_LEAD) {
    return canAccessSubtask(user, subtask, parentTask, project, projectTeams, teams);
  }

  // Members can ONLY move their own cards
  const subtaskAssigneeId = subtask.assignee?.id ?? subtask.assigneeId;
  return matchId(subtaskAssigneeId, user.id);
};
