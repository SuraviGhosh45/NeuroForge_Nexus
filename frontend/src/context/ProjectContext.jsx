import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";

const ProjectContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
const REPOS_STORAGE_KEY = "sdlc_project_repositories";

const getStoredRepos = () => {
  try {
    return JSON.parse(localStorage.getItem(REPOS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveStoredRepo = (projectId, repoUrl) => {
  try {
    const repos = getStoredRepos();
    if (projectId != null) {
      repos[String(projectId)] = (repoUrl || "").trim();
      localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(repos));
    }
  } catch (e) {
    console.warn("Failed to save project repository:", e);
  }
};

export const SEED_PROJECTS = [
  {
    id: 1,
    name: "Enterprise Core Banking Cloud Migration",
    code: "CB-MIG",
    description: "Multi-region migration of core ledger infrastructure to high-throughput cloud clusters.",
    status: "In Progress",
    startDate: "2026-01-10",
    endDate: "2026-11-30",
    projectLeadId: 3,
    projectManagerId: 2,
    projectLead: { id: 3, fullName: "David Chen" },
    projectManager: { id: 2, fullName: "Sarah Jenkins" },
    repository: "https://github.com/neuroforge/core-banking-migration",
  },
  {
    id: 2,
    name: "AI Document Intelligence Pipeline",
    code: "AI-DOC",
    description: "Automated OCR extraction, entity resolution, and compliance audit validation engine.",
    status: "In Progress",
    startDate: "2026-03-01",
    endDate: "2026-09-15",
    projectLeadId: 3,
    projectManagerId: 2,
    projectLead: { id: 3, fullName: "David Chen" },
    projectManager: { id: 2, fullName: "Sarah Jenkins" },
    repository: "https://github.com/neuroforge/ai-document-pipeline",
  },
  {
    id: 3,
    name: "Zero-Trust Identity & RBAC Gateway",
    code: "ZT-GATE",
    description: "Stateless JWT authentication service with hardware key multi-factor validation.",
    status: "Completed",
    startDate: "2025-08-01",
    endDate: "2026-02-28",
    projectLeadId: 3,
    projectManagerId: 2,
    projectLead: { id: 3, fullName: "David Chen" },
    projectManager: { id: 2, fullName: "Sarah Jenkins" },
    repository: "https://github.com/neuroforge/identity-gateway",
  },
];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
            const response = await axios.get(`${API_BASE}/projects`);

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const repos = getStoredRepos();

      if (data.length === 0) {
        const enrichedSeed = SEED_PROJECTS.map((item) => ({
          ...item,
          repository: item.repository || repos[String(item.id)] || "",
        }));
        setProjects(enrichedSeed);
        if (enrichedSeed.length > 0 && !selectedProjectId) {
          setSelectedProjectId(enrichedSeed[0].id);
        }
      } else {
        const enriched = data.map((item) => ({
          ...item,
          repository: item.repository || repos[String(item.id)] || "",
        }));

        setProjects(enriched);

        // Automatically select the first available project
        if (enriched.length > 0 && !selectedProjectId) {
          setSelectedProjectId(enriched[0].id);
        }
      }
    } catch (err) {
            const repos = getStoredRepos();
      const enrichedSeed = SEED_PROJECTS.map((item) => ({
        ...item,
        repository: item.repository || repos[String(item.id)] || "",
      }));
      setProjects(enrichedSeed);
      if (enrichedSeed.length > 0 && !selectedProjectId) {
        setSelectedProjectId(enrichedSeed[0].id);
      }
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
        `${API_BASE}/projects`,
        buildPayload(formData)
      );

      const createdRepo = formData.repository || "";
      if (response.data?.id) {
        saveStoredRepo(response.data.id, createdRepo);
      }
      const projectWithRepo = {
        ...response.data,
        repository: createdRepo,
      };

      setProjects((prev) => [
        ...prev,
        projectWithRepo,
      ]);

      return {
        success: true,
        data: projectWithRepo,
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

  const updateProject = async (arg1, arg2) => {
    const formData =
      typeof arg1 === "object" && arg1 !== null
        ? arg1
        : { ...(arg2 || {}), id: arg1 };

    const targetId = formData.id;
    try {
            const response = await axios.put(
        `${API_BASE}/projects/${targetId}`,
        buildPayload(formData)
      );

      const updatedRepo = formData.repository != null ? formData.repository : "";
      if (targetId) {
        saveStoredRepo(targetId, updatedRepo);
      }
      const projectWithRepo = {
        ...response.data,
        repository: updatedRepo,
      };

      setProjects((prev) =>
        prev.map((project) =>
          String(project.id) === String(targetId)
            ? projectWithRepo
            : project
        )
      );

      return {
        success: true,
        data: projectWithRepo,
      };
    } catch (err) {
      console.warn(
        "Backend update project failed, falling back to local state:",
        err
      );
      const existingProject =
        projects.find(
          (p) => String(p.id) === String(targetId)
        ) || {};

      const updatedRepo =
        formData.repository != null
          ? formData.repository
          : existingProject.repository || "";

      if (targetId) {
        saveStoredRepo(targetId, updatedRepo);
      }

      const projectWithRepo = {
        ...existingProject,
        ...formData,
        repository: updatedRepo,
      };

      setProjects((prev) =>
        prev.map((project) =>
          String(project.id) === String(targetId)
            ? projectWithRepo
            : project
        )
      );

      return {
        success: true,
        data: projectWithRepo,
      };
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      let response;
      try {
                response = await axios.patch(
          `${API_BASE}/projects/${projectId}/status`,
          { status }
        );
      } catch (patchErr) {
        if (patchErr.response?.status === 404) {
          const currentProject = projects.find(
            (p) => String(p.id) === String(projectId)
          ) || {};
          response = await axios.put(
            `${API_BASE}/projects/${projectId}`,
            buildPayload({ ...currentProject, status })
          );
        } else {
          throw patchErr;
        }
      }

      const updated = response.data;
      const repos = getStoredRepos();
      const projectWithRepo = {
        ...updated,
        repository: updated.repository || repos[String(updated.id)] || "",
      };

      setProjects((prev) =>
        prev.map((project) =>
          String(project.id) === String(projectId)
            ? { ...project, ...projectWithRepo, status: updated.status || status }
            : project
        )
      );

      return {
        success: true,
        data: projectWithRepo,
      };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to update project status.",
      };
    }
  };

  const deleteProject = async (projectId) => {
    try {
            await axios.delete(
        `${API_BASE}/projects/${projectId}`
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
        updateProjectStatus,
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