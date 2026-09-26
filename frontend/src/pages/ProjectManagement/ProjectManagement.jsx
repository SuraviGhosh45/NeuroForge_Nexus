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
    updateProjectStatus,
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

  const visibleProjects = getVisibleProjects(
    currentUser,
    projectTeams,
    teams
  );

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
      const result = await updateProject({
        ...form,
        id: editingProject.id,
      });

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

  const handleEdit = (project, event) => {
    event.stopPropagation();

    setEditingProject(project);

    setForm({
      name: project.name || "",
      code: project.code || "",
      description: project.description || "",
      repository: project.repository || "",
      projectLead: String(
        project.projectLead?.id ?? project.projectLeadId ?? ""
      ),
      projectManager: String(
        project.projectManager?.id ?? project.projectManagerId ?? ""
      ),
      teamId: String(project.team?.id ?? project.teamId ?? ""),
      status: project.status || "Not Started",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });

    setShowForm(true);
  };

  const handleDelete = async (projectId, event) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    const result = await deleteProject(projectId);

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Portfolio Management
          </span>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
            Projects
          </h1>

          <p className="mt-1 text-sm text-[#475569]">
            Select a project to enter its workspace and view its decomposed
            tasks.
          </p>
        </div>

        <Can perform="project:create">
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
          >
            <PiPlus size={18} />
            Create Project
          </button>
        </Can>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172033]">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Configure delivery timeline, managers, and assigned
                engineering team.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#172033]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Project Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Cloud Migration Suite"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Project Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. CMS-101"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Scope and purpose of this project..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Repository Link
              </label>

              <input
                type="url"
                name="repository"
                value={form.repository}
                onChange={handleChange}
                placeholder="e.g. https://github.com/organization/repository"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Project Lead
                </label>

                <select
                  name="projectLead"
                  value={form.projectLead}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="">Select Project Lead</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}{" "}
                      {user.status === "Inactive" ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Project Manager
                </label>

                <select
                  name="projectManager"
                  value={form.projectManager}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="">Select Project Manager</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}{" "}
                      {user.status === "Inactive" ? "(Inactive)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#172033]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
              >
                {editingProject ? "Update Project" : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#172033]">
              Project Workspaces
            </h2>

            <p className="text-xs text-[#64748B]">
              Click any project to enter its detailed workspace
            </p>
          </div>

          <span className="text-xs font-medium text-[#64748B]">
            Showing {visibleProjects.length} projects
          </span>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="py-16 text-center">
            <PiFolder
              size={44}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="text-base font-medium text-[#172033]">
              No projects found in your scope
            </h3>

            <p className="mt-1 text-xs text-[#64748B]">
              You are not currently assigned to any active projects.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#172033] text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Project Lead</th>
                  <th className="px-6 py-3.5">Project Manager</th>
                  <th className="px-6 py-3.5">Team Members</th>
                  <th className="px-6 py-3.5">Repository</th>
                  <th className="px-6 py-3.5">Status</th>
                  {showActions && (
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {visibleProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="group cursor-pointer transition hover:bg-[#F1F5F9]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-[#172033] transition group-hover:text-[#2563EB]">
                          {project.name}
                        </span>

                        {project.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-[#64748B]">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md border border-slate-200 bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                        {project.code || "NO-CODE"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#475569]">
                      {project.projectLead?.fullName || "-"}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#475569]">
                      {project.projectManager?.fullName || "-"}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#475569]">
                      {(() => {
                        const count =
                          projectTeams?.[String(project.id)]?.length || 0;

                        return (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
                            {count} {count === 1 ? "member" : "members"}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">
                      {project.repository ? (
                        <a
                          href={
                            project.repository.startsWith("http")
                              ? project.repository
                              : `https://${project.repository}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] underline transition hover:text-[#4F46E5]"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {showActions ? (
                        <select
                          value={project.status || "Not Started"}
                          onClick={(event) => event.stopPropagation()}
                          onChange={async (event) => {
                            event.stopPropagation();

                            const newStatus = event.target.value;

                            const result = await updateProjectStatus(
                              project.id,
                              newStatus
                            );

                            if (result && !result.success) {
                              alert(
                                result.message ||
                                  "Failed to update project status"
                              );
                            }
                          }}
                          className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium outline-none transition ${
                            project.status === "Completed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : project.status === "In Progress"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : project.status === "On Hold"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                            project.status === "Completed"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : project.status === "In Progress"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : project.status === "On Hold"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {project.status || "Not Started"}
                        </span>
                      )}
                    </td>

                    {showActions && (
                      <td className="px-6 py-4 text-right">
                        <div
                          className="inline-flex items-center gap-1.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Can perform="project:edit">
                            <button
                              onClick={(event) =>
                                handleEdit(project, event)
                              }
                              title="Edit project"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#2563EB]"
                            >
                              <PiPencilSimple size={16} />
                            </button>
                          </Can>

                          <Can perform="project:delete">
                            <button
                              onClick={(event) =>
                                handleDelete(project.id, event)
                              }
                              title="Delete project"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-[#DC2626]"
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