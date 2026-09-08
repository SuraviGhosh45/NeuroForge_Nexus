import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ProjectContext = createContext(null);

const API_BASE = "http://localhost:8080/api/projects";

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_BASE);
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
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
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create project.";
      return { success: false, message };
    }
  };

  const updateProject = async (formData) => {
    try {
      const response = await axios.put(`${API_BASE}/${formData.id}`, buildPayload(formData));
      setProjects((prev) =>
        prev.map((project) => (project.id === formData.id ? response.data : project))
      );
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update project.";
      return { success: false, message };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${API_BASE}/${projectId}`);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete project.";
      return { success: false, message };
    }
  };

  const getProjectById = (projectId) => {
    return projects.find((project) => String(project.id) === String(projectId));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        createProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);