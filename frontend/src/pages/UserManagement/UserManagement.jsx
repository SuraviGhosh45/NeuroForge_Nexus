import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import UserSearch from "../../components/user/UserSearch.jsx";
import EditUserForm from "../../components/user/EditUserForm.jsx";
import DeleteUserModal from "../../components/user/DeleteUserModal.jsx";
import UserAddForm from "../../components/user/UserAddForm.jsx";
import UserTable from "../../components/user/UserTable.jsx";
import { ROLES, normalizeRole } from "../../constants/roles.js";
import {
  PiPlus,
  PiUsers,
} from "react-icons/pi";

const FILTERABLE_ROLES = [
  "admin",
  "project_manager",
  "project_lead",
  "team_lead",
  "developer",
  "tester",
  "qa",
];

const UserManagement = () => {
  const { currentUser } = useAuth();
  const {
    users,
    updateUser,
    updateUserStatus,
    deleteUser,
    createUser,
  } = useUsers();
  const { projectTeams } = useProjectTeam() || {};

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  const isUserAssigned = (userId) => {
    if (!projectTeams) return false;
    return Object.values(projectTeams).some((members) =>
      Array.isArray(members) && members.some((m) => String(m.userId) === String(userId))
    );
  };

  // Stats calculation
  const stats = useMemo(() => {
    return { total: users.length };
  }, [users]);

  // Status Visibility Rule:
  // Non-admins only see Active or In Meeting users (inactive members hidden).
  // Admins have full oversight over all users.
  const isSuperAdmin = normalizeRole(currentUser?.role) === ROLES.ADMIN;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const userStatus = user.status || "Active";

      // Visibility rule: non-admins cannot see inactive users
      if (!isSuperAdmin && userStatus === "Inactive") {
        return false;
      }

      // Search term (name, email, or skills)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = (user.fullName || user.name || "").toLowerCase().includes(term);
        const matchesEmail = (user.email || "").toLowerCase().includes(term);
        const matchesSkill =
          Array.isArray(user.skills) &&
          user.skills.some((s) => s.toLowerCase().includes(term));

        if (!matchesName && !matchesEmail && !matchesSkill) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== "All") {
        if (normalizeRole(user.role) !== normalizeRole(roleFilter)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "All") {
        if (userStatus !== statusFilter) return false;
      }

      // Assignment filter
      if (assignmentFilter !== "All") {
        const assigned = isUserAssigned(user.id);
        if (assignmentFilter === "Assigned" && !assigned) return false;
        if (assignmentFilter === "Unassigned" && assigned) return false;
      }

      return true;
    });
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
    assignmentFilter,
    isSuperAdmin,
    projectTeams,
  ]);

  if (!currentUser) {
    return <div className="text-[#e8eef8]/50">Loading user...</div>;
  }

  const handleCreateUser = async (newUser) => {
    const result = await createUser(newUser);
    if (result.success) {
      setShowAddUser(false);
    } else {
      alert(result.message || "Failed to create user.");
    }
  };

  const handleEdit = (user) => setEditingUser(user);

  const handleSaveEdit = async (updated) => {
    const result = await updateUser(updated, currentUser?.id);
    if (!result.success) {
      alert(result.message || "Failed to update user.");
      return;
    }
    setEditingUser(null);
  };

  const handleUpdateStatus = async (targetUserId, newStatus) => {
    if (!updateUserStatus) return;
    const res = await updateUserStatus(targetUserId, newStatus, currentUser?.id);
    if (!res?.success) {
      alert(res?.message || "Failed to update status.");
    }
  };

  const handleDelete = (user) => setDeletingUser(user);

  const handleConfirmDelete = async () => {
    const result = await deleteUser(deletingUser.id);
    if (!result.success) {
      alert(result.message || "Failed to delete user.");
      return;
    }
    setDeletingUser(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
    setAssignmentFilter("All");
  };

  return (
    <div className="space-y-6">
      {/* HEADER WITH TITLE & ADD BUTTON */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#e8eef8]">
            User Management & Resource Directory
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/50">
            Manage system users, skill profiles based on roles, active status, and project allocations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
        >
          <PiPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* METRIC STAT CARD */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/50">
            <PiUsers size={16} className="text-blue-400" />
            <span>Total Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#e8eef8]">{stats.total}</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS (REARRANGED, NO MAGNIFYING GLASS ICON) */}
      <UserSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={setAssignmentFilter}
        roles={FILTERABLE_ROLES}
        onResetFilters={handleResetFilters}
      />

      {/* USER TABLE (WITH SELF-ONLY STATUS MODIFICATION) */}
      <div>
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
          currentUserId={currentUser?.id}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* ADD USER MODAL */}
      {showAddUser && (
        <UserAddForm
          onCancel={() => setShowAddUser(false)}
          onCreateUser={handleCreateUser}
        />
      )}

      {/* EDIT USER MODAL (STATUS EDITING STRICTLY SELF-ONLY) */}
      {editingUser && (
        <EditUserForm
          user={editingUser}
          currentUserId={currentUser?.id}
          onCancel={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* DELETE USER MODAL */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onCancel={() => setDeletingUser(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default UserManagement;