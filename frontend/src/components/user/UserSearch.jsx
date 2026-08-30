
import UserFilter from "./UserFilter";

const UserSearch = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roles,
  showRoleFilter = true,
}) => {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-lg border border-[#e8eef8]/10 bg-[#0d1a2b] p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md gap-1.5">
        
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] py-2.5 pl-10 pr-4 text-sm text-[#e8eef8] placeholder:text-[#e8eef8]/40 outline-none transition focus:border-[#e8eef8]/40 focus:ring-2 focus:ring-[#e8eef8]/10"
        />
      </div>

      <UserFilter
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
        roles={roles}
        showRoleFilter={showRoleFilter}
      />
    </div>
  );
};

export default UserSearch;