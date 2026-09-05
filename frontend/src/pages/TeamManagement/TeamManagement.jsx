import { useEffect, useState } from "react";
import { IoAddSharp } from "react-icons/io5";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import TeamTable from "../../components/team/TeamTable.jsx";
import EditMemberForm from "../../components/team/EditMemberForm.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";

const TEAM_ROLES = ["Manager", "Member"];
const TeamManagement = () => {
const {
    teams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
} = useTeams();

    const { users } = useUsers();

    const [newTeamName, setNewTeamName] = useState("");

    const [activeTeamId, setActiveTeamId] = useState(
        teams[0]?.id ?? null
    );
    const { projects, updateProject } = useProjects();

    const [editingMember, setEditingMember] = useState(null);

    const [showAddMember, setShowAddMember] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState("");

    const [teamRole, setTeamRole] = useState("Member");

    // Edit team state
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [editingTeamName, setEditingTeamName] = useState("");

    
    // select team when available
    

    useEffect(() => {
        if (!activeTeamId && teams.length > 0) {
            setActiveTeamId(teams[0].id);
        }
    }, [teams, activeTeamId]);

    
    // ACTIVE TEAM
    
    const activeTeam = teams.find(
        (team) =>
            String(team.id) === String(activeTeamId)
    );

    
    // CREATE TEAM
    
    const handleCreateTeam = (e) => {
        e.preventDefault();

        if (!newTeamName.trim()) return;

        createTeam(newTeamName.trim());

        setNewTeamName("");
    };

    
    // START EDIT TEAM
    

    const handleEditTeam = () => {
        if (!activeTeam) return;

        setEditingTeamId(activeTeam.id);
        setEditingTeamName(activeTeam.name);
    };

    
    // SAVE EDITED TEAM


    const handleSaveTeam = () => {
    if (!editingTeamName.trim()) return;

    updateTeam(editingTeamId, {
        name: editingTeamName.trim(),
    });

    setEditingTeamId(null);
    setEditingTeamName("");
};

    
    // CANCEL EDIT TEAM
    

    const handleCancelEditTeam = () => {
        setEditingTeamId(null);
        setEditingTeamName("");
    };

    
    // DELETE TEAM
    

    const handleDeleteTeam = () => {
        if (!activeTeam) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${activeTeam.name}"?`
        );

        if (!confirmed) return;

        const deletedTeamId = activeTeam.id;

        // Remove the team reference from projects
    projects.forEach((project) => {
        if (
            String(project.teamId) ===
            String(deletedTeamId)
        ) {
            updateProject({
                ...project,
                teamId: null,
            });
        }
    });
    // Delete the team
        deleteTeam(deletedTeamId);

        // Find another team to select
        const remainingTeams = teams.filter(
            (team) =>
                String(team.id) !==
                String(deletedTeamId)
        );

        setActiveTeamId(
            remainingTeams.length > 0
                ? remainingTeams[0].id
                : null
        );

        setEditingMember(null);
        setShowAddMember(false);
        setEditingTeamId(null);
        setEditingTeamName("");
    };

    
    // ADD MEMBER
    

    const handleAddMember = (e) => {
        e.preventDefault();

        const user = users.find(
            (u) =>
                String(u.id) ===
                String(selectedUserId)
        );

        if (!user || !activeTeam) return;

        // Prevent duplicate user in same team
        const alreadyMember = (
            activeTeam.members || []
        ).some(
            (member) =>
                String(member.userId) ===
                String(user.id)
        );

        if (alreadyMember) {
            alert(
                `${user.name} is already a member of this team.`
            );
            return;
        }

        addMember(activeTeam.id, {
            userId: user.id,
            teamRole,
        });

        setSelectedUserId("");
        setTeamRole("Member");
        setShowAddMember(false);
    };

    
    // EDIT MEMBER
    

    const handleEditMember = (member) => {
        setEditingMember(member);
    };

    
    // SAVE MEMBER
    

    const handleSaveMember = (updated) => {
        if (!activeTeam) return;

        updateMember(
            activeTeam.id,
            updated.id,
            updated
        );

        setEditingMember(null);
    };

    
    // REMOVE MEMBER
    

    const handleRemoveMember = (member) => {
        if (!activeTeam) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove this member from the team?"
        );

        if (!confirmed) return;

        removeMember(
            activeTeam.id,
            member.id
        );
    };

    return (
        <>
            {/* ---------------------------------------- */}
            {/* HEADER */}
            {/* ---------------------------------------- */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="text-2xl font-semibold">
                        Teams
                    </h2>

                    <p className="mt-1 text-sm text-[#e8eef8]/50">
                        Manage teams and members
                    </p>
                </div>

                {/* CREATE TEAM */}

                <form
                    onSubmit={handleCreateTeam}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        placeholder="New team name"
                        value={newTeamName}
                        onChange={(e) =>
                            setNewTeamName(
                                e.target.value
                            )
                        }
                        className="rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-3 py-2 text-sm text-[#e8eef8] outline-none"
                    />

                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-md bg-[#e8eef8] px-4 py-2 text-sm font-medium text-[#07111f]"
                    >
                        <IoAddSharp size={18} />
                        Create
                    </button>
                </form>
            </div>

            {/* ---------------------------------------- */}
            {/* TEAM TABS */}
            {/* ---------------------------------------- */}

            {teams.length > 0 && (
                <div className="mt-6 flex gap-2 overflow-x-auto border-b border-[#e8eef8]/10 pb-3">

                    {teams.map((team) => (
                        <button
                            key={team.id}
                            onClick={() =>
                                setActiveTeamId(team.id)
                            }
                            className={`rounded-md px-3 py-2 text-sm transition ${
                                String(team.id) ===
                                String(activeTeamId)
                                    ? "bg-[#e8eef8]/10 font-medium text-[#e8eef8]"
                                    : "text-[#e8eef8]/60 hover:text-[#e8eef8]"
                            }`}
                        >
                            {team.name}
                        </button>
                    ))}

                </div>
            )}

            {/* ---------------------------------------- */}
            {/* NO TEAMS */}
            {/* ---------------------------------------- */}

            {teams.length === 0 && (
                <div className="mt-6 rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">
                    <p className="text-sm text-[#e8eef8]/40">
                        No teams created yet.
                    </p>
                </div>
            )}

            {/* ---------------------------------------- */}
            {/* ACTIVE TEAM */}
            {/* ---------------------------------------- */}

            {activeTeam && (
                <div className="mt-6 rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">

                    {/* TEAM HEADER */}

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            {editingTeamId ? (
                                <div className="flex items-center gap-2">

                                    <input
                                        type="text"
                                        value={editingTeamName}
                                        onChange={(e) =>
                                            setEditingTeamName(
                                                e.target.value
                                            )
                                        }
                                        className="rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-3 py-2 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
                                    />

                                    <button
                                        onClick={
                                            handleSaveTeam
                                        }
                                        className="rounded-md bg-[#e8eef8] px-3 py-2 text-xs font-medium text-[#07111f]"
                                    >
                                        Save
                                    </button>

                                    <button
                                        onClick={
                                            handleCancelEditTeam
                                        }
                                        className="rounded-md border border-[#e8eef8]/15 px-3 py-2 text-xs text-[#e8eef8]/70"
                                    >
                                        Cancel
                                    </button>

                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold text-[#e8eef8]">
                                        Team -{" "}
                                        {activeTeam.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-[#e8eef8]/40">
                                        {(
                                            activeTeam.members ||
                                            []
                                        ).length}{" "}
                                        member(s)
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">

                            {/* EDIT TEAM */}

                            {!editingTeamId && (
                                <button
                                    onClick={
                                        handleEditTeam
                                    }
                                    className="rounded-md border border-[#e8eef8]/15 px-4 py-2 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/10 hover:text-[#e8eef8]"
                                >
                                    Edit Team
                                </button>
                            )}

                            {/* DELETE TEAM */}

                            <button
                                onClick={
                                    handleDeleteTeam
                                }
                                className="rounded-md border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
                            >
                                Delete Team
                            </button>

                            {/* ADD MEMBER */}

                            <button
                                onClick={() =>
                                    setShowAddMember(
                                        (value) => !value
                                    )
                                }
                                className="flex items-center gap-2 rounded-md bg-[#378add] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#378add]/90"
                            >
                                <IoAddSharp size={18} />
                                Add Member
                            </button>

                        </div>
                    </div>

                    {/* -------------------------------- */}
                    {/* ADD MEMBER FORM */}
                    {/* -------------------------------- */}

                    {showAddMember && (
                        <form
                            onSubmit={handleAddMember}
                            className="mb-5 flex flex-wrap gap-2 rounded-lg border border-[#e8eef8]/10 bg-[#07111f] p-4"
                        >

                            <select
                                value={selectedUserId}
                                onChange={(e) =>
                                    setSelectedUserId(
                                        e.target.value
                                    )
                                }
                                required
                                className="flex-1 rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-3 py-2 text-sm text-[#e8eef8] outline-none"
                            >
                                <option value="">
                                    Select user
                                </option>

                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name} (
                                        {user.role})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={teamRole}
                                onChange={(e) =>
                                    setTeamRole(
                                        e.target.value
                                    )
                                }
                                className="rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-3 py-2 text-sm text-[#e8eef8] outline-none"
                            >
                                {TEAM_ROLES.map(
                                    (role) => (
                                        <option
                                            key={role}
                                            value={role}
                                        >
                                            {role}
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                type="submit"
                                className="rounded-md bg-[#e8eef8] px-4 py-2 text-sm font-medium text-[#07111f]"
                            >
                                Add
                            </button>

                        </form>
                    )}

                    {/* -------------------------------- */}
                    {/* MEMBERS TABLE */}
                    {/* -------------------------------- */}

                    <TeamTable
                        members={
                            activeTeam.members || []
                        }
                        onEdit={handleEditMember}
                        onRemove={handleRemoveMember}
                    />

                </div>
            )}

            {/* ---------------------------------------- */}
            {/* EDIT MEMBER */}
            {/* ---------------------------------------- */}

            {editingMember && activeTeam && (
                <EditMemberForm
                    member={editingMember}
                    onCancel={() =>
                        setEditingMember(null)
                    }
                    onSave={handleSaveMember}
                />
            )}
        </>
    );
};

export default TeamManagement;