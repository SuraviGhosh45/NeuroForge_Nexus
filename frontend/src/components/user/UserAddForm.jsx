import { useState } from "react";
import { PiX, PiPlus, PiCheckCircle, PiXCircle } from "react-icons/pi";
import {
  ROLE_DEFAULT_SKILLS,
  normalizeUserRole,
} from "../../context/UsersContext.jsx";
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

const UserAddForm = ({ onCancel, onCreateUser }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("developer");
  const [status, setStatus] = useState("Active");
  const [skills, setSkills] = useState(
    ROLE_DEFAULT_SKILLS.developer || []
  );
  const [newSkillInput, setNewSkillInput] = useState("");

  const roleKey = normalizeUserRole(role);
  const suggestedSkills = ROLE_DEFAULT_SKILLS[roleKey] || [];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const newRoleKey = normalizeUserRole(newRole);
    const defaults = ROLE_DEFAULT_SKILLS[newRoleKey] || [];
    setSkills(defaults);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter a user full name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter an email address.");
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.trim(),
      role,
      status,
      skills,
    };

    onCreateUser(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl shadow-slate-900/20">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">
              Add New User
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Create a new user account with role-based skills and active
              status
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#172033]"
          >
            <PiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="add-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#475569]"
            >
              Full Name
            </label>

            <input
              id="add-name"
              type="text"
              placeholder="e.g. Rachel Adams"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="add-email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#475569]"
            >
              Email Address
            </label>

            <input
              id="add-email"
              type="email"
              placeholder="e.g. rachel.adams@neuroforge.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="add-role"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#475569]"
            >
              System Role
            </label>

            <select
              id="add-role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {formatRole(r)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#475569]">
              Active Status
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                  status === "Active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#172033]"
                }`}
              >
                <PiCheckCircle
                  size={18}
                  className={
                    status === "Active"
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }
                />
                <span>Active</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("Inactive")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                  status === "Inactive"
                    ? "border-slate-300 bg-slate-100 text-slate-700 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#172033]"
                }`}
              >
                <PiXCircle
                  size={18}
                  className="text-slate-400"
                />
                <span>Inactive</span>
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Skills & Responsibilities
              </label>

              <span className="text-xs text-[#64748B]">
                {skills.length} skills selected
              </span>
            </div>

            <div className="mb-3 flex min-h-[36px] flex-wrap gap-1.5 rounded-xl border border-slate-300 bg-[#F1F5F9] p-2.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="rounded text-blue-500 transition hover:text-blue-800"
                  >
                    <PiX size={13} />
                  </button>
                </span>
              ))}

              {skills.length === 0 && (
                <span className="py-1 text-xs italic text-slate-400">
                  No skills selected yet.
                </span>
              )}
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="text"
                placeholder="Add custom skill..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              />

              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <PiPlus size={14} />
                <span>Add</span>
              </button>
            </div>

            {suggestedSkills.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-[#64748B]">
                  Recommended for {formatRole(role)}:
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
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#172033]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddForm;