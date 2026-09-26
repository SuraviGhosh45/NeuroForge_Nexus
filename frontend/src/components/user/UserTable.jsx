import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  PiEnvelopeSimple,
  PiFolder,
  PiBriefcase,
} from "react-icons/pi";
import Pagination from "./Pagination.jsx";
import { formatRole } from "../../constants/roles.js";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onUpdateStatus,
  currentUserId,
  currentPage = 1,
  setCurrentPage = () => {},
}) => {
  const navigate = useNavigate();

  const { projectTeams } = useProjectTeam() || {};
  const { projects } = useProjects() || {};

  const usersPerPage = 10;
  const showActions = Boolean(onEdit || onDelete);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(
    startIndex,
    startIndex + usersPerPage
  );

  const getUserAssignment = (userId) => {
    if (!projectTeams) {
      return {
        isAssigned: false,
        projectName: null,
      };
    }

    for (const [projId, members] of Object.entries(projectTeams)) {
      if (
        Array.isArray(members) &&
        members.some(
          (m) => String(m.userId) === String(userId)
        )
      ) {
        const proj = projects?.find(
          (p) => String(p.id) === String(projId)
        );

        return {
          isAssigned: true,
          projectId: projId,
          projectName:
            proj?.name ||
            (projId === "1"
              ? "Banking System"
              : `Project #${projId}`),
        };
      }
    }

    return {
      isAssigned: false,
      projectName: null,
    };
  };

  const getRoleBadgeStyle = (role) => {
    const normalized = (role || "").toLowerCase();

    if (normalized.includes("admin")) {
      return "border-purple-200 bg-purple-50 text-purple-700";
    }

    if (normalized.includes("manager")) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (normalized.includes("lead")) {
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    }

    if (normalized.includes("dev")) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalized.includes("test")) {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (normalized.includes("qa")) {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-600";
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "In Meeting":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "Inactive":
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const getStatusDotStyle = (status) => {
    switch (status) {
      case "Active":
        return "animate-pulse bg-emerald-500";

      case "In Meeting":
        return "bg-amber-500";

      case "Inactive":
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg shadow-slate-900/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="border-b border-slate-700 bg-[#172033]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">
                Skills (Role & Responsibilities)
              </th>
              <th className="px-6 py-4">Working Status</th>
              <th className="px-6 py-4">Project Assignment</th>

              {showActions && (
                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                const assignment = getUserAssignment(user.id);

                const isSelf = Boolean(
                  currentUserId &&
                    String(user.id) === String(currentUserId)
                );

                const skills = Array.isArray(user.skills)
                  ? user.skills
                  : [];

                const currentStatus =
                  user.status || "Active";

                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#F1F5F9]"
                  >
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/user-management/${user.id}`
                          )
                        }
                        className="flex w-full items-center gap-3.5 text-left"
                        title={`View ${user.fullName}'s details`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-bold text-white shadow-md shadow-blue-500/20">
                          {user.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 font-semibold text-[#172033]">
                            <span className="transition hover:text-blue-600">
                              {user.fullName}
                            </span>

                            {isSelf && (
                              <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                                YOU
                              </span>
                            )}
                          </div>

                          <div className="mt-1">
                            <span
                              className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium ${getRoleBadgeStyle(
                                user.role
                              )}`}
                            >
                              {formatRole(user.role)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <PiEnvelopeSimple
                          size={16}
                          className="text-slate-400"
                        />

                        <span className="font-mono text-xs">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex max-w-xs flex-wrap gap-1.5">
                        {skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}

                        {skills.length > 3 && (
                          <span
                            className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700"
                            title={skills.slice(3).join(", ")}
                          >
                            +{skills.length - 3}
                          </span>
                        )}

                        {skills.length === 0 && (
                          <span className="text-xs italic text-slate-400">
                            No skills listed
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isSelf ? (
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              onUpdateStatus &&
                              onUpdateStatus(
                                user.id,
                                e.target.value
                              )
                            }
                            className={`cursor-pointer rounded-full border bg-white px-3 py-1.5 text-xs font-semibold outline-none transition hover:border-blue-400 focus:border-blue-400 ${getStatusBadgeStyle(
                              currentStatus
                            )}`}
                            title="Click to change your own status"
                          >
                            <option value="Active">
                              🟢 Active (You)
                            </option>

                            <option value="In Meeting">
                              🟡 In Meeting (You)
                            </option>

                            <option value="Inactive">
                              ⚪ Inactive (You)
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${getStatusDotStyle(
                              currentStatus
                            )}`}
                          />

                          <span>{currentStatus}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {assignment.isAssigned ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700">
                          <PiFolder
                            size={14}
                            className="text-cyan-600"
                          />

                          <span className="font-semibold">
                            Assigned:
                          </span>

                          <span className="max-w-[140px] truncate">
                            {assignment.projectName}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
                          <PiBriefcase
                            size={14}
                            className="text-amber-500"
                          />

                          <span>Unassigned</span>
                        </div>
                      )}
                    </td>

                    {showActions && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(user)}
                              title="Edit User"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <FaEdit size={14} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(user)}
                              title="Delete User"
                              className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-500 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-600"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  No users found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default UserTable;