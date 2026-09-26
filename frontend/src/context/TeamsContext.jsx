import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";

const TeamsContext = createContext(null);

const API_BASE = "http://localhost:8080/api/teams";

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCurrentRole = () => {
    try {
      const storedUser =
        sessionStorage.getItem("auth_user") ||
        localStorage.getItem("auth_user");

      if (!storedUser) return null;

      const user = JSON.parse(storedUser);
      return user?.role?.toUpperCase();
    } catch {
      return null;
    }
  };

  const fetchTeams = async () => {
    const role = getCurrentRole();

    // Teams are available only to ADMIN and PROJECT_MANAGER.
    if (
      role !== "ADMIN" &&
      role !== "PROJECT_MANAGER"
    ) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    GET http://localhost:8080/api/teams
         Description: Retrieve all teams (Admin / Project Manager only).
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK -> [ { "id": 1, "name": "Frontend Squad", "description": "UI & Client logic" } ]
         cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/teams
         ========================================================================== */
      const response = await axios.get(API_BASE);

      const teamsWithMembers = await Promise.all(
        response.data.map(async (team) => {
          try {
            /* ==========================================================================
               [BACKEND_INTEGRATION_POINT]
               Endpoint:    GET http://localhost:8080/api/teams/{id}/members
               Description: Retrieve members assigned to the specified team.
               Headers:     Authorization: Bearer <jwt-token>
               Response:    200 OK -> [ { "id": 1, "fullName": "Alice Dev", "role": "DEVELOPER" } ]
               cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/teams/1/members
               ========================================================================== */
            const membersResponse = await axios.get(
              `${API_BASE}/${team.id}/members`
            );

            return {
              ...team,
              members: membersResponse.data,
            };
          } catch (memberError) {
            console.error(
              `Failed to fetch members for team ${team.id}:`,
              memberError
            );

            return {
              ...team,
              members: [],
            };
          }
        })
      );

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error("Failed to fetch teams:", error);

      setError(
        error.response?.data?.message ||
          "Teams could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async (name) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/teams
         Description: Create a new organizational team.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "name": "Core Platform", "description": "" }
         Response:    201/200 OK -> { "id": 2, "name": "Core Platform" }
         cURL:        curl -X POST http://localhost:8080/api/teams -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Core Platform","description":""}'
         ========================================================================== */
      await axios.post(API_BASE, {
        name,
        description: "",
      });

      await fetchTeams();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to create team.";

      return {
        success: false,
        message,
      };
    }
  };

  const updateTeam = async (teamId, updates) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    PUT http://localhost:8080/api/teams/{id}
         Description: Update an existing team name/description.
         Headers:     Authorization: Bearer <jwt-token>, Content-Type: application/json
         Payload:     { "name": "Platform & Ops", "description": "DevOps team" }
         Response:    200 OK -> { "id": 2, "name": "Platform & Ops" }
         cURL:        curl -X PUT http://localhost:8080/api/teams/2 -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Platform & Ops","description":"DevOps team"}'
         ========================================================================== */
      await axios.put(`${API_BASE}/${teamId}`, {
        name: updates.name,
        description: updates.description || "",
      });

      await fetchTeams();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to update team.";

      return {
        success: false,
        message,
      };
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/teams/{id}
         Description: Delete a team.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/teams/2 -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.delete(`${API_BASE}/${teamId}`);

      setTeams((prev) =>
        prev.filter(
          (team) => team.id !== teamId
        )
      );

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to delete team.";

      return {
        success: false,
        message,
      };
    }
  };

  const addMember = async (teamId, member) => {
    try {
      await axios.post(
        `${API_BASE}/${teamId}/members`,
        {
          userId: member.userId,
          teamRole: member.teamRole,
        }
      );

      await fetchTeams();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to add member.";

      return {
        success: false,
        message,
      };
    }
  };

  const updateMember = async (
    teamId,
    userId,
    updates
  ) => {
    try {
      await axios.put(
        `${API_BASE}/${teamId}/members/${userId}`,
        {
          teamRole: updates.teamRole,
        }
      );

      await fetchTeams();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to update member.";

      return {
        success: false,
        message,
      };
    }
  };

  const removeMember = async (
    teamId,
    userId
  ) => {
    try {
      await axios.delete(
        `${API_BASE}/${teamId}/members/${userId}`
      );

      await fetchTeams();

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to remove member.";

      return {
        success: false,
        message,
      };
    }
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
        error,
        createTeam,
        updateTeam,
        deleteTeam,
        addMember,
        updateMember,
        removeMember,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () =>
  useContext(TeamsContext);