import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";

const ProjectContext = createContext(null);

const API_BASE = "http://localhost:8080/api/projects";
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
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    GET http://localhost:8080/api/projects
         Description: Retrieve all projects accessible to the current user.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK -> [ { "id": 1, "name": "App Alpha", "code": "ALP-01", "description": "...", "status": "In Progress", "projectLead": {...}, "projectManager": {...} } ]
         cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/projects
         ========================================================================== */
      const response = await axios.get(API_BASE);

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const repos = getStoredRepos();
      const enriched = data.map((item) => ({
        ...item,
        repository: item.repository || repos[String(item.id)] || "",
      }));

      setProjects(enriched);

      // Automatically select the first available project
      if (enriched.length > 0 && !selectedProjectId) {
        setSelectedProjectId(enriched[0].id);
      }
    } catch (err) {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Graceful Offline Fallback
         If Spring Boot backend is offline or unreachable, hydrate with seed
         projects so team members can immediately evaluate project workspaces.
         ========================================================================== */
      setProjects(SEED_PROJECTS);
      if (SEED_PROJECTS.length > 0 && !selectedProjectId) {
        setSelectedProjectId(SEED_PROJECTS[0].id);
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
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/projects
         Description: Create a new project workspace.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "name": "E-Commerce Revamp", "code": "ECOMM-2026", "description": "...", "projectLeadId": 2, "projectManagerId": 3, "teamId": 1, "status": "Not Started", "startDate": "2026-10-01", "endDate": "2026-12-31" }
         Response:    201/200 OK -> { "id": 5, "name": "E-Commerce Revamp", ... }
         cURL:        curl -X POST http://localhost:8080/api/projects -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"E-Commerce Revamp","code":"ECOMM-2026","status":"Not Started"}'
         ========================================================================== */
      const response = await axios.post(
        API_BASE,
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
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PUT http://localhost:8080/api/projects/{id}
         Description: Fully update project attributes.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "name": "Updated Title", "description": "...", "code": "...", "projectLeadId": 2, "projectManagerId": 3, "status": "In Progress" }
         Response:    200 OK -> { "id": 1, "name": "Updated Title", ... }
         cURL:        curl -X PUT http://localhost:8080/api/projects/1 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Updated Title","status":"In Progress"}'
         ========================================================================== */
      const response = await axios.put(
        `${API_BASE}/${targetId}`,
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
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to update project.",
      };
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      let response;
      try {
        /* ==========================================================================
           [BACKEND_INTEGRATION_POINT]
           Endpoint:    PATCH http://localhost:8080/api/projects/{id}/status
           Description: Partially update only project status.
           NOTE:        If backend controller lacks this route (404), frontend falls back to PUT /api/projects/{id}.
           Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
           Payload:     { "status": "In Progress" }
           Response:    200 OK -> { "id": 1, "status": "In Progress", ... }
           cURL:        curl -X PATCH http://localhost:8080/api/projects/1/status -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"status":"In Progress"}'
           ========================================================================== */
        response = await axios.patch(
          `${API_BASE}/${projectId}/status`,
          { status }
        );
      } catch (patchErr) {
        if (patchErr.response?.status === 404) {
          const currentProject = projects.find(
            (p) => String(p.id) === String(projectId)
          ) || {};
          response = await axios.put(
            `${API_BASE}/${projectId}`,
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
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/projects/{id}
         Description: Delete a project and cascade/detach its associations.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/projects/1 -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
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