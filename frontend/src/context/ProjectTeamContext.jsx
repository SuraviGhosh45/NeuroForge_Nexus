import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../services/api.js";

const API_BASE = "http://localhost:8080/api/projects";
const ProjectTeamContext = createContext(null);
export const MEMBER_STATUSES = ["Active", "Inactive", "In Meeting"];

const normalizeMember = (member) => ({
  id: member.id,
  userId: Number(member.userId ?? member.user?.id ?? member.id),
  projectRole: member.projectRole ?? member.role ?? "Developer",
  status: MEMBER_STATUSES.includes(member.status) ? member.status : "Active",
  fullName: member.fullName ?? member.user?.fullName ?? "",
  email: member.email ?? member.user?.email ?? "",
});

export const SEED_PROJECT_MEMBERS = {
  "1": [
    { id: 1, userId: 2, projectRole: "Project Manager", status: "Active", fullName: "Sarah Jenkins", email: "pm@neuroforge.io" },
    { id: 2, userId: 3, projectRole: "Project Lead", status: "Active", fullName: "David Chen", email: "lead@neuroforge.io" },
    { id: 3, userId: 4, projectRole: "Team Lead", status: "Active", fullName: "Elena Rostova", email: "teamlead@neuroforge.io" },
    { id: 4, userId: 5, projectRole: "Developer", status: "Active", fullName: "Marcus Vance", email: "dev@neuroforge.io" },
    { id: 5, userId: 6, projectRole: "Tester", status: "Active", fullName: "Aisha Patel", email: "tester@neuroforge.io" },
  ],
  "2": [
    { id: 6, userId: 2, projectRole: "Project Manager", status: "Active", fullName: "Sarah Jenkins", email: "pm@neuroforge.io" },
    { id: 7, userId: 3, projectRole: "Project Lead", status: "Active", fullName: "David Chen", email: "lead@neuroforge.io" },
    { id: 8, userId: 5, projectRole: "Developer", status: "Active", fullName: "Marcus Vance", email: "dev@neuroforge.io" },
    { id: 9, userId: 7, projectRole: "QA", status: "In Meeting", fullName: "Liam O'Connor", email: "qa@neuroforge.io" },
  ],
  "3": [
    { id: 10, userId: 1, projectRole: "Admin", status: "Active", fullName: "Alexander Wright", email: "admin@neuroforge.io" },
    { id: 11, userId: 3, projectRole: "Project Lead", status: "Active", fullName: "David Chen", email: "lead@neuroforge.io" },
    { id: 12, userId: 5, projectRole: "Developer", status: "Active", fullName: "Marcus Vance", email: "dev@neuroforge.io" },
  ],
};

