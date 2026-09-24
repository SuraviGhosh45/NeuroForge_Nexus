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

export const ProjectTeamProvider = ({ children }) => {
  const [projectTeams, setProjectTeams] = useState({});

  const loadProjectMembers = useCallback(async (projectId) => {
    if (!projectId) return [];
    try {
      const { data } = await axios.get(`${API_BASE}/${projectId}/members`);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeMember);
      setProjectTeams((prev) => ({ ...prev, [String(projectId)]: normalized }));
      return normalized;
    } catch (error) {
      console.warn("Project members could not be loaded:", error.message);
      return [];
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(API_BASE);
        const projects = Array.isArray(data) ? data : [];
        await Promise.all(projects.map((p) => loadProjectMembers(p.id)));
      } catch (error) {
        console.warn("Project list could not be loaded for team hydration:", error.message);
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
      const { data } = await axios.post(`${API_BASE}/${projectId}/members`, { userId: Number(userId), projectRole, status: "Active" });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to add project member." };
    }
  };

  const updateProjectMember = async (projectId, userId, projectRole) => {
    try {
      const { data } = await axios.put(`${API_BASE}/${projectId}/members/${userId}`, { userId: Number(userId), projectRole });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update project member." };
    }
  };

  const updateProjectMemberStatus = async (projectId, userId, status) => {
    if (!MEMBER_STATUSES.includes(status)) return { success: false, message: "Invalid member status." };
    try {
      const { data } = await axios.patch(`${API_BASE}/${projectId}/members/${userId}/status`, { status });
      await loadProjectMembers(projectId);
      return { success: true, data: normalizeMember(data) };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update member status." };
    }
  };

  const removeProjectMember = async (projectId, userId) => {
    try {
      await axios.delete(`${API_BASE}/${projectId}/members/${userId}`);
      await loadProjectMembers(projectId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to remove project member." };
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
