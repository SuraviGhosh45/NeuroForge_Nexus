import { useState } from "react";
import { PiX, PiPlus, PiCheckCircle, PiXCircle, PiClock } from "react-icons/pi";
import { ROLE_DEFAULT_SKILLS, normalizeUserRole } from "../../context/UsersContext.jsx";
import { formatRole } from "../../constants/roles.js";

const AVAILABLE_ROLES = [
  "admin",
  "project_manager",
  "project_lead",
  "team_lead",
  "developer",
  "tester",
  "qa",
];

const EditUserForm = ({ user, currentUserId, onCancel, onSave }) => {
  const isSelf = Boolean(currentUserId && String(user.id) === String(currentUserId));

  const [fullName, setFullName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "developer");
  const [status, setStatus] = useState(user.status || "Active");
  const [skills, setSkills] = useState(
    Array.isArray(user.skills) ? [...user.skills] : []
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  const roleKey = normalizeUserRole(role);
  const suggestedSkills = ROLE_DEFAULT_SKILLS[roleKey] || [];

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const newRoleKey = normalizeUserRole(newRole);
    const defaults = ROLE_DEFAULT_SKILLS[newRoleKey] || [];
    if (skills.length === 0) {
      setSkills(defaults);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.trim(),
      role,
      status: isSelf ? status : (user.status || "Active"),
      skills,
    };

    onSave(updatedUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-6 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#e8eef8]">Edit User Profile</h2>
            <p className="mt-1 text-sm text-[#e8eef8]/50">
              Update user details, role responsibilities, skills, and profile data
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-[#e8eef8]/40 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
          >
            <PiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* FULL NAME */}
          <div>
            <label
              htmlFor="edit-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
            >
              Full Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="edit-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
            >
              Email Address
            </label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* ROLE */}
          <div>
            <label
              htmlFor="edit-role"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70"
            >
              System Role
            </label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {formatRole(r)}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIVE STATUS (ONLY SELF CAN MODIFY) */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70">
              Active Status
            </label>

            {isSelf ? (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus("Active")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      status === "Active"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10"
                        : "border-[#e8eef8]/10 bg-[#07111f] text-[#e8eef8]/50 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                    }`}
                  >
                    <PiCheckCircle size={16} className="text-emerald-400" />
                    <span>Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("In Meeting")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      status === "In Meeting"
                        ? "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/10"
                        : "border-[#e8eef8]/10 bg-[#07111f] text-[#e8eef8]/50 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                    }`}
                  >
                    <PiClock size={16} className="text-amber-400" />
                    <span>In Meeting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Inactive")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                      status === "Inactive"
                        ? "border-slate-500/40 bg-slate-500/20 text-slate-200 shadow-sm shadow-slate-500/10"
                        : "border-[#e8eef8]/10 bg-[#07111f] text-[#e8eef8]/50 hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                    }`}
                  >
                    <PiXCircle size={16} className="text-slate-400" />
                    <span>Inactive</span>
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#e8eef8]/40">
                  Update your current working status visible across the team.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      (user.status || "Active") === "Active"
                        ? "bg-emerald-400 animate-pulse"
                        : (user.status || "Active") === "In Meeting"
                        ? "bg-amber-400"
                        : "bg-slate-500"
                    }`}
                  />
                  <span className="font-semibold text-white">
                    {user.status || "Active"}
                  </span>
                </div>
                <span className="text-xs text-[#e8eef8]/40 italic">
                  (Members can only update their own status)
                </span>
              </div>
            )}
          </div>

          {/* SKILLS BASED ON ROLES & RESPONSIBILITIES */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#e8eef8]/70">
                Skills & Responsibilities
              </label>
              <span className="text-xs text-[#e8eef8]/40">
                {skills.length} skills listed
              </span>
            </div>

            {/* Current skill chips */}
            <div className="mb-3 flex flex-wrap gap-1.5 min-h-[36px] rounded-xl border border-[#e8eef8]/10 bg-[#07111f] p-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="rounded text-blue-400/70 hover:text-blue-200"
                  >
                    <PiX size={13} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs italic text-[#e8eef8]/30 py-1">
                  No skills added yet. Add custom skills or choose from suggestions below.
                </span>
              )}
            </div>

            {/* Add custom skill */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add custom skill (e.g. Docker, GraphQL, Kubernetes)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2 text-xs text-[#e8eef8] outline-none transition focus:border-blue-500/50"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="inline-flex items-center gap-1 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition"
              >
                <PiPlus size={14} />
                <span>Add</span>
              </button>
            </div>

            {/* Suggested skills for selected role */}
            {suggestedSkills.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[#e8eef8]/50">
                  Suggested for {formatRole(role)}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((suggested) => {
                    const isSelected = skills.includes(suggested);
                    return (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() =>
                          isSelected
                            ? handleRemoveSkill(suggested)
                            : handleAddSkill(suggested)
                        }
                        className={`rounded-lg border px-2 py-0.5 text-xs font-medium transition ${
                          isSelected
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : "border-[#e8eef8]/10 bg-[#07111f] text-[#e8eef8]/60 hover:border-blue-500/30 hover:text-[#e8eef8]"
                        }`}
                      >
                        {isSelected ? `✓ ${suggested}` : `+ ${suggested}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#e8eef8]/10">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-[#e8eef8]/15 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/70 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;