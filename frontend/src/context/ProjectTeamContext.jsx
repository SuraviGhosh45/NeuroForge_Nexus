import { createContext, useContext, useEffect, useState } from "react";

const ProjectTeamContext = createContext(null);

const STORAGE_KEY = "projectTeamMembers";

const MEMBER_STATUSES = ["Active", "Inactive", "In Meeting"];

/*
  Stored structure:

  {
    "1": [
      {
        userId: 5,
        projectRole: "Developer",
        status: "Active"
      },
      {
        userId: 8,
        projectRole: "Tester",
        status: "In Meeting"
      }
    ]
  }
*/

export const ProjectTeamProvider = ({ children }) => {
  const [projectTeams, setProjectTeams] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return {};
      }

      const parsed = JSON.parse(stored);

      if (!parsed || typeof parsed !== "object") {
        return {};
      }

      /*
       * Backward compatibility:
       *
       * Existing members may not have a status because
       * status was not part of the old structure.
       *
       * Give them Active by default.
       */
      const normalizedTeams = Object.entries(parsed).reduce(
        (result, [projectId, members]) => {
          result[projectId] = Array.isArray(members)
            ? members.map((member) => ({
                ...member,
                status: MEMBER_STATUSES.includes(member.status)
                  ? member.status
                  : "Active",
              }))
            : [];

          return result;
        },
        {}
      );

      return normalizedTeams;
    } catch (error) {
      console.error(
        "Failed to load project team data:",
        error
      );

      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(projectTeams)
      );
    } catch (error) {
      console.error(
        "Failed to save project team data:",
        error
      );
    }
  }, [projectTeams]);

  /* ================= GET PROJECT MEMBERS ================= */

  const getProjectMembers = (projectId) => {
    if (!projectId) {
      return [];
    }

    return projectTeams[String(projectId)] || [];
  };

  /* ================= CHECK USER ASSIGNMENT ================= */

  const isUserAssignedToProject = (userId) => {
    return Object.values(projectTeams).some((members) =>
      members.some(
        (member) =>
          String(member.userId) === String(userId)
      )
    );
  };

  /* ================= GET USER PROJECT ================= */

  const getUserProjectId = (userId) => {
    const entry = Object.entries(projectTeams).find(
      ([, members]) =>
        members.some(
          (member) =>
            String(member.userId) === String(userId)
        )
    );

    return entry ? entry[0] : null;
  };

  /* ================= ADD MEMBER ================= */

  const addProjectMember = (
    projectId,
    userId,
    projectRole
  ) => {
    if (!projectId || !userId || !projectRole) {
      return {
        success: false,
        message:
          "Project, user and project role are required.",
      };
    }

    const projectKey = String(projectId);
    const userKey = String(userId);

    let result = {
      success: true,
      message: "",
    };

    setProjectTeams((prev) => {
      const existingProjectMembers =
        prev[projectKey] || [];

      const alreadyInThisProject =
        existingProjectMembers.some(
          (member) =>
            String(member.userId) === userKey
        );

      if (alreadyInThisProject) {
        result = {
          success: false,
          message:
            "This user is already a member of the project.",
        };

        return prev;
      }

      return {
        ...prev,
        [projectKey]: [
          ...existingProjectMembers,
          {
            userId,
            projectRole,
            status: "Active",
          },
        ],
      };
    });

    return result;
  };

  /* ================= UPDATE MEMBER ================= */

  const updateProjectMember = (
    projectId,
    userId,
    projectRole
  ) => {
    if (!projectId || !userId || !projectRole) {
      return {
        success: false,
        message:
          "Project, user and project role are required.",
      };
    }

    const projectKey = String(projectId);
    const userKey = String(userId);

    let result = {
      success: true,
      message: "",
    };

    setProjectTeams((prev) => {
      const existingMembers =
        prev[projectKey] || [];

      const memberExists = existingMembers.some(
        (member) =>
          String(member.userId) === userKey
      );

      if (!memberExists) {
        result = {
          success: false,
          message:
            "Project member was not found.",
        };

        return prev;
      }

      return {
        ...prev,
        [projectKey]: existingMembers.map(
          (member) =>
            String(member.userId) === userKey
              ? {
                  ...member,
                  projectRole,
                }
              : member
        ),
      };
    });

    return result;
  };

  /* ================= UPDATE MEMBER STATUS ================= */

  const updateProjectMemberStatus = (
    projectId,
    userId,
    status
  ) => {
    if (!projectId || !userId || !status) {
      return {
        success: false,
        message:
          "Project, user and status are required.",
      };
    }

    if (!MEMBER_STATUSES.includes(status)) {
      return {
        success: false,
        message: "Invalid member status.",
      };
    }

    const projectKey = String(projectId);
    const userKey = String(userId);

    let result = {
      success: true,
      message: "",
    };

    setProjectTeams((prev) => {
      const existingMembers =
        prev[projectKey] || [];

      const memberExists = existingMembers.some(
        (member) =>
          String(member.userId) === userKey
      );

      if (!memberExists) {
        result = {
          success: false,
          message:
            "Project member was not found.",
        };

        return prev;
      }

      return {
        ...prev,
        [projectKey]: existingMembers.map(
          (member) =>
            String(member.userId) === userKey
              ? {
                  ...member,
                  status,
                }
              : member
        ),
      };
    });

    return result;
  };

  /* ================= REMOVE MEMBER ================= */

  const removeProjectMember = (
    projectId,
    userId
  ) => {
    if (!projectId || !userId) {
      return {
        success: false,
        message:
          "Project and user are required.",
      };
    }

    const projectKey = String(projectId);
    const userKey = String(userId);

    let result = {
      success: true,
      message: "",
    };

    setProjectTeams((prev) => {
      const existingMembers =
        prev[projectKey] || [];

      const memberExists = existingMembers.some(
        (member) =>
          String(member.userId) === userKey
      );

      if (!memberExists) {
        result = {
          success: false,
          message:
            "Project member was not found.",
        };

        return prev;
      }

      return {
        ...prev,
        [projectKey]: existingMembers.filter(
          (member) =>
            String(member.userId) !== userKey
        ),
      };
    });

    return result;
  };

  /* ================= CLEAR PROJECT TEAM ================= */

  const clearProjectTeam = (projectId) => {
    if (!projectId) {
      return;
    }

    const projectKey = String(projectId);

    setProjectTeams((prev) => {
      const updated = { ...prev };

      delete updated[projectKey];

      return updated;
    });
  };

  return (
    <ProjectTeamContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProjectTeamContext.Provider>
  );
};

export const useProjectTeam = () =>
  useContext(ProjectTeamContext);