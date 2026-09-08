import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const TeamsContext = createContext(null);

const API_BASE = "http://localhost:8080/api/teams";

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(API_BASE);
      const teamsWithMembers = await Promise.all(
        response.data.map(async (team) => {
          const membersResponse = await axios.get(`${API_BASE}/${team.id}/members`);
          return { ...team, members: membersResponse.data };
        })
      );
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async (name) => {
    try {
      await axios.post(API_BASE, { name, description: "" });
      await fetchTeams();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create team.";
      return { success: false, message };
    }
  };

  const updateTeam = async (teamId, updates) => {
    try {
      await axios.put(`${API_BASE}/${teamId}`, {
        name: updates.name,
        description: updates.description || "",
      });
      await fetchTeams();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update team.";
      return { success: false, message };
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await axios.delete(`${API_BASE}/${teamId}`);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete team.";
      return { success: false, message };
    }
  };

  const addMember = async (teamId, member) => {
    try {
      await axios.post(`${API_BASE}/${teamId}/members`, {
        userId: member.userId,
        teamRole: member.teamRole,
      });
      await fetchTeams();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add member.";
      return { success: false, message };
    }
  };

  const updateMember = async (teamId, userId, updates) => {
    try {
      await axios.put(`${API_BASE}/${teamId}/members/${userId}`, {
        teamRole: updates.teamRole,
      });
      await fetchTeams();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update member.";
      return { success: false, message };
    }
  };

  const removeMember = async (teamId, userId) => {
    try {
      await axios.delete(`${API_BASE}/${teamId}/members/${userId}`);
      await fetchTeams();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove member.";
      return { success: false, message };
    }
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
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

export const useTeams = () => useContext(TeamsContext);