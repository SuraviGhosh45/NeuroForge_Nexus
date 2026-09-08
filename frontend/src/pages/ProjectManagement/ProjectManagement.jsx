import { useState } from "react";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";

const ProjectManagement = () => {
  const {
    projects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const { users } = useUsers();
  const { teams } = useTeams();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    projectLead: "",
    projectManager: "",
    teamId: "",
    status: "Not Started",
    startDate: "",
    endDate: "",
  });

  // ---------------------------------------
  // Handle form input
  // ---------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------
  // Reset form
  // ---------------------------------------
  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
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

  // ---------------------------------------
  // Create / Update project
  // ---------------------------------------
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

  // ---------------------------------------
  // Open create form
  // ---------------------------------------
  const handleCreateClick = () => {
    setEditingProject(null);

    setForm({
      name: "",
      code: "",
      description: "",
      projectLead: "",
      projectManager: "",
      teamId: "",
      status: "Not Started",
      startDate: "",
      endDate: "",
    });

    setShowForm(true);
  };

  // ---------------------------------------
  // Edit project
  // ---------------------------------------
  const handleEdit = (project) => {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      code: project.code || "",
      description: project.description || "",
      projectLead: project.projectLead ? String(project.projectLead.id) : "",
      projectManager: project.projectManager ? String(project.projectManager.id) : "",
      teamId: project.team ? String(project.team.id) : "",
      status: project.status || "Not Started",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });

    setShowForm(true);
  };

  // ---------------------------------------
  // Delete project
  // ---------------------------------------
  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (confirmed) {
      const result = await deleteProject(projectId);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-200 p-6">

      {/* =====================================
          HEADER
      ===================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Project Management
          </h1>

          <p className="text-gray-400 mt-1">
            Create and manage projects, teams and project members.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Create Project
        </button>
      </div>

      {/* =====================================
          CREATE / EDIT FORM
      ===================================== */}
      {showForm && (
        <div className="bg-[#181b23] border border-gray-700 rounded-xl p-6 mb-8 shadow-lg">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold text-white">
                {editingProject
                  ? "Edit Project"
                  : "Create New Project"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Enter the project information below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* =================================
                PROJECT NAME + CODE
            ================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Project Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Project Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Example: PROJ-001"
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}
            <div className="mt-5">

              <label className="block text-sm text-gray-300 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the project..."
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 resize-none"
              />

            </div>

            {/* =================================
                PROJECT LEAD + MANAGER
            ================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

              {/* Project Lead */}
              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Project Lead
                </label>

                <select
                  name="projectLead"
                  value={form.projectLead}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select Project Lead
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>

              </div>

              {/* Project Manager */}
              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Project Manager
                </label>

                <select
                  name="projectManager"
                  value={form.projectManager}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select Project Manager
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>

              </div>

            </div>

            {/* =================================
                TEAM
            ================================= */}
            <div className="mt-5">

              <label className="block text-sm text-gray-300 mb-2">
                Team
              </label>

              <select
                name="teamId"
                value={form.teamId}
                onChange={handleChange}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Team
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>

              {teams.length === 0 && (
                <p className="text-xs text-yellow-500 mt-2">
                  No teams available. Create a team first.
                </p>
              )}

            </div>

            {/* =================================
                STATUS + DATES
            ================================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

              {/* Status */}
              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                >
                  <option value="Not Started">
                    Not Started
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="On Hold">
                    On Hold
                  </option>
                </select>

              </div>

              {/* Start Date */}
              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />

              </div>

              {/* End Date */}
              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />

              </div>

            </div>

            {/* =================================
                FORM BUTTONS
            ================================= */}
            <div className="flex justify-end gap-3 mt-7">

              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
              >
                {editingProject
                  ? "Update Project"
                  : "Create Project"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =====================================
          PROJECT STATISTICS
      ===================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Total */}
        <div className="bg-[#181b23] border border-gray-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            Total Projects
          </p>

          <p className="text-3xl font-bold text-white mt-2">
            {projects.length}
          </p>

        </div>

        {/* Not Started */}
        <div className="bg-[#181b23] border border-gray-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            Not Started
          </p>

          <p className="text-3xl font-bold text-gray-300 mt-2">
            {
              projects.filter(
                (project) =>
                  project.status === "Not Started"
              ).length
            }
          </p>

        </div>

        {/* In Progress */}
        <div className="bg-[#181b23] border border-gray-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            In Progress
          </p>

          <p className="text-3xl font-bold text-blue-400 mt-2">
            {
              projects.filter(
                (project) =>
                  project.status === "In Progress"
              ).length
            }
          </p>

        </div>

        {/* Completed */}
        <div className="bg-[#181b23] border border-gray-700 rounded-xl p-5">

          <p className="text-sm text-gray-400">
            Completed
          </p>

          <p className="text-3xl font-bold text-green-400 mt-2">
            {
              projects.filter(
                (project) =>
                  project.status === "Completed"
              ).length
            }
          </p>

        </div>

      </div>

      {/* =====================================
          PROJECT TABLE
      ===================================== */}
      <div className="bg-[#181b23] border border-gray-700 rounded-xl overflow-hidden shadow-lg">

        {/* Table Header */}
        <div className="px-6 py-5 border-b border-gray-700">

          <h2 className="text-xl font-semibold text-white">
            All Projects
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Manage your projects from here.
          </p>

        </div>

        {projects.length === 0 ? (

          /* =================================
              EMPTY STATE
          ================================= */
          <div className="text-center py-16">

            <div className="text-5xl mb-4">
              📁
            </div>

            <h3 className="text-lg font-medium text-white">
              No projects yet
            </h3>

            <p className="text-gray-400 mt-2">
              Create your first project to get started.
            </p>

            <button
              onClick={handleCreateClick}
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition"
            >
              + Create Project
            </button>

          </div>

        ) : (

          /* =================================
              TABLE
          ================================= */
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-[#11141b]">

                <tr className="text-left text-sm text-gray-400">

                  <th className="px-6 py-4 font-medium">
                    Project
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Code
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Project Lead
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Project Manager
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Team
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Start Date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    End Date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-800">

                {projects.map((project) => (

                  <tr
                    key={project.id}
                    className="hover:bg-[#20232c] transition"
                  >

                    {/* Project */}
                    <td className="px-6 py-4">

                      <div>

                        <p className="font-medium text-white">
                          {project.name}
                        </p>

                        {project.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {project.description}
                          </p>
                        )}

                      </div>

                    </td>

                    {/* Code */}
                    <td className="px-6 py-4">

                      <span className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-sm">
                        {project.code || "-"}
                      </span>

                    </td>

                    {/* Project Lead */}
                    <td className="px-6 py-4 text-gray-300">
                      {project.projectLead ? project.projectLead.fullName : "-"}
                    </td>

                    {/* Project Manager */}
                    <td className="px-6 py-4 text-gray-300">
                      {project.projectManager ? project.projectManager.fullName : "-"}
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4 text-gray-300">
                      {project.team ? project.team.name : "-"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                          ${
                            project.status === "Completed"
                              ? "bg-green-500/10 text-green-400"
                              : project.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-400"
                              : project.status === "On Hold"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-gray-500/10 text-gray-400"
                          }
                        `}
                      >
                        {project.status}
                      </span>

                    </td>

                    {/* Start Date */}
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {project.startDate || "-"}
                    </td>

                    {/* End Date */}
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {project.endDate || "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            handleEdit(project)
                          }
                          className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(project.id)
                          }
                          className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

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