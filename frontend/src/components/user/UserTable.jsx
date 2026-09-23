import { FaEdit, FaTrash } from "react-icons/fa";
import { PiEnvelopeSimple, PiFolder, PiBriefcase } from "react-icons/pi";
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
  const { projectTeams } = useProjectTeam() || {};
  const { projects } = useProjects() || {};

  const usersPerPage = 10;
  const showActions = Boolean(onEdit || onDelete);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(startIndex, startIndex + usersPerPage);

  const getUserAssignment = (userId) => {
    if (!projectTeams) return { isAssigned: false, projectName: null };

    for (const [projId, members] of Object.entries(projectTeams)) {
      if (
        Array.isArray(members) &&
        members.some((m) => String(m.userId) === String(userId))
      ) {
        const proj = projects?.find((p) => String(p.id) === String(projId));
        return {
          isAssigned: true,
          projectId: projId,
          projectName: proj?.name || (projId === "1" ? "Banking System" : `Project #${projId}`),
        };
      }
    }

    return { isAssigned: false, projectName: null };
  };

  const getRoleBadgeStyle = (role) => {
    const normalized = (role || "").toLowerCase();
    if (normalized.includes("admin")) return "border-purple-400/30 bg-purple-500/10 text-purple-300";
    if (normalized.includes("manager")) return "border-blue-400/30 bg-blue-500/10 text-blue-300";
    if (normalized.includes("lead")) return "border-cyan-400/30 bg-cyan-500/10 text-cyan-300";
    if (normalized.includes("dev")) return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
    if (normalized.includes("test")) return "border-amber-400/30 bg-amber-500/10 text-amber-300";
    if (normalized.includes("qa")) return "border-rose-400/30 bg-rose-500/10 text-rose-300";
    return "border-slate-400/30 bg-slate-500/10 text-slate-300";
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Active":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "In Meeting":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "Inactive":
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";
    }
  };

  const getStatusDotStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-400 animate-pulse";
      case "In Meeting":
        return "bg-amber-400";
      case "Inactive":
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] shadow-xl shadow-black/30">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead className="border-b border-[#e8eef8]/10 bg-[#07111f]/60">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/50">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Skills (Role & Responsibilities)</th>
              <th className="px-6 py-4">Working Status</th>
              <th className="px-6 py-4">Project Assignment</th>
              {showActions && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e8eef8]/5">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                const assignment = getUserAssignment(user.id);
                const isSelf = Boolean(currentUserId && String(user.id) === String(currentUserId));
                const skills = Array.isArray(user.skills) ? user.skills : [];
                const currentStatus = user.status || "Active";

                return (
                  <tr
                    key={user.id}
                    className="transition hover:bg-[#e8eef8]/[0.03]"
                  >
                    {/* USER & ROLE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#e8eef8] flex items-center gap-2">
                            <span>{user.fullName}</span>
                            {isSelf && (
                              <span className="rounded-md border border-blue-400/40 bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
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
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#e8eef8]/70">
                        <PiEnvelopeSimple size={16} className="text-[#e8eef8]/40" />
                        <span className="font-mono text-xs">{user.email}</span>
                      </div>
                    </td>

                    {/* SKILLS BASED ON ROLES & RESPONSIBILITIES */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-[#e8eef8]/10 bg-[#07111f] px-2 py-0.5 text-xs text-[#e8eef8]/80"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span
                            className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-blue-300"
                            title={skills.slice(3).join(", ")}
                          >
                            +{skills.length - 3}
                          </span>
                        )}
                        {skills.length === 0 && (
                          <span className="text-xs italic text-[#e8eef8]/30">
                            No skills listed
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS (ONLY SELF CAN MODIFY, OTHERS ARE STRICTLY READ-ONLY) */}
                    <td className="px-6 py-4">
                      {isSelf ? (
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              onUpdateStatus && onUpdateStatus(user.id, e.target.value)
                            }
                            className={`rounded-full border bg-[#07111f] px-3 py-1.5 text-xs font-semibold outline-none transition cursor-pointer hover:border-blue-400 focus:border-blue-400 ${getStatusBadgeStyle(
                              currentStatus
                            )}`}
                            title="Click to change your own status"
                          >
                            <option value="Active">🟢 Active (You)</option>
                            <option value="In Meeting">🟡 In Meeting (You)</option>
                            <option value="Inactive">⚪ Inactive (You)</option>
                          </select>
                        </div>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                          title="Member status can only be modified by the user themselves"
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

                    {/* PROJECT ASSIGNMENT */}
                    <td className="px-6 py-4">
                      {assignment.isAssigned ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                          <PiFolder size={14} className="text-cyan-400" />
                          <span className="font-semibold">Assigned:</span>
                          <span className="max-w-[140px] truncate">
                            {assignment.projectName}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-400/90">
                          <PiBriefcase size={14} className="text-amber-400/60" />
                          <span>Unassigned</span>
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    {showActions && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(user)}
                              title="Edit User"
                              className="rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 p-2 text-[#e8eef8]/70 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300"
                            >
                              <FaEdit size={14} />
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(user)}
                              title="Delete User"
                              className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
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
                  className="px-6 py-12 text-center text-sm text-[#e8eef8]/40"
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