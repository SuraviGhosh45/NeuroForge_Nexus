import { createContext, useContext, useState } from "react";

const TeamsContext = createContext(null);

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("teams");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updated) => {
    localStorage.setItem("teams", JSON.stringify(updated));
    setTeams(updated);
  };

  // Creates a new team with an empty member list
  const createTeam = (name) => {
    persist([
      ...teams,
      {
        id: Date.now(),
        name,
        members: [],
      },
    ]);
  };

  // Deletes a team
  const deleteTeam = (teamId) => {
    persist(
      teams.filter(
        (team) => String(team.id) !== String(teamId)
      )
    );
  };

  // Adds a user to a team
  const addMember = (teamId, member) => {
    persist(
      teams.map((team) =>
        String(team.id) === String(teamId)
          ? {
              ...team,
              members: [
                ...(team.members || []),
                {
                  id: Date.now(),
                  userId: member.userId,
                  teamRole: member.teamRole,
                },
              ],
            }
          : team
      )
    );
  };

  // Updates an existing team member
  const updateMember = (teamId, memberId, updates) => {
    persist(
      teams.map((team) =>
        String(team.id) === String(teamId)
          ? {
              ...team,
              members: (team.members || []).map((member) =>
                String(member.id) === String(memberId)
                  ? {
                      ...member,
                      ...updates,
                    }
                  : member
              ),
            }
          : team
      )
    );
  };

  // Removes a member from a team
  const removeMember = (teamId, memberId) => {
    persist(
      teams.map((team) =>
        String(team.id) === String(teamId)
          ? {
              ...team,
              members: (team.members || []).filter(
                (member) =>
                  String(member.id) !== String(memberId)
              ),
            }
          : team
      )
    );
  };
  const updateTeam = (teamId, updates) => {
    persist(
        teams.map((team) =>
            String(team.id) === String(teamId)
                ? {
                      ...team,
                      ...updates,
                  }
                : team
        )
    );
};

  return (
    <TeamsContext.Provider
    value={{
        teams,
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