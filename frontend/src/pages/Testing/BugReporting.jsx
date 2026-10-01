import { useContext, useEffect, useMemo, useState } from "react";
import {
  PiArrowRight,
  PiBug,
  PiCheckCircle,
  PiClock,
  PiMagnifyingGlass,
  PiPlus,
  PiTrash,
  PiWarning,
  PiX,
  PiXCircle,
} from "react-icons/pi";
import { AuthContext } from "../../context/AuthContext.jsx";
import axios from "../../services/api.js";

const API_BASE = "http://localhost:8080/api/bugs";
const PROJECTS_API = "http://localhost:8080/api/projects";

const workflow = [
  "New",
  "Triaged",
  "Assigned",
  "In Progress",
  "Fixed",
  "Retest",
  "Closed",
];

const statusConfig = {
  New: {
    icon: PiPlus,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  },
  Triaged: {
    icon: PiMagnifyingGlass,
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  },
  Assigned: {
    icon: PiBug,
    className:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  "In Progress": {
    icon: PiClock,
    className:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  },
  Fixed: {
    icon: PiCheckCircle,
    className:
      "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  },
  Retest: {
    icon: PiWarning,
    className:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  },
  Closed: {
    icon: PiCheckCircle,
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  Reopened: {
    icon: PiXCircle,
    className:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

const severityClass = {
  Critical: "text-red-600 dark:text-red-400",
  High: "text-orange-600 dark:text-orange-400",
  Medium: "text-yellow-600 dark:text-yellow-400",
  Low: "text-green-600 dark:text-green-400",
};

const initialForm = {
  title: "",
  description: "",
  projectId: "",
  module: "",
  environment: "Development",
  severity: "Medium",
  priority: "Medium",
  assignedToId: "",
  attachments: [],
};

const BugReporting = () => {
  const { currentUser } = useContext(AuthContext);

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [form, setForm] = useState(initialForm);

  const currentUserName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.email ||
    "Current User";

  const getProject = (projectId) =>
    projects.find(
      (project) => String(project.id) === String(projectId)
    );

  const getUserName = (userId) => {
    if (!userId) {
      return "Unassigned";
    }

    if (String(userId) === String(currentUser?.id)) {
      return currentUserName;
    }

    for (const project of projects) {
      const member = (project.members || []).find(
        (user) =>
          String(user.id) === String(userId) ||
          String(user.userId) === String(userId)
      );

      if (member) {
        return member.fullName;
      }
    }

    return `User #${userId}`;
  };

  const normalizeBug = (bug) => ({
    ...bug,

    project:
      getProject(bug.projectId)?.name ||
      `Project #${bug.projectId}`,

    reportedBy: getUserName(bug.reportedBy),

    assignedTo: getUserName(bug.assignedTo),

    createdDate: bug.createdAt
      ? new Date(bug.createdAt)
          .toISOString()
          .split("T")[0]
      : "",

    attachments: bug.attachments
      ? bug.attachments.split("|").filter(Boolean)
      : [],
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [bugResponse, projectResponse] =
        await Promise.all([
          axios.get(API_BASE),
          axios.get(PROJECTS_API),
        ]);

      setProjects(
        Array.isArray(projectResponse.data)
          ? projectResponse.data
          : []
      );

      setBugs(
        Array.isArray(bugResponse.data)
          ? bugResponse.data
          : []
      );
    } catch (requestError) {
      console.error(
        "Failed to load testing data:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Testing data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProject = getProject(form.projectId);

  const availableMembers =
    selectedProject?.members || [];

  const refreshBugs = async () => {
    const response = await axios.get(API_BASE);

    setBugs(
      Array.isArray(response.data)
        ? response.data
        : []
    );
  };

  const filteredBugs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bugs.filter((bug) => {
      const matchesSearch =
        String(bug.bugKey || bug.id)
          .toLowerCase()
          .includes(query) ||
        String(bug.title || "")
          .toLowerCase()
          .includes(query) ||
        String(bug.projectId || "")
          .toLowerCase()
          .includes(query) ||
        String(bug.module || "")
          .toLowerCase()
          .includes(query) ||
        String(bug.reportedBy || "")
          .toLowerCase()
          .includes(query) ||
        String(bug.assignedTo || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        bug.status === statusFilter;

      const matchesSeverity =
        severityFilter === "All" ||
        bug.severity === severityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSeverity
      );
    });
  }, [
    bugs,
    search,
    statusFilter,
    severityFilter,
  ]);

  const totalBugs = bugs.length;

  const openBugs = bugs.filter(
    (bug) =>
      !["Closed", "Fixed"].includes(bug.status)
  ).length;

  const criticalBugs = bugs.filter(
    (bug) => bug.severity === "Critical"
  ).length;

  const closedBugs = bugs.filter(
    (bug) => bug.status === "Closed"
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,

      ...(name === "projectId"
        ? { assignedToId: "" }
        : {}),
    }));
  };

  const handleAttachments = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    setForm((current) => ({
      ...current,

      attachments: [
        ...current.attachments,
        ...files.map((file) => file.name),
      ],
    }));

    event.target.value = "";
  };

  const removeAttachment = (index) => {
    setForm((current) => ({
      ...current,

      attachments:
        current.attachments.filter(
          (_, fileIndex) =>
            fileIndex !== index
        ),
    }));
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.projectId ||
      !form.module.trim()
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await axios.post(API_BASE, {
        title: form.title.trim(),

        description:
          form.description.trim(),

        projectId: Number(form.projectId),

        module: form.module.trim(),

        environment: form.environment,

        severity: form.severity,

        priority: form.priority,

        assignedTo: form.assignedToId
          ? Number(form.assignedToId)
          : null,

        attachments:
          form.attachments.join("|"),
      });

      await refreshBugs();

      closeReportModal();
    } catch (requestError) {
      console.error(
        "Failed to create bug:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Failed to create the bug."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateBugStatus = async (
    bugId,
    status
  ) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/${bugId}/status`,
        {
          status,

          retestResult:
            status === "Retest"
              ? null
              : selectedBug?.retestResult,
        }
      );

      setBugs((current) =>
        current.map((bug) =>
          bug.id === bugId
            ? response.data
            : bug
        )
      );

      setSelectedBug(
        normalizeBug(response.data)
      );
    } catch (requestError) {
      console.error(
        "Failed to update bug status:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Failed to update bug status."
      );
    }
  };

  const handleRetest = async (
    bugId,
    result
  ) => {
    const nextStatus =
      result === "Passed"
        ? "Closed"
        : "Reopened";

    try {
      const response = await axios.patch(
        `${API_BASE}/${bugId}/status`,
        {
          status: nextStatus,
          retestResult: result,
        }
      );

      setBugs((current) =>
        current.map((bug) =>
          bug.id === bugId
            ? response.data
            : bug
        )
      );

      setSelectedBug(
        normalizeBug(response.data)
      );
    } catch (requestError) {
      console.error(
        "Failed to save retest result:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Failed to save retest result."
      );
    }
  };

  const deleteBug = async (bugId) => {
    try {
      await axios.delete(
        `${API_BASE}/${bugId}`
      );

      setBugs((current) =>
        current.filter(
          (bug) => bug.id !== bugId
        )
      );

      setSelectedBug(null);
    } catch (requestError) {
      console.error(
        "Failed to delete bug:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Failed to delete bug."
      );
    }
  };

  const getNextWorkflowStatus = (status) => {
    const index =
      workflow.indexOf(status);

    if (
      index === -1 ||
      index >= workflow.length - 1
    ) {
      return null;
    }

    return workflow[index + 1];
  };

  const getStatusConfig = (status) => {
    return (
      statusConfig[status] ||
      statusConfig.New
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Loading testing data...
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <PiBug size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bug Reporting
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track, manage, and resolve software defects.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowReportModal(true)
          }
          disabled={
            loading ||
            projects.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <PiPlus size={18} />
          Report Bug
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Bugs
            </span>

            <PiBug
              size={21}
              className="text-gray-400"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {totalBugs}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Open Bugs
            </span>

            <PiClock
              size={21}
              className="text-orange-500"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {openBugs}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Critical
            </span>

            <PiWarning
              size={21}
              className="text-red-500"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {criticalBugs}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Closed
            </span>

            <PiCheckCircle
              size={21}
              className="text-green-500"
            />
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {closedBugs}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <PiMagnifyingGlass
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search bugs, projects, modules..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="All">
                All Statuses
              </option>
              <option value="New">New</option>
              <option value="Triaged">
                Triaged
              </option>
              <option value="Assigned">
                Assigned
              </option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Fixed">
                Fixed
              </option>
              <option value="Retest">
                Retest
              </option>
              <option value="Reopened">
                Reopened
              </option>
              <option value="Closed">
                Closed
              </option>
            </select>

            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="All">
                All Severities
              </option>
              <option value="Critical">
                Critical
              </option>
              <option value="High">
                High
              </option>
              <option value="Medium">
                Medium
              </option>
              <option value="Low">
                Low
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Bug
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Project
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Severity
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Priority
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Assigned
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBugs.map((bug) => {
                const config =
                  getStatusConfig(
                    bug.status
                  );

                const StatusIcon =
                  config.icon;

                const projectName =
                  getProject(
                    bug.projectId
                  )?.name ||
                  `Project #${bug.projectId}`;

                return (
                  <tr
                    key={bug.id}
                    onClick={() =>
                      setSelectedBug(
                        normalizeBug(bug)
                      )
                    }
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-700/70 dark:hover:bg-gray-700/40"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {bug.bugKey ||
                            bug.id}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                          {bug.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {projectName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {bug.module}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          severityClass[
                            bug.severity
                          ] ||
                          "text-gray-600"
                        }`}
                      >
                        {bug.severity}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {bug.priority}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
                      >
                        <StatusIcon
                          size={14}
                        />
                        {bug.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getUserName(
                          bug.assignedTo
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {bug.createdAt
                          ? new Date(
                              bug.createdAt
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading &&
            filteredBugs.length === 0 && (
              <div className="px-6 py-16 text-center">
                <PiBug
                  size={40}
                  className="mx-auto text-gray-300 dark:text-gray-600"
                />

                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  No bugs found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try changing your filters or report a new bug.
                </p>
              </div>
            )}
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Report New Bug
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Create a defect report for your project.
                </p>
              </div>

              <button
                type="button"
                onClick={closeReportModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <PiX size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Bug Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Enter a short description of the bug"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Describe the issue, steps to reproduce, expected result, and actual result"
                    required
                    rows={5}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Project / Product
                  </label>

                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">
                      Select project
                    </option>

                    {projects.map(
                      (project) => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Module / Feature
                  </label>

                  <input
                    type="text"
                    name="module"
                    value={form.module}
                    onChange={handleInputChange}
                    placeholder="Login, Dashboard, Payments..."
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Environment
                  </label>

                  <select
                    name="environment"
                    value={form.environment}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Development">
                      Development
                    </option>

                    <option value="Staging">
                      Staging
                    </option>

                    <option value="Production">
                      Production
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Severity
                  </label>

                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Critical">
                      Critical
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Urgent">
                      Urgent
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Assigned To
                  </label>

                  <select
                    name="assignedToId"
                    value={form.assignedToId}
                    onChange={handleInputChange}
                    disabled={!form.projectId}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {availableMembers.map(
                      (user) => (
                        <option
                          key={
                            user.userId ||
                            user.id
                          }
                          value={
                            user.userId ||
                            user.id
                          }
                        >
                          {user.fullName}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Reported By
                  </label>

                  <input
                    type="text"
                    value={currentUserName}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Attachments
                  </label>

                  <input
                    type="file"
                    multiple
                    onChange={handleAttachments}
                    className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  />

                  {form.attachments.length >
                    0 && (
                    <div className="mt-3 space-y-2">
                      {form.attachments.map(
                        (file, index) => (
                          <div
                            key={`${file}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"
                          >
                            <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                              {file}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeAttachment(
                                  index
                                )
                              }
                              className="ml-3 rounded p-1 text-gray-400 hover:text-red-500"
                            >
                              <PiX size={17} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900"
                >
                  {saving
                    ? "Saving..."
                    : "Report Bug"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {selectedBug.bugKey ||
                      selectedBug.id}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      getStatusConfig(
                        selectedBug.status
                      ).className
                    }`}
                  >
                    {(() => {
                      const Icon =
                        getStatusConfig(
                          selectedBug.status
                        ).icon;

                      return (
                        <Icon size={14} />
                      );
                    })()}

                    {selectedBug.status}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                  {selectedBug.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBug(null)
                }
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <PiX size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Severity
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      severityClass[
                        selectedBug.severity
                      ] ||
                      "text-gray-700"
                    }`}
                  >
                    {selectedBug.severity}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Priority
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.priority}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Environment
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.environment}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.createdDate}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {selectedBug.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Project
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.project}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Module
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.module}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assigned To
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {selectedBug.assignedTo}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Bug Workflow
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {workflow.map(
                    (stage, index) => {
                      const active =
                        selectedBug.status ===
                          stage ||
                        (selectedBug.status ===
                          "Reopened" &&
                          stage ===
                            "In Progress");

                      return (
                        <div
                          key={stage}
                          className="flex items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateBugStatus(
                                selectedBug.id,
                                stage
                              )
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              active
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            {stage}
                          </button>

                          {index <
                            workflow.length -
                              1 && (
                            <PiArrowRight
                              size={14}
                              className="text-gray-400"
                            />
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {selectedBug.status ===
                "Reopened" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Bug Reopened
                  </p>

                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                    The retest failed. Move the bug back to In Progress for another fix.
                  </p>
                </div>
              )}

              {selectedBug.status ===
                "Retest" && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-500/20 dark:bg-yellow-500/10">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    Retest Required
                  </p>

                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                    Select the result after testing the developer's fix.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleRetest(
                          selectedBug.id,
                          "Passed"
                        )
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Passed
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRetest(
                          selectedBug.id,
                          "Failed"
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Failed
                    </button>
                  </div>
                </div>
              )}

              {selectedBug.retestResult && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last Retest Result
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      selectedBug.retestResult ===
                      "Passed"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {selectedBug.retestResult}
                  </p>
                </div>
              )}

              {selectedBug.attachments
                ?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Attachments
                  </p>

                  <div className="mt-3 space-y-2">
                    {selectedBug.attachments.map(
                      (file, index) => (
                        <div
                          key={`${file}-${index}`}
                          className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {file}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() =>
                    deleteBug(
                      selectedBug.id
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                >
                  <PiTrash size={17} />
                  Delete Bug
                </button>

                {getNextWorkflowStatus(
                  selectedBug.status
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      updateBugStatus(
                        selectedBug.id,
                        getNextWorkflowStatus(
                          selectedBug.status
                        )
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                  >
                    Move to{" "}
                    {getNextWorkflowStatus(
                      selectedBug.status
                    )}

                    <PiArrowRight
                      size={17}
                    />
                  </button>
                )}

                {selectedBug.status ===
                  "Reopened" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateBugStatus(
                        selectedBug.id,
                        "In Progress"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900"
                  >
                    Move to In Progress
                    <PiArrowRight
                      size={17}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugReporting;