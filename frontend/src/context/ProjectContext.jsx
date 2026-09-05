import { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updatedProjects) => {
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  // Create a new project
  const createProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      name: projectData.name,
      code: projectData.code || "",
      description: projectData.description || "",
      projectLead: projectData.projectLead || "",
      projectManager: projectData.projectManager || "",
      teamId: projectData.teamId || null,
      status: projectData.status || "Not Started",
      startDate: projectData.startDate || "",
      endDate: projectData.endDate || "",
    };

    persist([...projects, newProject]);

    return newProject;
  };

  // Update an existing project
  const updateProject = (updatedProject) => {
    const updatedProjects = projects.map((project) =>
      String(project.id) === String(updatedProject.id)
        ? { ...project, ...updatedProject }
        : project
    );

    persist(updatedProjects);
  };

  // Delete a project
  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(
      (project) => String(project.id) !== String(projectId)
    );

    persist(updatedProjects);
  };

  // Get one project by ID
  const getProjectById = (projectId) => {
    return projects.find(
      (project) => String(project.id) === String(projectId)
    );
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
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