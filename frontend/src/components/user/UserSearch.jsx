import { PiFunnel, PiX, PiArrowCounterClockwise } from "react-icons/pi";
import { formatRole } from "../../constants/roles.js";

const UserSearch = ({
  searchTerm,
  onSearchChange,
  roleFilter = "All",
  onRoleFilterChange = () => {},
  statusFilter = "All",
  onStatusFilterChange = () => {},
  assignmentFilter = "All",
  onAssignmentFilterChange = () => {},
  roles = [],
  onResetFilters,
}) => {
  const hasActiveFilters =
    Boolean(searchTerm) ||
    roleFilter !== "All" ||
    statusFilter !== "All" ||
    assignmentFilter !== "All";

  return (
    <div className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by user name, email, or skills (e.g. React, Spring Boot, Agile)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-800"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            title="Clear search"
          >
            <PiX size={15} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <PiFunnel size={15} className="text-blue-500 dark:text-blue-400" />
          <span>Filter Directory:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Role:</span>

            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-blue-400"
            >
              <option value="All">All Roles</option>

              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</span>

            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-blue-400"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="In Meeting">In Meeting</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Allocation:</span>

            <select
              value={assignmentFilter}
              onChange={(e) => onAssignmentFilterChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-blue-400"
            >
              <option value="All">All Allocations</option>
              <option value="Assigned">Assigned to Project</option>
              <option value="Unassigned">Unassigned (Available)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              title="Reset all filters"
            >
              <PiArrowCounterClockwise size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;