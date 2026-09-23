import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { canAccessProject } from "../utils/access.js";

const ProjectContext = createContext(null);

const API_BASE = "http://localhost:8080/api/projects";

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_BASE);
      setProjects(response.data);
    } catch (err) {
      console.warn("Failed to fetch projects from backend:", err.message);
      setError(err.response?.data?.message || "Projects could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const buildPayload = (formData) => ({
    name: formData.name,
    description: formData.description,
    code: formData.code,
    projectLeadId: formData.projectLead ? Number(formData.projectLead) : null,
    projectManagerId: formData.projectManager ? Number(formData.projectManager) : null,
    teamId: formData.teamId ? Number(formData.teamId) : null,
    status: formData.status,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
  });

  const createProject = async (formData) => {
    try {
      const response = await axios.post(API_BASE, buildPayload(formData));
      setProjects((prev) => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      // Fallback local creation
      const newProj = {
        id: Date.now(),
        ...formData,
      };
      setProjects((prev) => [...prev, newProj]);
      return { success: true, data: newProj };
    }
  };

  const updateProject = async (formData) => {
    try {
      const response = await axios.put(`${API_BASE}/${formData.id}`, buildPayload(formData));
      setProjects((prev) =>
        prev.map((project) => (project.id === formData.id ? response.data : project))
      );
      return { success: true, data: response.data };
    } catch (err) {
      // Fallback local update
      setProjects((prev) =>
        prev.map((project) => (project.id === formData.id ? { ...project, ...formData } : project))
      );
      return { success: true };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${API_BASE}/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      return { success: true };
    } catch (err) {
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      return { success: true };
    }
  };

  const getProjectById = (projectId) => {
    return projects.find((project) => String(project.id) === String(projectId));
  };

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const selectedProject = getProjectById(selectedProjectId);

  const getVisibleProjects = (user, projectTeams = {}, teams = []) => {
    if (!user) return [];
    return projects.filter((project) =>
      canAccessProject(user, project, projectTeams, teams)
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        selectProject,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
        getVisibleProjects,
        refetchProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);