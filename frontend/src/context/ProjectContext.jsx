import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";

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

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setProjects(data);

      // Automatically select the first available project
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.warn(
        "Failed to fetch projects from backend:",
        err.message
      );

      setProjects([]);

      setError(
        err.response?.data?.message ||
          "Projects could not be loaded."
      );
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
    projectLeadId: formData.projectLead
      ? Number(formData.projectLead)
      : null,
    projectManagerId: formData.projectManager
      ? Number(formData.projectManager)
      : null,
    teamId: formData.teamId
      ? Number(formData.teamId)
      : null,
    status: formData.status,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
  });

  const createProject = async (formData) => {
    try {
      const response = await axios.post(
        API_BASE,
        buildPayload(formData)
      );

      setProjects((prev) => [
        ...prev,
        response.data,
      ]);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to create project.",
      };
    }
  };

  const updateProject = async (formData) => {
    try {
      const response = await axios.put(
        `${API_BASE}/${formData.id}`,
        buildPayload(formData)
      );

      setProjects((prev) =>
        prev.map((project) =>
          project.id === formData.id
            ? response.data
            : project
        )
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to update project.",
      };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(
        `${API_BASE}/${projectId}`
      );

      setProjects((prev) =>
        prev.filter(
          (project) => project.id !== projectId
        )
      );

      if (
        String(selectedProjectId) ===
        String(projectId)
      ) {
        setSelectedProjectId(null);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to delete project.",
      };
    }
  };

  const getProjectById = (projectId) => {
    return projects.find(
      (project) =>
        String(project.id) ===
        String(projectId)
    );
  };

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const selectedProject =
    getProjectById(selectedProjectId);

  /*
   * IMPORTANT:
   *
   * The backend already applies project visibility
   * according to the logged-in user's role.
   *
   * Therefore, do not run another frontend
   * canAccessProject() filter here.
   *
   * Example:
   * TEAM_MEMBER Bob -> backend returns only
   * Website Redesign.
   */
  const getVisibleProjects = () => {
    return projects;
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        selectedProjectId,
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

export const useProjects = () =>
  useContext(ProjectContext);