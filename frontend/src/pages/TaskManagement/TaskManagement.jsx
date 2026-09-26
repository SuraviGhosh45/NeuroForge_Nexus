import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Can from "../../components/common/Can.jsx";
import TaskDetails from "../../components/task/TaskDetails.jsx";
import {
  PiPlus,
  PiPencilSimple,
  PiTrash,
} from "react-icons/pi";

const priorityColor = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  High: "border-amber-200 bg-amber-50 text-amber-700",
  Medium: "border-blue-200 bg-blue-50 text-blue-700",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const TaskManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const {
    tasks,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    getVisibleTasks,
  } = useTasks();

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const { projectTeams } = useProjectTeam();
  const { teams } = useTeams();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("To Do");

  const visibleTasks = getVisibleTasks(
    currentUser,
    projectTeams,
    teams,
    projects
  );

  const selectedTask = tasks.find(
    (task) => String(task.id) === String(selectedTaskId)
  );

  const resetForm = () => {
    setTitle("");
    setProjectId("");
    setAssigneeId("");
    setPriority("");
    setDueDate("");
    setStatus("To Do");
    setEditingTaskId(null);
    setShowAddForm(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !projectId ||
      !assigneeId ||
      !priority ||
      !dueDate
    ) {
      alert(
        "Complete the task title, project, assignee, priority, and due date."
      );
      return;
    }

    const result = await createTask({
      title: title.trim(),
      projectId,
      assigneeId,
      status: "To Do",
      priority,
      dueDate,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    resetForm();
  };

  const handleEditClick = (task, e) => {
    e.stopPropagation();

    setEditingTaskId(task.id);
    setTitle(task.title || "");
    setProjectId(
      task.project
        ? String(task.project.id)
        : String(task.projectId || "")
    );
    setAssigneeId(
      task.assignee
        ? String(task.assignee.id)
        : String(task.assigneeId || "")
    );
    setPriority(task.priority || "");
    setDueDate(task.dueDate || "");
    setStatus(task.status || "To Do");
    setShowAddForm(false);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !projectId ||
      !assigneeId ||
      !priority ||
      !dueDate
    ) {
      return;
    }

    const result = await updateTask({
      id: editingTaskId,
      title: title.trim(),
      projectId,
      assigneeId,
      priority,
      dueDate,
      status,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    resetForm();
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();

    const task = tasks.find(
      (item) => String(item.id) === String(taskId)
    );

    if (!task) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    const result = await deleteTask(taskId);

    if (!result.success) {
      alert(result.message);
      return;
    }

    if (String(selectedTaskId) === String(taskId)) {
      setSelectedTaskId(null);
    }

    if (String(editingTaskId) === String(taskId)) {
      resetForm();
    }
  };

  const handleTaskClick = (task) => {
    const projId = task.projectId || task.project?.id;

    if (projId) {
      navigate(`/projects/${projId}/tasks/${task.id}`);
    } else {
      setSelectedTaskId(task.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Work Breakdown Structure
          </span>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
            Task Management
          </h1>

          <p className="mt-1 max-w-3xl text-sm text-[#475569]">
            Decompose projects into major deliverable work items.
            Click any task to enter its workspace.
          </p>
        </div>

        <Can perform="task:create">
          <button
            type="button"
            onClick={() => {
              if (editingTaskId) {
                resetForm();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
          >
            <PiPlus size={18} />
            {showAddForm || editingTaskId ? "Cancel" : "Add Task"}
          </button>
        </Can>
      </div>

      {tasksError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {tasksError}
        </div>
      )}

      {(showAddForm || editingTaskId) && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172033]">
                {editingTaskId
                  ? "Edit Parent Task"
                  : "Create Parent Task"}
              </h2>

              <p className="mt-1 text-xs text-[#64748B]">
                Parent tasks define the high-level work items that
                contain subtasks.
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

          <form
            onSubmit={
              editingTaskId
                ? handleUpdateTask
                : handleCreateTask
            }
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Task Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Authorization Service"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Project *
              </label>

              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              >
                <option value="">Select project</option>

                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Assignee *
              </label>

              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              >
                <option value="">Select assignee</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Priority *
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              >
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {editingTaskId && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569]">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569]">
                Due Date *
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="mt-1 flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#172033]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
              >
                {editingTaskId ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-700 bg-[#172033] p-5 shadow-lg shadow-slate-900/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Tasks
          </span>

          <p className="mt-2 text-2xl font-bold text-white">
            {visibleTasks.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            To Do
          </span>

          <p className="mt-2 text-2xl font-bold text-[#172033]">
            {
              visibleTasks.filter(
                (t) => t.status === "To Do"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            In Progress
          </span>

          <p className="mt-2 text-2xl font-bold text-[#2563EB]">
            {
              visibleTasks.filter(
                (t) => t.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Completed
          </span>

          <p className="mt-2 text-2xl font-bold text-[#16A34A]">
            {
              visibleTasks.filter(
                (t) => t.status === "Done"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#172033]">
              Parent Tasks
            </h2>

            <p className="text-xs text-[#64748B]">
              Click any parent task to open its workspace
            </p>
          </div>

          <span className="text-xs font-medium text-[#64748B]">
            Showing {visibleTasks.length} tasks
          </span>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-[#172033]">
              No parent tasks found in your scope.
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Create a task or check your project assignments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#172033] text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-6 py-3.5">Task</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Assignee</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {visibleTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="group cursor-pointer transition hover:bg-[#F1F5F9]"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#172033] transition group-hover:text-[#2563EB]">
                        {task.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#475569]">
                      {task.project
                        ? task.project.name
                        : `Project #${task.projectId}`}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#475569]">
                      {task.assignee
                        ? task.assignee.fullName
                        : "Unassigned"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          task.status === "Done"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : task.status === "In Progress"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.status || "To Do"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          priorityColor[task.priority] ||
                          "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {task.dueDate || "No deadline"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Can perform="task:edit">
                          <button
                            type="button"
                            onClick={(e) =>
                              handleEditClick(task, e)
                            }
                            title="Edit task"
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
                          >
                            <PiPencilSimple size={16} />
                          </button>
                        </Can>

                        <Can perform="task:delete">
                          <button
                            type="button"
                            onClick={(e) =>
                              handleDeleteTask(task.id, e)
                            }
                            title="Delete task"
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626]"
                          >
                            <PiTrash size={16} />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};

export default TaskManagement;