import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../services/api.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
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
            const { data } = await axios.get(`${API_BASE}/projects/${projectId}/members`);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeMember);
      setProjectTeams((prev) => ({ ...prev, [String(projectId)]: normalized }));
      return normalized;
    } catch (error) {
            const fallback = (SEED_PROJECT_MEMBERS[String(projectId)] || []).map(normalizeMember);
      setProjectTeams((prev) => ({ ...prev, [String(projectId)]: fallback }));
      return fallback;
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/projects`);
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
            const { data } = await axios.post(`${API_BASE}/projects/${projectId}/members`, { userId: Number(userId), projectRole, status: "Active" });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
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
            const { data } = await axios.put(`${API_BASE}/projects/${projectId}/members/${userId}`, { userId: Number(userId), projectRole });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
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
            const { data } = await axios.patch(`${API_BASE}/projects/${projectId}/members/${userId}/status`, { status });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
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
            await axios.delete(`${API_BASE}/projects/${projectId}/members/${userId}`);
      await loadProjectMembers(projectId);
      return { success: true };
    } catch (error) {
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

  const syncUserStatusAcrossTeams = (userId, status) => {
    setProjectTeams((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach((projectId) => {
        next[projectId] = next[projectId].map((m) => {
          if (String(m.userId) === String(userId)) {
            changed = true;
            return { ...m, status };
          }
          return m;
        });
      });
      return changed ? next : prev;
    });
  };

  const value = useMemo(() => ({
    projectTeams,
    getProjectMembers,
    isUserAssignedToProject,
    getUserProjectId,
    addProjectMember,
    updateProjectMember,
    updateProjectMemberStatus,
    syncUserStatusAcrossTeams,
    removeProjectMember,
    clearProjectTeam,
    MEMBER_STATUSES,
    loadProjectMembers,
  }), [projectTeams, getProjectMembers, isUserAssignedToProject, getUserProjectId, loadProjectMembers]);

  return <ProjectTeamContext.Provider value={value}>{children}</ProjectTeamContext.Provider>;
};

export const useProjectTeam = () => useContext(ProjectTeamContext);
