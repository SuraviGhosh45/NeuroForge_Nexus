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
  Critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300",
  High: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300",
  Medium: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300",
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
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

  const { users } = useUsers();
  const { projects } = useProjects();

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172033] dark:text-white">
                {editingTaskId
                  ? "Edit Parent Task"
                  : "Create Parent Task"}
              </h2>

              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                Parent tasks define the high-level deliverable work items decomposed into subtasks.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#172033] dark:hover:bg-slate-800 dark:hover:text-white"
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
              <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                Task Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Authorization Service"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                Project *
              </label>

              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="" className="dark:bg-slate-800 dark:text-white">Select project</option>

                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="dark:bg-slate-800 dark:text-white">
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                Assignee *
              </label>

              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="" className="dark:bg-slate-800 dark:text-white">Select assignee</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id} className="dark:bg-slate-800 dark:text-white">
                    {user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                Priority *
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="" className="dark:bg-slate-800 dark:text-white">Select priority</option>
                <option value="Low" className="dark:bg-slate-800 dark:text-white">Low</option>
                <option value="Medium" className="dark:bg-slate-800 dark:text-white">Medium</option>
                <option value="High" className="dark:bg-slate-800 dark:text-white">High</option>
                <option value="Critical" className="dark:bg-slate-800 dark:text-white">Critical</option>
              </select>
            </div>

            {editingTaskId && (
              <div>
                <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="To Do" className="dark:bg-slate-800 dark:text-white">To Do</option>
                  <option value="In Progress" className="dark:bg-slate-800 dark:text-white">In Progress</option>
                  <option value="In Review" className="dark:bg-slate-800 dark:text-white">In Review</option>
                  <option value="Done" className="dark:bg-slate-800 dark:text-white">Done</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#475569] dark:text-slate-300">
                Due Date *
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="mt-1 flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#172033] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Tasks
          </span>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {visibleTasks.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            To Do
          </span>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {
              visibleTasks.filter(
                (t) => t.status === "To Do"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            In Progress
          </span>

          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {
              visibleTasks.filter(
                (t) => t.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Completed
          </span>

          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {
              visibleTasks.filter(
                (t) => t.status === "Done"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Parent Tasks
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any parent task to open its workspace
            </p>
          </div>

          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {visibleTasks.length} tasks
          </span>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              No parent tasks found in your scope.
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create a task or check your project assignments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
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

              <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {visibleTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="group cursor-pointer transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        {task.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {task.project
                        ? task.project.name
                        : `Project #${task.projectId}`}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {task.assignee
                        ? task.assignee.fullName
                        : "Unassigned"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          task.status === "Done"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : task.status === "In Progress"
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
                            : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {task.status || "To Do"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          priorityColor[task.priority] ||
                          "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
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
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-300"
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
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-[#DC2626] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-700 dark:hover:text-red-300"
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