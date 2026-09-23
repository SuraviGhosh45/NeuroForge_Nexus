const UserFilter = ({ roleFilter, onRoleFilterChange, roles, showRoleFilter = true }) => {
  // Hide entirely for roles that shouldn't filter by role (e.g. Team Lead, Employee)
  if (!showRoleFilter) return null;

  return (
    <div className="flex items-center gap-2">
      <select
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        className="rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-[#e8eef8]/40 focus:ring-2 focus:ring-[#e8eef8]/10"
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