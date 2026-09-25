import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";
import Can from "../../components/common/Can.jsx";
import { ROLES, normalizeRole } from "../../constants/roles.js";
import { PiPlus, PiFolder, PiTrash, PiPencilSimple } from "react-icons/pi";

const ProjectManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { can } = usePermission();

  const {
    projects,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
    getVisibleProjects,
  } = useProjects();

  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { teams, loading: teamsLoading, error: teamsError } = useTeams();
  const { projectTeams } = useProjectTeam();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    repository: "",
    projectLead: "",
    projectManager: "",
    teamId: "",
    status: "Not Started",
    startDate: "",
    endDate: "",
  });

  // Layer 2 Scoped Projects List
  const visibleProjects = getVisibleProjects(currentUser, projectTeams, teams);

  // Actions field: Only visible to Admin and Project Manager.
  // Explicitly removed for Project Lead, Team Lead, Developer, Tester, and QA.
  const currentRole = normalizeRole(currentUser?.role);
  const showActions =
    (currentRole === ROLES.ADMIN || currentRole === ROLES.PROJECT_MANAGER) &&
    (can("project:edit") || can("project:delete"));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      repository: "",
      projectLead: "",
      projectManager: "",
      teamId: "",
      status: "Not Started",
      startDate: "",
      endDate: "",
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Project name is required.");
      return;
    }

    if (editingProject) {
      const result = await updateProject({ ...form, id: editingProject.id });
      if (!result.success) {
        alert(result.message);
        return;
      }
    } else {
      const result = await createProject(form);
      if (!result.success) {
        alert(result.message);
        return;
      }
    }

    resetForm();
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setForm({
      name: "",
      code: "",
      description: "",
      repository: "",
      projectLead: "",
      projectManager: "",
      teamId: "",
      status: "Not Started",
      startDate: "",
      endDate: "",
    });
    setShowForm(true);
  };

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setEditingProject(project);
    setForm({
      name: project.name || "",
      code: project.code || "",
      description: project.description || "",
      repository: project.repository || "",
      projectLead: String(project.projectLead?.id ?? project.projectLeadId ?? ""),
      projectManager: String(project.projectManager?.id ?? project.projectManagerId ?? ""),
      teamId: String(project.team?.id ?? project.teamId ?? ""),
      status: project.status || "Not Started",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (confirmed) {
      const result = await deleteProject(projectId);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Portfolio Management
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/60">
            Select a project to enter its workspace and view its decomposed tasks.
          </p>
        </div>

        <Can perform="project:create">
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <PiPlus size={18} />
            Create Project
          </button>
        </Can>
      </div>

      {/* Form Modal / Inline Form */}
      {showForm && (
        <div className="rounded-2xl border border-blue-500/20 bg-[#0d131f] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h2>
              <p className="text-xs text-[#e8eef8]/50 mt-1">
                Configure delivery timeline, managers, and assigned engineering team.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-1 text-[#e8eef8]/50 hover:bg-[#e8eef8]/5 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Cloud Migration Suite"
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Project Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CMS-101"
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Scope and purpose of this project..."
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-3 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="mt-5">
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Repository Link</label>
              <input
                type="url"
                name="repository"
                value={form.repository}
                onChange={handleChange}
                placeholder="e.g. https://github.com/organization/repository"
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Project Lead</label>
                <select
                  name="projectLead"
                  value={form.projectLead}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select Project Lead</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} {user.status === "Inactive" ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Project Manager</label>
                <select
                  name="projectManager"
                  value={form.projectManager}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select Project Manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} {user.status === "Inactive" ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#e8eef8]/15 px-4 py-2 text-xs font-medium text-[#e8eef8]/70 hover:bg-[#e8eef8]/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                {editingProject ? "Update Project" : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-lg">
        <div className="border-b border-[#e8eef8]/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Project Workspaces</h2>
            <p className="text-xs text-[#e8eef8]/50">Click any project to enter its detailed workspace</p>
          </div>
          <span className="text-xs text-[#e8eef8]/50 font-medium">
            Showing {visibleProjects.length} projects
          </span>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="py-16 text-center">
            <PiFolder size={44} className="mx-auto text-[#e8eef8]/20 mb-3" />
            <h3 className="text-base font-medium text-white">No projects found in your scope</h3>
            <p className="mt-1 text-xs text-[#e8eef8]/50">
              You are not currently assigned to any active projects.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e17] border-b border-[#e8eef8]/5 text-left text-xs font-medium text-[#e8eef8]/50">
                <tr>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Project Lead</th>
                  <th className="px-6 py-3.5">Project Manager</th>
                  <th className="px-6 py-3.5">Team Members</th>
                  <th className="px-6 py-3.5">Repository</th>
                  <th className="px-6 py-3.5">Status</th>
                  {showActions && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eef8]/5 text-sm">
                {visibleProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="cursor-pointer transition hover:bg-[#181f2f]/60 group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-white group-hover:text-blue-400 transition">
                          {project.name}
                        </span>
                        {project.description && (
                          <p className="text-xs text-[#e8eef8]/40 truncate max-w-xs mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md bg-[#0a0e17] border border-[#e8eef8]/10 px-2 py-0.5 text-xs text-[#e8eef8]/70">
                        {project.code || "NO-CODE"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                      {project.projectLead?.fullName || "-"}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                      {project.projectManager?.fullName || "-"}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                      {(() => {
                        const count = projectTeams?.[String(project.id)]?.length || 0;
                        return (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#0a0e17] border border-[#e8eef8]/10 px-2 py-0.5 text-xs text-[#e8eef8]/80">
                            {count} {count === 1 ? "member" : "members"}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      {project.repository ? (
                        <a
                          href={project.repository.startsWith("http") ? project.repository : `https://${project.repository}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 underline transition text-xs"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="font-semibold text-[#e8eef8]/40 text-xs">__</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                          project.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : project.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {project.status || "Not Started"}
                      </span>
                    </td>

                    {showActions && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Can perform="project:edit">
                            <button
                              onClick={(e) => handleEdit(project, e)}
                              title="Edit project"
                              className="rounded-lg p-1.5 text-[#e8eef8]/50 hover:bg-blue-500/10 hover:text-blue-400 transition"
                            >
                              <PiPencilSimple size={16} />
                            </button>
                          </Can>

                          <Can perform="project:delete">
                            <button
                              onClick={(e) => handleDelete(project.id, e)}
                              title="Delete project"
                              className="rounded-lg p-1.5 text-[#e8eef8]/50 hover:bg-rose-500/10 hover:text-rose-400 transition"
                            >
                              <PiTrash size={16} />
                            </button>
                          </Can>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  
    </div>
  );
};

export default ProjectManagement;