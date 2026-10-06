import { useState, useEffect } from "react";
import {
  PiUser,
  PiEnvelopeSimple,
  PiPhone,
  PiBriefcase,
  PiCheckCircle,
  PiClock,
  PiShieldCheck,
  PiFolder,
  PiX,
  PiPlus,
  PiFloppyDisk,
  PiSparkle,
  PiUserSwitch,
  PiInfo,
} from "react-icons/pi";
import { useAuth } from "../../context/AuthContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { normalizeRole } from "../../constants/roles.js";

const STATUS_OPTIONS = [
  {
    id: "Active",
    label: "Active & Available",
    badgeLabel: "Active",
    color: "emerald",
    dotClass: "bg-emerald-500",
    bgClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    description: "Available for tasks, sprint deliverables, code reviews, and discussions.",
  },
  {
    id: "In Meeting",
    label: "In Meeting / Sync",
    badgeLabel: "In Meeting",
    color: "amber",
    dotClass: "bg-amber-500",
    bgClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    description: "Currently in a sprint sync, client review, or architectural design session.",
  },
  {
    id: "Inactive",
    label: "Inactive / Away",
    badgeLabel: "Inactive",
    color: "slate",
    dotClass: "bg-slate-400",
    bgClass: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    description: "Away from desk, on leave, or focused in offline deep-work mode.",
  },
];

const Settings = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { users = [], updateUser, updateUserStatus } = useUsers() || {};
  const { projectTeams = {}, syncUserStatusAcrossTeams } = useProjectTeam() || {};
  const { projects = [] } = useProjects() || {};

  // Find authoritative user record if available in users list
  const existingUserRecord = users.find(
    (u) => String(u.id) === String(currentUser?.id)
  ) || currentUser;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
    status: "Active",
    skills: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Populate state on mount / currentUser change
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "+91 98765 43210",
        department: currentUser.department || "Software Engineering & Cloud Systems",
        bio:
          currentUser.bio ||
          `Engineer at NeuroForge SDLC platform contributing to modern web engineering and distributed enterprise architectures.`,
        status: existingUserRecord?.status || currentUser.status || "Active",
        skills: Array.isArray(existingUserRecord?.skills)
          ? existingUserRecord.skills
          : Array.isArray(currentUser.skills)
          ? currentUser.skills
          : ["React", "Spring Boot", "REST APIs", "PostgreSQL"],
      });
    }
  }, [currentUser, existingUserRecord?.status]);

  // Find projects assigned to this user
  const userProjects = [];
  if (Array.isArray(projects) && currentUser?.id) {
    projects.forEach((p) => {
      const members = projectTeams?.[String(p.id)] || [];
      const isMember = members.some((m) => String(m.userId) === String(currentUser.id));
      const isLead = String(p.projectLeadId) === String(currentUser.id);
      const isPM = String(p.projectManagerId) === String(currentUser.id);

      if (isMember || isLead || isPM) {
        userProjects.push({
          id: p.id,
          name: p.name,
          code: p.code,
          role: isLead ? "Project Lead" : isPM ? "Project Manager" : "Team Member",
          status: p.status || "In Progress",
        });
      }
    });
  }

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (!formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleStatusChange = async (newStatus) => {
    setFormData((prev) => ({ ...prev, status: newStatus }));
    setErrorMsg("");

        if (currentUser?.id) {
      if (updateCurrentUser) {
        await updateCurrentUser({ status: newStatus });
      }
      if (updateUserStatus) {
        await updateUserStatus(currentUser.id, newStatus, currentUser.id);
      }
      if (syncUserStatusAcrossTeams) {
        syncUserStatusAcrossTeams(currentUser.id, newStatus);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const updates = {
        fullName: formData.fullName,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        bio: formData.bio,
        skills: formData.skills,
        status: formData.status,
      };

            if (updateCurrentUser) {
        await updateCurrentUser(updates);
      }

      if (updateUser && currentUser?.id) {
        await updateUser({ id: currentUser.id, ...updates }, currentUser.id);
      }

      if (syncUserStatusAcrossTeams && currentUser?.id) {
        syncUserStatusAcrossTeams(currentUser.id, formData.status);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const userRoleFormatted = normalizeRole(currentUser?.role || "developer")
    .toUpperCase()
    .replace(/_/g, " ");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings & Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal credentials, working availability status, role competencies, and account preferences
        </p>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <PiCheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0" size={22} />
          <div>
            <p className="font-semibold">Profile & Status Updated Successfully!</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              Your working status and details have been synchronized across User Management, Project Workspaces, and Team Rosters.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 shadow-sm">
          <PiInfo className="text-red-600 dark:text-red-400 shrink-0" size={20} />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Section 1: Real-Time Working Status Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <PiClock className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Current Working Status
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your active availability status is visible in real-time to Administrators, Project Managers, Team Leads, and Teammates.
            </p>
          </div>

          {/* Current Active Badge Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</span>
            {(() => {
              const currentOpt = STATUS_OPTIONS.find((s) => s.id === formData.status) || STATUS_OPTIONS[0];
              return (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${currentOpt.bgClass}`}>
                  <span className={`h-2 w-2 rounded-full ${currentOpt.dotClass} animate-pulse`} />
                  {currentOpt.badgeLabel}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Status Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = formData.status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStatusChange(opt.id)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.dotClass}`} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {opt.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/80 px-2 py-0.5 rounded-md">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Profile & Account Information */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-sm">
                {(formData.fullName || currentUser?.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Profile Details
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {userRoleFormatted}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ID #{currentUser?.id || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <PiShieldCheck size={16} className="text-emerald-500" />
              Role Authenticated
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <PiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Marcus Vance"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <PiEnvelopeSimple className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. dev@neuroforge.io"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <PiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {/* Department / Division */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department & Division
              </label>
              <div className="relative">
                <PiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering / Cloud Platforms"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>
            </div>

            {/* Bio / Summary */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Professional Bio & Responsibilities
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief summary of your role, technical strengths, and project contributions..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white resize-none"
              />
            </div>

            {/* Skills & Competencies */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skills & Technical Competencies
              </label>

              {/* Skills Tag Pills */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition"
                      title={`Remove ${skill}`}
                    >
                      <PiX size={13} />
                    </button>
                  </span>
                ))}

                {formData.skills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Docker, TypeScript, Jest)"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                >
                  <PiPlus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Project Allocations Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center gap-2 mb-4">
            <PiFolder className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Project Allocations
            </h2>
          </div>

          {userProjects.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are not currently assigned to any active project workspaces. An administrator or project manager can assign you via User Management.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userProjects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {p.role}
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            <PiFloppyDisk size={18} />
            <span>{isSaving ? "Saving..." : "Save Profile & Status"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
