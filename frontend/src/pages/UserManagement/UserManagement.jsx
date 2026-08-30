import { useState } from "react";
import { PiList } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoAddSharp } from "react-icons/io5";

import { useAuth } from "../../context/AuthContext.jsx";
import { getPermissions } from "../../config/rolePermissions.js";
import UserSearch from "../../components/user/UserSearch.jsx";
import UserAddForm from "../../components/user/UserAddForm.jsx";
import EditUserForm from "../../components/user/EditUserForm.jsx";
import DeleteUserModal from "../../components/user/DeleteUserModal.jsx";
import UserTable from "../../components/user/UserTable.jsx";

const UserManagement = () => {
  const { currentUser, logout } = useAuth();

  const [addUser, setAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [users, setUsers] = useState([]); // full dataset, later from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = ["Admin", "Project Lead", "Project Manager", "Team Lead", "Developer", "Tester", "QA"];

  // Guard against currentUser not being ready yet (e.g. auth still loading,
  // or someone navigates here directly without being logged in)
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111f] text-[#e8eef8]/50">
        Loading user...
      </div>
    );
  }

  const perms = getPermissions(currentUser.role);

  // Step 1: scope — which users this role is even allowed to see
  const scopedUsers = users.filter((user) => {
    if (perms.scope === "all") return true;
    if (perms.scope === "project") return user.projectId === currentUser.projectId;
    if (perms.scope === "team") return user.teamId === currentUser.teamId;
    if (perms.scope === "self") return user.id === currentUser.id;
    return false;
  });

  // Step 2: search + role filter, applied on top of scope
  const filteredUsers = scopedUsers.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (newUser) => {
    if (!perms.canAdd) return;
    setUsers((prev) => [...prev, { id: Date.now(), ...newUser }]);
    setAddUser(false);
  };

  const handleEdit = (user) => perms.canEdit && setEditingUser(user);

  const handleSaveEdit = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  };

  const handleDelete = (user) => perms.canDelete && setDeletingUser(user);

  const handleConfirmDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeletingUser(null);
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-[#e8eef8]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e8eef8]/10 bg-[#07111f] px-6 py-4">
        <div className="flex items-center gap-4">
          <PiList size={24} className="cursor-pointer text-[#e8eef8]/70 transition hover:text-[#e8eef8]" />
          <h1 className="text-xl font-semibold text-[#e8eef8]">NeuroForge Nexus</h1>
        </div>

        <div className="flex items-center gap-5">
          <span className="rounded-md border border-[#e8eef8]/15 px-3 py-2 text-sm text-[#e8eef8]/80">
            {currentUser.role}
          </span>

          <FaRegBell size={20} className="cursor-pointer text-[#e8eef8]/70" />
          <CgProfile size={24} className="cursor-pointer text-[#e8eef8]/70" />

          <button
            onClick={logout}
            className="rounded-md border border-[#e8eef8]/15 px-3 py-2 text-sm text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
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
      </main>

      {/* Modals */}
      {addUser && perms.canAdd && (
        <UserAddForm onCancel={() => setAddUser(false)} onCreateUser={handleCreateUser} />
      )}
      {editingUser && (
        <EditUserForm user={editingUser} onCancel={() => setEditingUser(null)} onSave={handleSaveEdit} />
      )}
      {deletingUser && (
        <DeleteUserModal user={deletingUser} onCancel={() => setDeletingUser(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
};

export default UserManagement;