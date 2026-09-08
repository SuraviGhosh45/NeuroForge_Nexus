import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import UserSearch from "../../components/user/UserSearch.jsx";
import EditUserForm from "../../components/user/EditUserForm.jsx";
import DeleteUserModal from "../../components/user/DeleteUserModal.jsx";
import UserTable from "../../components/user/UserTable.jsx";

const UserManagement = () => {
  const { currentUser } = useAuth();
  const { users, updateUser, deleteUser } = useUsers();

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  if (!currentUser) {
    return <div className="text-[#e8eef8]/50">Loading user...</div>;
  }

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const handleEdit = (user) => setEditingUser(user);

  const handleSaveEdit = async (updated) => {
    const result = await updateUser(updated);
    if (!result.success) {
      alert(result.message);
      return;
    }
    setEditingUser(null);
  };

  const handleDelete = (user) => setDeletingUser(user);

  const handleConfirmDelete = async () => {
    const result = await deleteUser(deletingUser.id);
    if (!result.success) {
      alert(result.message);
      return;
    }
    setDeletingUser(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {currentUser.fullName}</h2>
          <p className="mt-1 text-sm text-[#e8eef8]/50">Manage users in the system</p>
        </div>
      </div>

      <UserSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showRoleFilter={false}
      />

      <div className="mt-6">
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

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