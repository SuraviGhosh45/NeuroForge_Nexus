const UserFilter = ({
  roleFilter,
  onRoleFilterChange,
  roles,
  showRoleFilter = true,
}) => {
  if (!showRoleFilter) return null;

  return (
    <div className="flex items-center gap-2">
      <select
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-[#172033] outline-none transition hover:border-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
      >
        <option value="All">All Roles</option>

        {roles.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserFilter;