import { FaEdit, FaTrash } from "react-icons/fa";
import { useUsers } from "../../context/UsersContext.jsx";

const TeamTable = ({ members, onEdit, onRemove }) => {
  const { users } = useUsers();

  const getUser = (userId) => {
    return users.find(
      (user) => String(user.id) === String(userId)
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b]">
      <table className="w-full">
        <thead className="border-b border-[#e8eef8]/10">
          <tr className="text-left text-sm text-[#e8eef8]/50">
            <th className="px-6 py-4">Member</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Team role</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-10 text-center text-sm text-[#e8eef8]/40"
              >
                No members yet
              </td>
            </tr>
          ) : (
            members.map((member) => {
              const user = getUser(member.userId);

              return (
                <tr
                  key={member.id}
                  className="border-b border-[#e8eef8]/10 hover:bg-[#e8eef8]/5"
                >
                  <td className="px-6 py-4 font-medium text-[#e8eef8]">
                    {user?.name || "Unknown User"}
                  </td>

                  <td className="px-6 py-4 text-sm text-[#e8eef8]/60">
                    {user?.role || "Unknown Role"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full border border-[#e8eef8]/15 px-3 py-1 text-xs text-[#e8eef8]/80">
                      {member.teamRole}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => onEdit(member)}
                        className="text-[#e8eef8]/50 hover:text-[#e8eef8]"
                      >
                        <FaEdit size={14} />
                      </button>

                      <button
                        onClick={() => onRemove(member)}
                        className="text-[#e8eef8]/50 hover:text-[#e8eef8]"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;