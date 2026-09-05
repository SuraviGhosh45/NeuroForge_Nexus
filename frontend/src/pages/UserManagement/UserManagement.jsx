import { useState } from "react";
import { IoAddSharp } from "react-icons/io5";

import { useAuth } from "../../context/AuthContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { getPermissions } from "../../config/rolePermissions.js";
import UserSearch from "../../components/user/UserSearch.jsx";
import UserAddForm from "../../components/user/UserAddForm.jsx";
import EditUserForm from "../../components/user/EditUserForm.jsx";
import DeleteUserModal from "../../components/user/DeleteUserModal.jsx";
import UserTable from "../../components/user/UserTable.jsx";

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { users, createUser, updateUser, deleteUser } = useUsers();

  const [addUser, setAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = ["Admin", "Project Lead", "Project Manager", "Team Lead", "Developer", "Tester", "QA"];

  if (!currentUser) {
    return <div className="text-[#e8eef8]/50">Loading user...</div>;
  }

  const perms = getPermissions(currentUser.role);

  const scopedUsers = users.filter((user) => {
    if (perms.scope === "all") return true;
    if (perms.scope === "project") return user.projectId === currentUser.projectId;
    if (perms.scope === "team") return user.teamId === currentUser.teamId;
    if (perms.scope === "self") return user.id === currentUser.id;
    return false;
  });

  const filteredUsers = scopedUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (newUser) => {
    if (!perms.canAdd) return;
    createUser(newUser);
    setAddUser(false);
  };

  const handleEdit = (user) => perms.canEdit && setEditingUser(user);
  const handleSaveEdit = (updated) => {
    updateUser(updated);
    setEditingUser(null);
  };

  const handleDelete = (user) => perms.canDelete && setDeletingUser(user);
  const handleConfirmDelete = () => {
    deleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {currentUser.name}</h2>
          <p className="mt-1 text-sm text-[#e8eef8]/50">Manage users in the system</p>
        </div>

        {perms.canAdd && (
          <button
            onClick={() => setAddUser(true)}
            className="flex w-fit items-center gap-2 rounded-md bg-[#e8eef8] px-4 py-2.5 text-sm font-medium text-[#07111f] transition hover:bg-[#e8eef8]/90"
          >
            <IoAddSharp size={20} />
            Add User
          </button>
        )}
      </div>

      <UserSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        roles={roles}
        showRoleFilter={perms.canFilterByRole}
      />

      <div className="mt-6">
        <UserTable
          users={filteredUsers}
          onEdit={perms.canEdit ? handleEdit : undefined}
          onDelete={perms.canDelete ? handleDelete : undefined}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {addUser && perms.canAdd && (
        <UserAddForm onCancel={() => setAddUser(false)} onCreateUser={handleCreateUser} />
      )}
      {editingUser && (
        <EditUserForm user={editingUser} onCancel={() => setEditingUser(null)} onSave={handleSaveEdit} />
      )}
      {deletingUser && (
        <DeleteUserModal user={deletingUser} onCancel={() => setDeletingUser(null)} onConfirm={handleConfirmDelete} />
      )}
    </>
  );
};

export default UserManagement;