export const ProjectTeamProvider = ({ children }) => {
  const [projectTeams, setProjectTeams] = useState({});

  const loadProjectMembers = useCallback(async (projectId) => {
    if (!projectId) return [];
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    GET http://localhost:8080/api/projects/{projectId}/members
         Description: Retrieve members assigned to a specific project.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK -> [ { "id": 1, "userId": 2, "projectRole": "Developer", "status": "Active", "fullName": "Alice Smith" } ]
         cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/projects/1/members
         ========================================================================== */
      const { data } = await axios.get(`${API_BASE}/${projectId}/members`);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeMember);
      setProjectTeams((prev) => ({ ...prev, [String(projectId)]: normalized }));
      return normalized;
    } catch (error) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         If Spring Boot backend is offline or unreachable, hydrate with seed
         project members so team members can evaluate team member lists without errors.
         ========================================================================== */
      const fallback = (SEED_PROJECT_MEMBERS[String(projectId)] || []).map(normalizeMember);
      setProjectTeams((prev) => ({ ...prev, [String(projectId)]: fallback }));
      return fallback;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(API_BASE);
        const projects = Array.isArray(data) ? data : [];
        if (projects.length > 0) {
          await Promise.all(projects.map((p) => loadProjectMembers(p.id)));
        } else {
          // Hydrate from SEED_PROJECT_MEMBERS if no projects returned
          const initial = {};
          Object.entries(SEED_PROJECT_MEMBERS).forEach(([projId, members]) => {
            initial[String(projId)] = members.map(normalizeMember);
          });
          setProjectTeams((prev) => (Object.keys(prev).length > 0 ? prev : initial));
        }
      } catch (error) {
        console.warn("Backend offline: Hydrating project teams from seed data:", error.message);
        const initial = {};
        Object.entries(SEED_PROJECT_MEMBERS).forEach(([projId, members]) => {
          initial[String(projId)] = members.map(normalizeMember);
        });
        setProjectTeams((prev) => (Object.keys(prev).length > 0 ? prev : initial));
      }
    };
    load();
  }, [loadProjectMembers]);

  const getProjectMembers = useCallback((projectId) => projectTeams[String(projectId)] || [], [projectTeams]);
  const isUserAssignedToProject = useCallback((userId) => Object.values(projectTeams).some((members) => members.some((m) => String(m.userId) === String(userId))), [projectTeams]);
  const getUserProjectId = useCallback((userId) => {
    const entry = Object.entries(projectTeams).find(([, members]) => members.some((m) => String(m.userId) === String(userId)));
    return entry ? entry[0] : null;
  }, [projectTeams]);

  const addProjectMember = async (projectId, userId, projectRole) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/projects/{projectId}/members
         Description: Assign a team member to a project with a role.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "userId": 2, "projectRole": "Developer", "status": "Active" }
         Response:    201/200 OK -> { "id": 1, "userId": 2, "projectRole": "Developer", "status": "Active" }
         cURL:        curl -X POST http://localhost:8080/api/projects/1/members -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"userId":2,"projectRole":"Developer","status":"Active"}'
         ========================================================================== */
      const { data } = await axios.post(`${API_BASE}/${projectId}/members`, { userId: Number(userId), projectRole, status: "Active" });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         If backend API is offline, optimistically assign member to project team
         in local state so assignment immediately reflects across User Management and Workspace.
         ========================================================================== */
      const newMember = normalizeMember({
        id: Date.now(),
        userId: Number(userId),
        projectRole,
        status: "Active",
      });
      setProjectTeams((prev) => {
        const existing = prev[String(projectId)] || [];
        const filtered = existing.filter((m) => String(m.userId) !== String(userId));
        return {
          ...prev,
          [String(projectId)]: [...filtered, newMember],
        };
      });
      return { success: true, data: newMember };
    }
  };

  const updateProjectMember = async (projectId, userId, projectRole) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PUT http://localhost:8080/api/projects/{projectId}/members/{userId}
         Description: Update a user's role assignment inside a project.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "userId": 2, "projectRole": "Team Lead" }
         Response:    200 OK -> { "id": 1, "userId": 2, "projectRole": "Team Lead", "status": "Active" }
         cURL:        curl -X PUT http://localhost:8080/api/projects/1/members/2 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"userId":2,"projectRole":"Team Lead"}'
         ========================================================================== */
      const { data } = await axios.put(`${API_BASE}/${projectId}/members/${userId}`, { userId: Number(userId), projectRole });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         ========================================================================== */
      setProjectTeams((prev) => {
        const existing = prev[String(projectId)] || [];
        return {
          ...prev,
          [String(projectId)]: existing.map((m) =>
            String(m.userId) === String(userId) ? { ...m, projectRole } : m
          ),
        };
      });
      return { success: true, data: { userId, projectRole } };
    }
  };

  const updateProjectMemberStatus = async (projectId, userId, status) => {
    if (!MEMBER_STATUSES.includes(status)) return { success: false, message: "Invalid member status." };
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PATCH http://localhost:8080/api/projects/{projectId}/members/{userId}/status
         Description: Update a member's working status inside a project ("Active", "Inactive", "In Meeting").
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "status": "In Meeting" }
         Response:    200 OK -> { "id": 1, "userId": 2, "status": "In Meeting" }
         cURL:        curl -X PATCH http://localhost:8080/api/projects/1/members/2/status -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"status":"In Meeting"}'
         ========================================================================== */
      const { data } = await axios.patch(`${API_BASE}/${projectId}/members/${userId}/status`, { status });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         ========================================================================== */
      setProjectTeams((prev) => {
        const existing = prev[String(projectId)] || [];
        return {
          ...prev,
          [String(projectId)]: existing.map((m) =>
            String(m.userId) === String(userId) ? { ...m, status } : m
          ),
        };
      });
      return { success: true, data: { userId, status } };
    }
  };

  const removeProjectMember = async (projectId, userId) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/projects/{projectId}/members/{userId}
         Description: Unassign / remove a user from a project team.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/projects/1/members/2 -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.delete(`${API_BASE}/${projectId}/members/${userId}`);
      await loadProjectMembers(projectId);
      return { success: true };
    } catch (error) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         ========================================================================== */
      setProjectTeams((prev) => {
        const existing = prev[String(projectId)] || [];
        return {
          ...prev,
          [String(projectId)]: existing.filter((m) => String(m.userId) !== String(userId)),
        };
      });
      return { success: true };
    }
  };

  const clearProjectTeam = (projectId) => setProjectTeams((prev) => {
    const next = { ...prev };
    delete next[String(projectId)];
    return next;
  });

  const value = useMemo(() => ({
    projectTeams,
    getProjectMembers,
    isUserAssignedToProject,
    getUserProjectId,
    addProjectMember,
    updateProjectMember,
    updateProjectMemberStatus,
    removeProjectMember,
    clearProjectTeam,
    MEMBER_STATUSES,
    loadProjectMembers,
  }), [projectTeams, getProjectMembers, isUserAssignedToProject, getUserProjectId, loadProjectMembers]);

  return <ProjectTeamContext.Provider value={value}>{children}</ProjectTeamContext.Provider>;
};

export const useProjectTeam = () => useContext(ProjectTeamContext);
