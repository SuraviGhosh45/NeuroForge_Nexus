import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "./Pagination.jsx";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  currentPage = 1,
  setCurrentPage = () => {},
}) => {
  const usersPerPage = 10;
  const showActions = Boolean(onEdit || onDelete);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="border-b border-[#e8eef8]/10">
            <tr className="text-left text-sm text-[#e8eef8]/50">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              {showActions && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#e8eef8]/10 transition hover:bg-[#e8eef8]/5"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8eef8] font-semibold text-[#07111f]">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#e8eef8]">{user.fullName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-[#e8eef8]/60">{user.email}</td>

                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(user)}
                            title="Edit"
                            className="text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
                          >
                            <FaEdit size={16} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(user)}
                            title="Delete"
                            className="text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 3 : 2}
                  className="px-6 py-10 text-center text-sm text-[#e8eef8]/40"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};

export default UserTable;