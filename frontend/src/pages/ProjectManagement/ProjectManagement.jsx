import { useMemo, useState } from "react";
import "./ProjectManagement.css";

const initialProjects = [
  {
    id: 1,
    name: "FinCore Nexus",
    code: "FCN",
    description:
      "Enterprise financial platform for secure transaction and account management.",
    manager: "Aarav Sharma",
    status: "Active",
    health: "Healthy",
    progress: 72,
    sprint: "Sprint 12",
    tasks: 23,
    completedTasks: 17,
    milestone: "Release 2.3",
    dueDate: "20 Sep 2026",
    teamSize: 12,
    startDate: "10 Jun 2026",
    endDate: "30 Sep 2026",
  },
  {
    id: 2,
    name: "HealthSync",
    code: "HS",
    description:
      "Healthcare workflow platform connecting patient, provider and operational services.",
    manager: "Priya Verma",
    status: "Active",
    health: "Healthy",
    progress: 58,
    sprint: "Sprint 8",
    tasks: 17,
    completedTasks: 10,
    milestone: "Beta Release",
    dueDate: "05 Oct 2026",
    teamSize: 9,
    startDate: "18 Jul 2026",
    endDate: "20 Oct 2026",
  },
  {
    id: 3,
    name: "RetailPro",
    code: "RP",
    description:
      "Retail operations and inventory intelligence platform.",
    manager: "Rahul Mehta",
    status: "Completed",
    health: "Healthy",
    progress: 100,
    sprint: "Sprint 18",
    tasks: 31,
    completedTasks: 31,
    milestone: "Production Release",
    dueDate: "30 Jul 2026",
    teamSize: 15,
    startDate: "01 Mar 2026",
    endDate: "30 Jul 2026",
  },
  {
    id: 4,
    name: "CloudOps Hub",
    code: "COH",
    description:
      "Cloud infrastructure monitoring and deployment management platform.",
    manager: "Neha Kapoor",
    status: "At Risk",
    health: "Needs Attention",
    progress: 41,
    sprint: "Sprint 10",
    tasks: 19,
    completedTasks: 8,
    milestone: "Infrastructure Migration",
    dueDate: "12 Sep 2026",
    teamSize: 7,
    startDate: "01 Aug 2026",
    endDate: "30 Sep 2026",
  },
];

function ProjectManagement() {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(initialProjects[0]);

  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    manager: "",
    status: "Active",
    health: "Healthy",
    progress: 0,
    sprint: "",
    tasks: 0,
    completedTasks: 0,
    milestone: "",
    dueDate: "",
    teamSize: 0,
    startDate: "",
    endDate: "",
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase();

      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query) ||
        project.manager.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const activeProjects = projects.filter(
    (project) => project.status === "Active"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const atRiskProjects = projects.filter(
    (project) => project.status === "At Risk"
  ).length;

  const averageProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, project) => sum + project.progress, 0) /
            projects.length
        )
      : 0;

  const openCreateModal = () => {
    setEditingProject(null);

    setForm({
      name: "",
      code: "",
      description: "",
      manager: "",
      status: "Active",
      health: "Healthy",
      progress: 0,
      sprint: "",
      tasks: 0,
      completedTasks: 0,
      milestone: "",
      dueDate: "",
      teamSize: 0,
      startDate: "",
      endDate: "",
    });

    setShowCreate(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setForm({ ...project });
    setShowCreate(true);
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setShowView(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProject = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.manager.trim()) {
      return;
    }

    const normalizedProject = {
      ...form,
      id: editingProject ? editingProject.id : Date.now(),
      progress: Number(form.progress) || 0,
      tasks: Number(form.tasks) || 0,
      completedTasks: Number(form.completedTasks) || 0,
      teamSize: Number(form.teamSize) || 0,
    };

    if (editingProject) {
      setProjects((previous) =>
        previous.map((project) =>
          project.id === editingProject.id ? normalizedProject : project
        )
      );

      setSelectedProject(normalizedProject);
    } else {
      setProjects((previous) => [normalizedProject, ...previous]);
      setSelectedProject(normalizedProject);
    }

    setShowCreate(false);
  };

  const deleteProject = (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    const remaining = projects.filter(
      (project) => project.id !== projectId
    );

    setProjects(remaining);

    if (selectedProject?.id === projectId) {
      setSelectedProject(remaining[0] || null);
    }
  };

  return (
    <div className="pm-page">
      <aside className="pm-sidebar">
        <div className="pm-brand">
          <div className="pm-brand-mark">N</div>

          <div>
            <div className="pm-brand-name">NEUROFORGE</div>
            <div className="pm-brand-subtitle">NEXUS</div>
          </div>
        </div>

        <div className="pm-sidebar-label">WORKSPACE</div>

        <nav className="pm-nav">
          <button className="pm-nav-item">
            <span>⌂</span>
            Overview
          </button>

          <button className="pm-nav-item pm-nav-active">
            <span>▣</span>
            Projects
            <strong>{projects.length}</strong>
          </button>

          <button className="pm-nav-item">
            <span>♙</span>
            Users
          </button>

          <button className="pm-nav-item">
            <span>◈</span>
            Teams
          </button>

          <button className="pm-nav-item">
            <span>◷</span>
            Sprints
          </button>

          <button className="pm-nav-item">
            <span>◇</span>
            Milestones
          </button>
        </nav>

        <div className="pm-sidebar-bottom">
          <div className="pm-sidebar-label">SYSTEM</div>

          <button className="pm-nav-item">
            <span>⚙</span>
            Settings
          </button>

          <div className="pm-sidebar-user">
            <div className="pm-avatar">A</div>

            <div>
              <strong>Admin User</strong>
              <small>Project Administrator</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="pm-main">
        <header className="pm-header">
          <div className="pm-breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>Projects</strong>
          </div>

          <div className="pm-header-actions">
            <div className="pm-global-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <kbd>⌘ K</kbd>
            </div>

            <button className="pm-icon-button">♢</button>

            <div className="pm-header-avatar">A</div>
          </div>
        </header>

        <section className="pm-content">
          <div className="pm-page-heading">
            <div>
              <div className="pm-eyebrow">PROJECT MANAGEMENT</div>

              <h1>Project Workspace</h1>

              <p>
                Monitor delivery, milestones, sprint execution and project
                health from one workspace.
              </p>
            </div>

            <button
              className="pm-primary-button"
              onClick={openCreateModal}
            >
              <span>+</span>
              New Project
            </button>
          </div>

          {selectedProject && (
            <section className="pm-featured">
              <div className="pm-featured-main">
                <div className="pm-project-topline">
                  <div className="pm-project-identity">
                    <div className="pm-project-logo">
                      {selectedProject.code}
                    </div>

                    <div>
                      <div className="pm-project-code">
                        {selectedProject.code}
                      </div>

                      <h2>{selectedProject.name}</h2>
                    </div>
                  </div>

                  <span
                    className={`pm-status ${
                      selectedProject.status === "At Risk"
                        ? "risk"
                        : selectedProject.status === "Completed"
                        ? "complete"
                        : "active"
                    }`}
                  >
                    <i />
                    {selectedProject.status}
                  </span>
                </div>

                <p className="pm-featured-description">
                  {selectedProject.description}
                </p>

                <div className="pm-featured-progress">
                  <div>
                    <span>OVERALL DELIVERY</span>
                    <strong>{selectedProject.progress}%</strong>
                  </div>

                  <div className="pm-progress-track large">
                    <div
                      style={{
                        width: `${selectedProject.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pm-featured-meta">
                  <div>
                    <small>PROJECT MANAGER</small>
                    <strong>{selectedProject.manager}</strong>
                  </div>

                  <div>
                    <small>TEAM SIZE</small>
                    <strong>{selectedProject.teamSize} members</strong>
                  </div>

                  <div>
                    <small>DELIVERY WINDOW</small>
                    <strong>
                      {selectedProject.startDate} —{" "}
                      {selectedProject.endDate}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pm-featured-side">
                <div className="pm-health-label">
                  <span>PROJECT HEALTH</span>

                  <b
                    className={
                      selectedProject.health === "Healthy"
                        ? "good"
                        : "warning"
                    }
                  >
                    {selectedProject.health}
                  </b>
                </div>

                <div className="pm-health-meter">
                  <div
                    className={
                      selectedProject.health === "Healthy"
                        ? "healthy"
                        : "attention"
                    }
                  />
                </div>

                <div className="pm-health-copy">
                  {selectedProject.health === "Healthy"
                    ? "Delivery is progressing within expected targets."
                    : "This project requires attention to remain on schedule."}
                </div>

                <div className="pm-featured-actions">
                  <button
                    className="pm-outline-button"
                    onClick={() => openViewModal(selectedProject)}
                  >
                    View Details
                  </button>

                  <button
                    className="pm-dark-button"
                    onClick={() => openEditModal(selectedProject)}
                  >
                    Edit Project
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="pm-kpi-grid">
            <div className="pm-kpi">
              <div className="pm-kpi-title">
                <span className="pm-kpi-label">TOTAL PROJECTS</span>
                <span className="pm-kpi-number">01</span>
              </div>

              <strong>{projects.length}</strong>
              <small>Across the workspace</small>
            </div>

            <div className="pm-kpi">
              <div className="pm-kpi-title">
                <span className="pm-kpi-label">ACTIVE PROJECTS</span>
                <span className="pm-kpi-number">02</span>
              </div>

              <strong>{activeProjects}</strong>
              <small>Currently in delivery</small>
            </div>

            <div className="pm-kpi">
              <div className="pm-kpi-title">
                <span className="pm-kpi-label">COMPLETED</span>
                <span className="pm-kpi-number">03</span>
              </div>

              <strong>{completedProjects}</strong>
              <small>Successfully delivered</small>
            </div>

            <div className="pm-kpi">
              <div className="pm-kpi-title">
                <span className="pm-kpi-label">AT RISK</span>
                <span className="pm-kpi-number">04</span>
              </div>

              <strong>{atRiskProjects}</strong>
              <small>Need attention</small>
            </div>

            <div className="pm-kpi">
              <div className="pm-kpi-title">
                <span className="pm-kpi-label">AVG. PROGRESS</span>
                <span className="pm-kpi-number">05</span>
              </div>

              <strong>{averageProgress}%</strong>
              <small>Portfolio delivery</small>
            </div>
          </section>

          <section className="pm-workspace-grid">
            <div className="pm-panel pm-projects-panel">
              <div className="pm-panel-header">
                <div>
                  <span className="pm-panel-kicker">PROJECT PORTFOLIO</span>
                  <h3>All Projects</h3>
                </div>

                <div className="pm-filter">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                  >
                    <option value="All">All status</option>
                    <option value="Active">Active</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pm-table-scroll">
                <div className="pm-table">
                  <div className="pm-table-row pm-table-heading">
                    <span>PROJECT</span>
                    <span>PROJECT MANAGER</span>
                    <span>PROGRESS</span>
                    <span>SPRINT</span>
                    <span>MILESTONE</span>
                    <span>STATUS</span>
                    <span>ACTIONS</span>
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div className="pm-empty">
                      No projects match your search.
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <div
                        className={`pm-table-row ${
                          selectedProject?.id === project.id
                            ? "selected"
                            : ""
                        }`}
                        key={project.id}
                      >
                        <div className="pm-table-project">
                          <div className="pm-mini-logo">
                            {project.code}
                          </div>

                          <div>
                            <strong>{project.name}</strong>
                            <small>{project.code}</small>
                          </div>
                        </div>

                        <span className="pm-manager">
                          {project.manager}
                        </span>

                        <div className="pm-table-progress">
                          <div className="pm-progress-value">
                            {project.progress}%
                          </div>

                          <div className="pm-progress-track">
                            <div
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <span className="pm-sprint">
                          {project.sprint}
                        </span>

                        <div className="pm-milestone">
                          <strong>{project.milestone}</strong>
                          <small>Due {project.dueDate}</small>
                        </div>

                        <span
                          className={`pm-status-dot ${
                            project.status === "At Risk"
                              ? "risk"
                              : project.status === "Completed"
                              ? "complete"
                              : "active"
                          }`}
                        >
                          <i />
                          {project.status}
                        </span>

                        <div className="pm-row-actions">
                          <button
                            className="view"
                            onClick={() => openViewModal(project)}
                          >
                            View
                          </button>

                          <button
                            className="edit"
                            onClick={() => openEditModal(project)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete"
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <aside className="pm-right-column">
              {selectedProject && (
                <div className="pm-panel pm-delivery-panel">
                  <div className="pm-panel-header compact">
                    <div>
                      <span className="pm-panel-kicker">
                        DELIVERY TRACKING
                      </span>
                      <h3>Current Sprint</h3>
                    </div>

                    <span className="pm-sprint-badge">
                      {selectedProject.sprint}
                    </span>
                  </div>

                  <div className="pm-sprint-number">
                    <strong>
                      {selectedProject.completedTasks}
                      <span> / {selectedProject.tasks}</span>
                    </strong>

                    <small>TASKS COMPLETED</small>
                  </div>

                  <div className="pm-progress-track sprint">
                    <div
                      style={{
                        width: `${
                          selectedProject.tasks
                            ? Math.round(
                                (selectedProject.completedTasks /
                                  selectedProject.tasks) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="pm-sprint-stats">
                    <div>
                      <strong>{selectedProject.tasks}</strong>
                      <span>Total tasks</span>
                    </div>

                    <div>
                      <strong>
                        {selectedProject.tasks -
                          selectedProject.completedTasks}
                      </strong>
                      <span>Remaining</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedProject && (
                <div className="pm-panel pm-milestone-panel">
                  <div className="pm-panel-header compact">
                    <div>
                      <span className="pm-panel-kicker">
                        PROJECT ROADMAP
                      </span>
                      <h3>Milestone Timeline</h3>
                    </div>
                  </div>

                  <div className="pm-timeline">
                    <div className="pm-timeline-line" />

                    <div className="pm-timeline-item completed">
                      <span />
                      <div>
                        <small>COMPLETED</small>
                        <strong>Planning & Discovery</strong>
                      </div>
                    </div>

                    <div className="pm-timeline-item current">
                      <span />
                      <div>
                        <small>CURRENT MILESTONE</small>
                        <strong>
                          {selectedProject.milestone}
                        </strong>
                        <p>Due {selectedProject.dueDate}</p>
                      </div>
                    </div>

                    <div className="pm-timeline-item">
                      <span />
                      <div>
                        <small>UPCOMING</small>
                        <strong>Production Readiness</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pm-panel pm-activity-panel">
                <div className="pm-panel-header compact">
                  <div>
                    <span className="pm-panel-kicker">
                      PROJECT ACTIVITY
                    </span>
                    <h3>Recent Updates</h3>
                  </div>
                </div>

                <div className="pm-activity-list">
                  <div className="pm-activity-item">
                    <span className="activity-icon">✓</span>

                    <div>
                      <strong>Sprint review completed</strong>
                      <small>Today · Project workspace</small>
                    </div>
                  </div>

                  <div className="pm-activity-item">
                    <span className="activity-icon">↗</span>

                    <div>
                      <strong>
                        Progress updated to{" "}
                        {selectedProject?.progress}%
                      </strong>

                      <small>Yesterday · Delivery</small>
                    </div>
                  </div>

                  <div className="pm-activity-item">
                    <span className="activity-icon">◆</span>

                    <div>
                      <strong>Milestone target confirmed</strong>
                      <small>2 days ago · Roadmap</small>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </section>
      </main>

      {showView && selectedProject && (
        <div
          className="pm-modal-backdrop"
          onClick={() => setShowView(false)}
        >
          <div
            className="pm-view-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pm-view-header">
              <div>
                <span className="pm-panel-kicker">
                  PROJECT DETAILS
                </span>

                <h2>{selectedProject.name}</h2>

                <p>{selectedProject.code}</p>
              </div>

              <button
                className="pm-modal-close"
                onClick={() => setShowView(false)}
              >
                ×
              </button>
            </div>

            <div className="pm-view-body">
              <div className="pm-view-description">
                {selectedProject.description}
              </div>

              <div className="pm-view-grid">
                <div>
                  <span>PROJECT MANAGER</span>
                  <strong>{selectedProject.manager}</strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong>{selectedProject.status}</strong>
                </div>

                <div>
                  <span>PROJECT HEALTH</span>
                  <strong>{selectedProject.health}</strong>
                </div>

                <div>
                  <span>PROGRESS</span>
                  <strong>{selectedProject.progress}%</strong>
                </div>

                <div>
                  <span>CURRENT SPRINT</span>
                  <strong>{selectedProject.sprint}</strong>
                </div>

                <div>
                  <span>TEAM SIZE</span>
                  <strong>{selectedProject.teamSize} members</strong>
                </div>

                <div>
                  <span>TOTAL TASKS</span>
                  <strong>{selectedProject.tasks}</strong>
                </div>

                <div>
                  <span>COMPLETED TASKS</span>
                  <strong>{selectedProject.completedTasks}</strong>
                </div>

                <div>
                  <span>MILESTONE</span>
                  <strong>{selectedProject.milestone}</strong>
                </div>

                <div>
                  <span>MILESTONE DUE</span>
                  <strong>{selectedProject.dueDate}</strong>
                </div>

                <div>
                  <span>START DATE</span>
                  <strong>{selectedProject.startDate}</strong>
                </div>

                <div>
                  <span>END DATE</span>
                  <strong>{selectedProject.endDate}</strong>
                </div>
              </div>

              <div className="pm-view-progress">
                <div>
                  <span>PROJECT DELIVERY</span>
                  <strong>{selectedProject.progress}%</strong>
                </div>

                <div className="pm-progress-track">
                  <div
                    style={{
                      width: `${selectedProject.progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pm-view-footer">
              <button
                className="pm-cancel-button"
                onClick={() => setShowView(false)}
              >
                Close
              </button>

              <button
                className="pm-primary-button"
                onClick={() => {
                  setShowView(false);
                  openEditModal(selectedProject);
                }}
              >
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="pm-modal-backdrop"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="pm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pm-modal-header">
              <div>
                <span className="pm-panel-kicker">
                  {editingProject
                    ? "PROJECT SETTINGS"
                    : "NEW PROJECT"}
                </span>

                <h2>
                  {editingProject
                    ? "Edit project"
                    : "Create a new project"}
                </h2>
              </div>

              <button
                className="pm-modal-close"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProject}>
              <div className="pm-form-grid">
                <label>
                  Project name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. FinCore Nexus"
                    required
                  />
                </label>

                <label>
                  Project code
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    placeholder="e.g. FCN"
                  />
                </label>

                <label className="full">
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the project..."
                    rows="3"
                  />
                </label>

                <label>
                  Project manager
                  <input
                    name="manager"
                    value={form.manager}
                    onChange={handleFormChange}
                    placeholder="Manager name"
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                  >
                    <option>Active</option>
                    <option>At Risk</option>
                    <option>Completed</option>
                  </select>
                </label>

                <label>
                  Health
                  <select
                    name="health"
                    value={form.health}
                    onChange={handleFormChange}
                  >
                    <option>Healthy</option>
                    <option>Needs Attention</option>
                  </select>
                </label>

                <label>
                  Progress %
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="progress"
                    value={form.progress}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  Current sprint
                  <input
                    name="sprint"
                    value={form.sprint}
                    onChange={handleFormChange}
                    placeholder="Sprint 12"
                  />
                </label>

                <label>
                  Total tasks
                  <input
                    type="number"
                    min="0"
                    name="tasks"
                    value={form.tasks}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  Completed tasks
                  <input
                    type="number"
                    min="0"
                    name="completedTasks"
                    value={form.completedTasks}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  Team size
                  <input
                    type="number"
                    min="0"
                    name="teamSize"
                    value={form.teamSize}
                    onChange={handleFormChange}
                  />
                </label>

                <label>
                  Milestone
                  <input
                    name="milestone"
                    value={form.milestone}
                    onChange={handleFormChange}
                    placeholder="Release 2.3"
                  />
                </label>

                <label>
                  Milestone due date
                  <input
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    placeholder="20 Sep 2026"
                  />
                </label>

                <label>
                  Start date
                  <input
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    placeholder="10 Jun 2026"
                  />
                </label>

                <label>
                  End date
                  <input
                    name="endDate"
                    value={form.endDate}
                    onChange={handleFormChange}
                    placeholder="30 Sep 2026"
                  />
                </label>
              </div>

              <div className="pm-modal-footer">
                <button
                  type="button"
                  className="pm-cancel-button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pm-primary-button"
                >
                  {editingProject
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManagement;