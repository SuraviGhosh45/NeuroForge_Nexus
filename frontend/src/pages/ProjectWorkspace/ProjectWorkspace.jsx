import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiCheck,
  PiListChecks,
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiUserCircle,
  PiUsersThree,
  PiX,
} from "react-icons/pi";

import { useProjects } from "../../context/ProjectContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, normalizeRole } from "../../constants/roles.js";

const PROJECT_ROLES = ["Team Lead", "Developer", "Tester", "QA"];

const TASK_STATUSES = ["To Do", "In Progress", "In Review", "Done"];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const MEMBER_STATUSES = ["Active", "Inactive", "In Meeting"];

const EMPTY_TASK_FORM = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "Medium",
  status: "To Do",
  dueDate: "",
};

const ProjectWorkspace = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { currentUser } = useAuth();

  /* ================= PROJECT CONTEXT ================= */

  const {
    getProjectById,
    selectedProject,
    selectProject,
    updateProject,
  } = useProjects();

  /* ================= PROJECT TEAM ================= */

  const {
    getProjectMembers,
    isUserAssignedToProject,
    addProjectMember,
    updateProjectMember,
    removeProjectMember,
    updateProjectMemberStatus,
  } = useProjectTeam();

  const { users } = useUsers();

  /* ================= TASKS ================= */

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    getSubtasksByTaskId,
  } = useTasks();

  /* ================= PROJECT ================= */

  const project = getProjectById(projectId) || selectedProject;

  /* ================= STATE ================= */

  const [activeSection, setActiveSection] = useState("overview");

  const [showEditProject, setShowEditProject] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    code: "",
    repository: "",
    status: "Planning",
    startDate: "",
    endDate: "",
  });

  const [showAddMember, setShowAddMember] = useState(false);

  const [memberForm, setMemberForm] = useState({
    userId: "",
    projectRole: "Developer",
  });

  const [editingMember, setEditingMember] = useState(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);

  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);

  const [confirmDeleteMember, setConfirmDeleteMember] = useState(null);

  /* ================= SELECT PROJECT ================= */

  useEffect(() => {
    if (project?.id) {
      selectProject(project.id);
    }
  }, [project?.id, selectProject]);

  /* ================= LOAD PROJECT FORM ================= */

  useEffect(() => {
    if (project) {
      setProjectForm({
        name: project.name || "",
        description: project.description || "",
        code: project.code || "",
        repository: project.repository || "",
        status: project.status || "Planning",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
      });
    }
  }, [project]);

  /* ================= PROJECT MEMBERS ================= */

  const projectMembers = useMemo(() => {
    if (!project?.id) return [];

    const members = getProjectMembers(project.id);

    return members.map((member) => {
      const user = users.find(
        (item) => String(item.id) === String(member.userId)
      );

      return {
        ...member,
        user,
        status: member.status || "Active",
      };
    });
  }, [project?.id, getProjectMembers, users]);

  /* ================= TEAM LEAD ================= */

  const teamLeadMember = useMemo(() => {
    return projectMembers.find(
      (member) => member.projectRole === "Team Lead"
    );
  }, [projectMembers]);

  const teamLeadId = teamLeadMember?.userId || null;

  const teamLeadName =
    teamLeadMember?.user?.fullName ||
    teamLeadMember?.user?.name ||
    "No Team Lead assigned";

  /* ================= AVAILABLE USERS ================= */

  const availableUsers = useMemo(() => {
    if (!project?.id) return [];

    return users.filter((user) => {
      const alreadyInProject = projectMembers.some(
        (member) => String(member.userId) === String(user.id)
      );

      return !alreadyInProject;
    });
  }, [users, project?.id, projectMembers]);

  /* ================= PROJECT TASKS ================= */

  const projectTasks = useMemo(() => {
    if (!project?.id) return [];

    return tasks.filter((task) => {
      const taskProjId = task.projectId ?? task.project?.id ?? task.project_id;
      return String(taskProjId) === String(project.id);
    });
  }, [tasks, project?.id]);

  /* ================= USER HELPERS ================= */

  const getUserName = (userId) => {
    const user = users.find(
      (item) => String(item.id) === String(userId)
    );

    return user?.fullName || user?.name || "Unassigned";
  };

  const getTaskAssigneeName = (task) => {
    if (task.assignee?.fullName) {
      return task.assignee.fullName;
    }

    if (task.assignee?.name) {
      return task.assignee.name;
    }

    if (task.assigneeId) {
      return getUserName(task.assigneeId);
    }

    return "Unassigned";
  };

  /* ================= PRIORITY STYLE ================= */

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "border-[#f0a0a0]/30 bg-[#f0a0a0]/5 text-[#f0a0a0]";

      case "High":
        return "border-[#f0a0a0]/30 bg-[#f0a0a0]/5 text-[#f0a0a0]";

      case "Medium":
        return "border-[#f0d090]/30 bg-[#f0d090]/5 text-[#f0d090]";

      case "Low":
        return "border-[#a0d0a0]/30 bg-[#a0d0a0]/5 text-[#a0d0a0]";

      default:
        return "border-slate-400/20 bg-slate-400/5 text-slate-300";
    }
  };

  /* ================= TASK STATUS STYLE ================= */

  const getStatusClass = (status) => {
    switch (status) {
      case "Done":
        return "border-emerald-400/20 bg-emerald-400/5 text-emerald-400";

      case "In Progress":
        return "border-blue-400/20 bg-blue-400/5 text-blue-400";

      case "To Do":
      default:
        return "border-slate-400/20 bg-slate-400/5 text-slate-300";
    }
  };

  /* ================= MEMBER STATUS STYLE ================= */

  const getMemberStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "border-emerald-400/20 bg-emerald-400/5 text-emerald-400";

      case "In Meeting":
        return "border-[#f0d090]/30 bg-[#f0d090]/5 text-[#f0d090]";

      case "Inactive":
      default:
        return "border-slate-400/20 bg-slate-400/5 text-slate-300";
    }
  };

  /* ================= CURRENT USER CHECK ================= */

  const isCurrentUser = (member) => {
    const currentUserId = currentUser?.id ?? currentUser?._id;

    return (
      currentUserId != null &&
      String(member.userId) === String(currentUserId)
    );
  };

  /* ================= PERMISSIONS ================= */

  const currentRole = normalizeRole(currentUser?.role);

  const canManageProjects = [
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.PROJECT_LEAD,
  ].includes(currentRole);

  const canManageTeam = [
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.PROJECT_LEAD,
    ROLES.TEAM_LEAD,
  ].includes(currentRole);

  const canManageTasks = [
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.PROJECT_LEAD,
  ].includes(currentRole);

  /* ================= PROJECT FORM ================= */

  const handleProjectFormChange = (event) => {
    const { name, value } = event.target;

    setProjectForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    if (!project?.id) return;

    const result = await updateProject(
      project.id,
      projectForm
    );

    if (result?.success) {
      setShowEditProject(false);
    } else {
      alert(
        result?.message || "Failed to update project."
      );
    }
  };

  /* ================= ADD MEMBER ================= */

  const openAddMember = () => {
    setEditingMember(null);

    setMemberForm({
      userId: "",
      projectRole: "Developer",
    });

    setShowAddMember(true);
  };

  /* ================= EDIT MEMBER ================= */

  const openEditMember = (member) => {
    setEditingMember(member);

    setMemberForm({
      userId: member.userId,
      projectRole: member.projectRole,
    });

    setShowAddMember(true);
  };

  /* ================= MEMBER SUBMIT ================= */

  const handleMemberSubmit = async (event) => {
    event.preventDefault();

    if (!project?.id) return;

    if (!memberForm.userId) {
      alert("Please select a user.");
      return;
    }

    if (
      memberForm.projectRole === "Team Lead" &&
      !editingMember
    ) {
      const existingTeamLead = projectMembers.find(
        (member) => member.projectRole === "Team Lead"
      );

      if (existingTeamLead) {
        alert("This project already has a Team Lead.");
        return;
      }
    }

    if (
      memberForm.projectRole === "Team Lead" &&
      editingMember &&
      editingMember.projectRole !== "Team Lead"
    ) {
      const existingTeamLead = projectMembers.find(
        (member) =>
          member.projectRole === "Team Lead" &&
          String(member.userId) !==
            String(editingMember.userId)
      );

      if (existingTeamLead) {
        alert("This project already has a Team Lead.");
        return;
      }
    }

    let result;

    if (editingMember) {
      result = await updateProjectMember(
        project.id,
        editingMember.userId,
        memberForm.projectRole
      );
    } else {
      result = await addProjectMember(
        project.id,
        Number(memberForm.userId),
        memberForm.projectRole
      );
    }

    if (result?.success) {
      setShowAddMember(false);
      setEditingMember(null);

      setMemberForm({
        userId: "",
        projectRole: "Developer",
      });
    } else {
      alert(
        result?.message ||
          "Failed to update project team."
      );
    }
  };

  /* ================= MEMBER STATUS ================= */

  const handleMemberStatusChange = async (
    member,
    status
  ) => {
    if (!project?.id || !member?.userId) return;

    if (!isCurrentUser(member)) {
      return;
    }

    const result = await updateProjectMemberStatus(
      project.id,
      member.userId,
      status
    );

    if (!result?.success) {
      alert(
        result?.message ||
          "Failed to update your status."
      );
    }
  };

  /* ================= DELETE MEMBER ================= */

  const handleDeleteMember = async () => {
    if (!project?.id || !confirmDeleteMember) return;

    const result = await removeProjectMember(
      project.id,
      confirmDeleteMember.userId
    );

    if (!result?.success) {
      alert(
        result?.message ||
          "Failed to remove team member."
      );
    }

    setConfirmDeleteMember(null);
  };

  /* ================= CREATE TASK ================= */

  const openCreateTask = () => {
    setEditingTask(null);

    const defaultAssignee = teamLeadId
      ? String(teamLeadId)
      : (projectMembers[0]?.userId ? String(projectMembers[0].userId) : "");

    setTaskForm({
      ...EMPTY_TASK_FORM,
      assigneeId: defaultAssignee,
    });

    setShowTaskModal(true);
  };

  /* ================= EDIT TASK ================= */

  const openEditTask = (task) => {
    setEditingTask(task);

    const existingAssignee = task.assigneeId ?? task.assignee?.id ?? "";

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assigneeId: existingAssignee ? String(existingAssignee) : "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      dueDate: task.dueDate || "",
    });

    setShowTaskModal(true);
  };

  /* ================= TASK FORM ================= */

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;

    setTaskForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ================= TASK SUBMIT ================= */

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    if (!project?.id) return;

    if (!taskForm.title.trim()) {
      alert("Please enter a parent task title.");
      return;
    }

    const existingAssigneeId =
      editingTask?.assigneeId ??
      editingTask?.assignee?.id ??
      null;

    const chosenAssigneeId = taskForm.assigneeId
      ? Number(taskForm.assigneeId)
      : (existingAssigneeId ?? (teamLeadId ? Number(teamLeadId) : null));

    const payload = {
      ...(editingTask || {}),
      title: taskForm.title.trim(),
      description: taskForm.description.trim(),
      projectId: Number(project.id),
      assigneeId: chosenAssigneeId,
      priority: taskForm.priority,
      status: taskForm.status,
      dueDate: taskForm.dueDate || null,
    };

    let result;

    if (editingTask) {
      result = await updateTask(payload);
    } else {
      result = await createTask(payload);
    }

    if (result?.success) {
      setShowTaskModal(false);
      setEditingTask(null);

      setTaskForm({
        ...EMPTY_TASK_FORM,
      });
    } else {
      alert(
        result?.message ||
          "Failed to save parent task."
      );
    }
  };

  /* ================= DELETE TASK ================= */

  const handleDeleteTask = async () => {
    if (!confirmDeleteTask) return;

    const result = await deleteTask(
      confirmDeleteTask.id
    );

    if (!result?.success) {
      alert(
        result?.message ||
          "Failed to delete task."
      );
    }

    setConfirmDeleteTask(null);
  };

  /* ================= TASK STATS ================= */

  const taskStats = useMemo(() => {
    const total = projectTasks.length;

    const toDo = projectTasks.filter(
      (task) => task.status === "To Do"
    ).length;

    const inProgress = projectTasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const completed = projectTasks.filter(
      (task) => task.status === "Done"
    ).length;

    return {
      total,
      toDo,
      inProgress,
      completed,
    };
  }, [projectTasks]);

  /* ================= PROJECT NOT FOUND ================= */

  if (!project) {
    return (
      <div className="min-h-screen bg-[#07111f] p-6 text-[#e8eef8]">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate("/projects")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
          >
            <PiArrowLeft size={20} />
            Back to Projects
          </button>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">
            <h2 className="text-xl font-semibold text-[#e8eef8]">
              Project not found
            </h2>

            <p className="mt-2 text-[#e8eef8]/50">
              The project you are looking for does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] p-4 text-[#e8eef8] md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* ================= PROJECT HEADER ================= */}

        <div className="mb-6">
          <button
            onClick={() => navigate("/projects")}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
          >
            <PiArrowLeft size={20} />
            Back to Projects
          </button>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#e8eef8]">
                    {project.name}
                  </h1>

                  {project.code && (
                    <span className="rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-3 py-1 text-xs font-semibold text-[#e8eef8]/50">
                      {project.code}
                    </span>
                  )}

                  {project.status && (
                    <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-xs font-semibold text-blue-400">
                      {project.status}
                    </span>
                  )}
                </div>

                <p className="mt-2 max-w-3xl text-sm text-[#e8eef8]/50">
                  {project.description ||
                    "Manage project details, team members and tasks."}
                </p>
              </div>

              {canManageProjects && (
                <button
                  onClick={() =>
                    setShowEditProject(true)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  <PiPencilSimple size={18} />
                  Edit Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= TABS ================= */}

        <div className="mb-6 overflow-x-auto rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">
          <div className="flex min-w-max">
            <button
              onClick={() =>
                setActiveSection("overview")
              }
              className={`border-b-2 px-5 py-4 text-sm font-semibold transition ${
                activeSection === "overview"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-[#e8eef8]/50 hover:text-[#e8eef8]"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveSection("team")}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                activeSection === "team"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-[#e8eef8]/50 hover:text-[#e8eef8]"
              }`}
            >
              Team
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeSection === "team"
                    ? "bg-blue-400/20 text-blue-400"
                    : "bg-[#e8eef8]/10 text-[#e8eef8]/50"
                }`}
              >
                {projectMembers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSection("tasks")}
              className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                activeSection === "tasks"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-[#e8eef8]/50 hover:text-[#e8eef8]"
              }`}
            >
              Parent Tasks
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeSection === "tasks"
                    ? "bg-blue-400/20 text-blue-400"
                    : "bg-[#e8eef8]/10 text-[#e8eef8]/50"
                }`}
              >
                {projectTasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* ================= OVERVIEW ================= */}

        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Project Status
                </p>

                <p className="mt-2 text-xl font-bold text-[#e8eef8]">
                  {project.status || "Planning"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Project Lead
                </p>

                <p className="mt-2 text-xl font-bold text-[#e8eef8]">
                  {project.projectLead?.fullName ||
                    project.projectLead?.name ||
                    project.projectLeadName ||
                    "Not assigned"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Project Manager
                </p>

                <p className="mt-2 text-xl font-bold text-[#e8eef8]">
                  {project.projectManager?.fullName ||
                    project.projectManager?.name ||
                    project.projectManagerName ||
                    "Not assigned"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Team Members
                </p>

                <p className="mt-2 text-xl font-bold text-[#e8eef8]">
                  {projectMembers.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Repositary
                </p>

                <div className="mt-2">
                  {project.repository ? (
                    <a
                      href={project.repository.startsWith("http") ? project.repository : `https://${project.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xl font-bold text-blue-400 hover:text-blue-300 underline transition"
                    >
                      Link
                    </a>
                  ) : (
                    <p className="text-xl font-bold text-[#e8eef8]/40">__</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-6">
              <div className="mb-5 flex items-center gap-3">
                <PiCalendarBlank
                  size={22}
                  className="text-blue-400"
                />

                <h2 className="text-lg font-bold text-[#e8eef8]">
                  Project Timeline
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-[#e8eef8]/50">
                    Start Date
                  </p>

                  <p className="mt-1 font-semibold text-[#e8eef8]/80">
                    {project.startDate || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#e8eef8]/50">
                    End Date
                  </p>

                  <p className="mt-1 font-semibold text-[#e8eef8]/80">
                    {project.endDate || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TEAM ================= */}

        {activeSection === "team" && (
          <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e8eef8]/10 p-5 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <PiUsersThree
                    size={24}
                    className="text-blue-400"
                  />

                  <h2 className="text-xl font-bold text-[#e8eef8]">
                    Project Team
                  </h2>
                </div>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  Manage members assigned to this project.
                </p>
              </div>

              {canManageTeam && (
                <button
                  onClick={openAddMember}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  <PiPlus size={18} />
                  Add Member
                </button>
              )}
            </div>

            <div className="border-b border-[#e8eef8]/10 bg-[#07111f]/50 p-5">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#e8eef8]/30">
                  Project Team Lead
                </p>

                <p className="font-semibold text-[#e8eef8]/80">
                  {teamLeadName}
                </p>

                {!teamLeadMember && (
                  <p className="text-xs text-[#f0a060]">
                    A Team Lead is required before creating tasks.
                  </p>
                )}
              </div>
            </div>

            {projectMembers.length === 0 ? (
              <div className="p-10 text-center">
                <PiUsersThree
                  size={42}
                  className="mx-auto text-[#e8eef8]/20"
                />

                <h3 className="mt-4 font-semibold text-[#e8eef8]">
                  No team members
                </h3>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  Add members to start building the project team.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#e8eef8]/10 bg-[#07111f]/50 text-left text-xs uppercase tracking-wide text-[#e8eef8]/30">
                      <th className="px-5 py-4">
                        Member
                      </th>

                      <th className="px-5 py-4">
                        Email
                      </th>

                      <th className="px-5 py-4">
                        Project Role
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      {canManageTeam && (
                        <th className="px-5 py-4 text-right">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {projectMembers.map((member) => (
                      <tr
                        key={`${member.userId}-${member.projectRole}`}
                        className="border-b border-[#e8eef8]/10 last:border-0 hover:bg-[#e8eef8]/5"
                      >
                        {/* MEMBER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8eef8]/10 bg-[#07111f]">
                              <PiUserCircle
                                size={25}
                                className="text-[#e8eef8]/40"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-[#e8eef8]/80">
                                {member.user?.fullName ||
                                  member.user?.name ||
                                  "Unknown User"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4 text-sm text-[#e8eef8]/50">
                          {member.user?.email || "-"}
                        </td>

                        {/* PROJECT ROLE */}

                        <td className="px-5 py-4">
                          <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-3 py-1 text-xs font-semibold text-blue-400">
                            {member.projectRole}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {isCurrentUser(member) ? (
                            <select
                              value={
                                member.status || "Active"
                              }
                              onChange={(event) =>
                                handleMemberStatusChange(
                                  member,
                                  event.target.value
                                )
                              }
                              className={`rounded-full border bg-[#07111f] px-3 py-1.5 text-xs font-semibold outline-none transition focus:border-blue-400 ${getMemberStatusClass(
                                member.status || "Active"
                              )}`}
                              title="Update your status"
                            >
                              {MEMBER_STATUSES.map(
                                (status) => (
                                  <option
                                    key={status}
                                    value={status}
                                  >
                                    {status}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            <span
                              className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getMemberStatusClass(
                                member.status || "Active"
                              )}`}
                            >
                              {member.status || "Active"}
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        {canManageTeam && (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openEditMember(member)
                                }
                                className="rounded-lg p-2 text-[#e8eef8]/40 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                                title="Edit"
                              >
                                <PiPencilSimple
                                  size={18}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  setConfirmDeleteMember(
                                    member
                                  )
                                }
                                className="rounded-lg p-2 text-red-400 transition hover:bg-red-400/10"
                                title="Delete"
                              >
                                <PiTrash size={18} />
                              </button>
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
        )}

        {/* ================= TASKS ================= */}

        {activeSection === "tasks" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <PiListChecks size={26} className="text-cyan-400" />
                  <h2 className="text-2xl font-bold text-[#e8eef8]">
                    Task Management
                  </h2>
                  <span className="ml-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                    {projectTasks.length} {projectTasks.length === 1 ? "parent task" : "parent tasks"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  Decompose {project.name} into major deliverable parent work items. Click any task to enter its workspace and manage subtasks.
                </p>
              </div>

              {canManageTasks && (
                <button
                  onClick={openCreateTask}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-95"
                >
                  <PiPlus size={18} />
                  Add Task
                </button>
              )}
            </div>

            {/* TASK STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Total Parent Tasks
                </p>

                <p className="mt-2 text-2xl font-bold text-[#e8eef8]">
                  {taskStats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  To Do
                </p>

                <p className="mt-2 text-2xl font-bold text-[#e8eef8]">
                  {taskStats.toDo}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  In Progress
                </p>

                <p className="mt-2 text-2xl font-bold text-[#e8eef8]">
                  {taskStats.inProgress}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
                <p className="text-sm text-[#e8eef8]/50">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-[#e8eef8]">
                  {taskStats.completed}
                </p>
              </div>
            </div>

            {/* TASK TABLE */}

            <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">
              <div className="border-b border-[#e8eef8]/10 p-5">
                <h3 className="text-lg font-bold text-[#e8eef8]">
                  All Parent Tasks
                </h3>
              </div>

              {tasksLoading ? (
                <div className="p-10 text-center text-sm text-[#e8eef8]/50">
                  Loading tasks...
                </div>
              ) : tasksError ? (
                <div className="p-10 text-center text-sm text-red-400">
                  {tasksError}
                </div>
              ) : projectTasks.length === 0 ? (
                <div className="p-10 text-center">
                  <PiCheck
                    size={40}
                    className="mx-auto text-[#e8eef8]/20"
                  />

                  <h3 className="mt-4 font-semibold text-[#e8eef8]">
                    No parent tasks yet
                  </h3>

                  <p className="mt-1 text-sm text-[#e8eef8]/50">
                    Create a parent task to decompose project deliverables into subtasks.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-[#e8eef8]/10 bg-[#07111f]/50 text-left text-xs uppercase tracking-wide text-[#e8eef8]/30">
                        <th className="px-5 py-4">
                          #
                        </th>

                        <th className="px-5 py-4">
                          Parent Task
                        </th>

                        <th className="px-5 py-4">
                          Assignee
                        </th>

                        <th className="px-5 py-4">
                          Subtasks
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4">
                          Priority
                        </th>

                        <th className="px-5 py-4">
                          Deadline
                        </th>

                        {canManageTasks && (
                          <th className="px-5 py-4 text-right">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {projectTasks.map(
                        (task, index) => (
                          <tr
                            key={task.id}
                            onClick={() =>
                              navigate(
                                `/projects/${project.id}/tasks/${task.id}`
                              )
                            }
                            className="group cursor-pointer border-b border-[#e8eef8]/10 transition hover:bg-[#e8eef8]/5 last:border-0"
                          >
                            <td className="px-5 py-4 text-sm font-medium text-[#e8eef8]/40">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <div>
                                <p className="font-semibold text-[#e8eef8] transition group-hover:text-blue-400">
                                  {task.title}
                                </p>

                                {task.description && (
                                  <p className="mt-1 max-w-md truncate text-xs text-[#e8eef8]/40">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <PiUserCircle
                                  size={22}
                                  className="text-[#e8eef8]/30"
                                />

                                <span className="text-sm text-[#e8eef8]/80">
                                  {getTaskAssigneeName(
                                    task
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* SUBTASKS */}
                            <td className="px-5 py-4">
                              {(() => {
                                const subCount = getSubtasksByTaskId ? getSubtasksByTaskId(task.id).length : 0;
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                                      subCount > 0
                                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-500/50"
                                        : "border-[#e8eef8]/10 bg-[#07111f] text-[#e8eef8]/40"
                                    }`}
                                  >
                                    <PiListChecks size={14} />
                                    {subCount} {subCount === 1 ? "subtask" : "subtasks"}
                                  </span>
                                );
                              })()}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-sm text-[#e8eef8]/50">
                                <PiCalendarBlank
                                  size={18}
                                />

                                {task.dueDate ||
                                  "No deadline"}
                              </div>
                            </td>

                            {canManageTasks && (
                              <td
                                className="px-5 py-4"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                              >
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      openEditTask(task)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-3 py-1.5 text-xs font-medium text-[#e8eef8]/75 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300"
                                    title="Edit Parent Task"
                                  >
                                    <PiPencilSimple
                                      size={14}
                                    />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setConfirmDeleteTask(
                                        task
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
                                    title="Delete Parent Task"
                                  >
                                    <PiTrash
                                      size={14}
                                    />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= EDIT PROJECT MODAL ================= */}

      {showEditProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#e8eef8]/10 p-5">
              <div>
                <h2 className="text-xl font-bold text-[#e8eef8]">
                  Edit Project
                </h2>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  Update project information.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowEditProject(false)
                }
                className="rounded-lg p-2 text-[#e8eef8]/40 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                <PiX size={22} />
              </button>
            </div>

            <form
              onSubmit={handleProjectSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={projectForm.name}
                  onChange={handleProjectFormChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Project Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={projectForm.code}
                  onChange={handleProjectFormChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Description
                </label>

                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectFormChange}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Repository Link
                </label>

                <input
                  type="url"
                  name="repository"
                  value={projectForm.repository}
                  onChange={handleProjectFormChange}
                  placeholder="e.g. https://github.com/organization/repository"
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    Status
                  </label>

                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleProjectFormChange}
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  >
                    <option value="Planning">
                      Planning
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="On Hold">
                      On Hold
                    </option>

                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={projectForm.startDate}
                    onChange={handleProjectFormChange}
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={projectForm.endDate}
                    onChange={handleProjectFormChange}
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e8eef8]/10 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setShowEditProject(false)
                  }
                  className="rounded-xl border border-[#e8eef8]/10 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT MEMBER MODAL ================= */}

      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#e8eef8]/10 p-5">
              <div>
                <h2 className="text-xl font-bold text-[#e8eef8]">
                  {editingMember
                    ? "Edit Team Member"
                    : "Add Team Member"}
                </h2>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  Assign a project role to the member.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddMember(false);
                  setEditingMember(null);
                }}
                className="rounded-lg p-2 text-[#e8eef8]/40 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                <PiX size={22} />
              </button>
            </div>

            <form
              onSubmit={handleMemberSubmit}
              className="space-y-5 p-5"
            >
              {!editingMember ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    User
                  </label>

                  <select
                    value={memberForm.userId}
                    onChange={(event) =>
                      setMemberForm((previous) => ({
                        ...previous,
                        userId:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                    required
                  >
                    <option value="">
                      Select a user
                    </option>

                    {availableUsers.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.fullName ||
                          user.name}{" "}
                        — {user.email}
                      </option>
                    ))}
                  </select>

                  {availableUsers.length === 0 && (
                    <p className="mt-2 text-xs text-[#e8eef8]/40">
                      No available users to add.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    User
                  </label>

                  <div className="rounded-xl border border-[#e8eef8]/10 bg-[#07111f] px-4 py-3">
                    <p className="font-semibold text-[#e8eef8]/80">
                      {editingMember.user
                        ?.fullName ||
                        editingMember.user?.name ||
                        "Unknown User"}
                    </p>

                    <p className="text-sm text-[#e8eef8]/40">
                      {editingMember.user
                        ?.email || ""}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Project Role
                </label>

                <select
                  value={memberForm.projectRole}
                  onChange={(event) =>
                    setMemberForm((previous) => ({
                      ...previous,
                      projectRole:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  required
                >
                  {PROJECT_ROLES.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e8eef8]/10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setEditingMember(null);
                  }}
                  className="rounded-xl border border-[#e8eef8]/10 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  {editingMember
                    ? "Save Changes"
                    : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TASK MODAL ================= */}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-[#e8eef8]/10 p-5">
              <div>
                <h2 className="text-xl font-bold text-[#e8eef8]">
                  {editingTask
                    ? "Edit Parent Task"
                    : "Create Parent Task"}
                </h2>

                <p className="mt-1 text-sm text-[#e8eef8]/50">
                  {editingTask
                    ? "Update parent task information."
                    : "Define a deliverable parent work item decomposed into subtasks."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                }}
                className="rounded-lg p-2 text-[#e8eef8]/40 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                <PiX size={22} />
              </button>
            </div>

            <form
              onSubmit={handleTaskSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Parent Task Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskFormChange}
                  placeholder="e.g. Implement Core Authentication Service"
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Description
                </label>

                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskFormChange}
                  rows={4}
                  placeholder="Describe the high-level work item and deliverables..."
                  className="w-full resize-none rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition placeholder:text-[#e8eef8]/30 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Assignee
                </label>

                <select
                  name="assigneeId"
                  value={taskForm.assigneeId}
                  onChange={handleTaskFormChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none transition focus:border-blue-400"
                >
                  <option value="">Select Assignee</option>
                  {projectMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.fullName || m.user?.name || `User #${m.userId}`} — {m.projectRole}
                    </option>
                  ))}
                  {projectMembers.length === 0 &&
                    users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.name} ({u.email})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-[#e8eef8]/40">
                  Assign to any team member or lead on this project.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleTaskFormChange}
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  >
                    {PRIORITIES.map(
                      (priority) => (
                        <option
                          key={priority}
                          value={priority}
                        >
                          {priority}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                    Status
                  </label>

                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleTaskFormChange}
                    className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                  >
                    {TASK_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#e8eef8]/70">
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskFormChange}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-[#e8eef8] outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e8eef8]/10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="rounded-xl border border-[#e8eef8]/10 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  {editingTask
                    ? "Save Changes"
                    : "Create Parent Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE MEMBER MODAL ================= */}

      {confirmDeleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-6 shadow-2xl shadow-black/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10">
              <PiTrash
                size={24}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#e8eef8]">
              Remove Team Member?
            </h2>

            <p className="mt-2 text-sm text-[#e8eef8]/50">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-[#e8eef8]/80">
                {confirmDeleteMember.user
                  ?.fullName ||
                  confirmDeleteMember.user?.name}
              </span>{" "}
              from this project?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDeleteMember(null)
                }
                className="rounded-xl border border-[#e8eef8]/10 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteMember}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE TASK MODAL ================= */}

      {confirmDeleteTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-6 shadow-2xl shadow-black/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/10">
              <PiTrash
                size={24}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#e8eef8]">
              Delete Parent Task?
            </h2>

            <p className="mt-2 text-sm text-[#e8eef8]/50">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#e8eef8]/80">
                {confirmDeleteTask.title}
              </span>
              ? This will also remove any decomposed subtasks under this parent task.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmDeleteTask(null)
                }
                className="rounded-xl border border-[#e8eef8]/10 px-5 py-2.5 text-sm font-semibold text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteTask}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400"
              >
                Delete Parent Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;