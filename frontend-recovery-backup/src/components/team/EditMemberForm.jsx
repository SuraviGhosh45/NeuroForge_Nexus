import { useState } from "react";

const TEAM_ROLES = ["Manager", "Member"];

const EditMemberForm = ({ member, onCancel, onSave }) => {
  const [teamRole, setTeamRole] = useState(member.teamRole);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...member,
      teamRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-6">
        <h2 className="text-lg font-semibold text-[#e8eef8]">
          Edit team role
        </h2>

        <p className="mt-1 mb-5 text-sm text-[#e8eef8]/50">
          {member.user?.fullName || "Unknown User"}
        </p>

        <form onSubmit={handleSubmit}>
          <select
            value={teamRole}
            onChange={(e) => setTeamRole(e.target.value)}
            className="w-full rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none"
          >
            {TEAM_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-[#e8eef8]/15 px-4 py-2 text-sm text-[#e8eef8]/70"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-md bg-[#e8eef8] px-4 py-2 text-sm font-medium text-[#07111f]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberForm;