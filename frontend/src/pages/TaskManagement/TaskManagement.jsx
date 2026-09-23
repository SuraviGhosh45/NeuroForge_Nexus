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
import { PiPlus, PiListChecks, PiPencilSimple, PiTrash, PiFolder } from "react-icons/pi";

const priorityColor = {
  Critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  High: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  Medium: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const TaskManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tasks, error: tasksError, createTask, updateTask, deleteTask, getVisibleTasks } = useTasks();
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
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

  // Scoped tasks
  const visibleTasks = getVisibleTasks(currentUser, projectTeams, teams, projects);

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

    if (!title.trim() || !projectId || !assigneeId || !priority || !dueDate) {
      alert("Complete the task title, project, assignee, priority, and due date.");
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
    setProjectId(task.project ? String(task.project.id) : String(task.projectId || ""));
    setAssigneeId(task.assignee ? String(task.assignee.id) : String(task.assigneeId || ""));
    setPriority(task.priority || "");
    setDueDate(task.dueDate || "");
    setStatus(task.status || "To Do");
    setShowAddForm(false);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!title.trim() || !projectId || !assigneeId || !priority || !dueDate) {
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
    const task = tasks.find((item) => String(item.id) === String(taskId));
    if (!task) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Work Breakdown Structure
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-[#e8eef8]/60">
            Decompose projects into major deliverable work items. Click any task to enter its workspace.
          </p>
        </div>

        <Can perform="task:create">
          <button
            onClick={() => {
              if (editingTaskId) {
                resetForm();
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <PiPlus size={18} />
            {showAddForm || editingTaskId ? "Cancel" : "Add Task"}
          </button>
        </Can>
      </div>

      {tasksError && <p className="text-xs text-rose-400">{tasksError}</p>}

      {/* Task Form Modal */}
      {(showAddForm || editingTaskId) && (
        <div className="rounded-2xl border border-blue-500/20 bg-[#0d131f] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingTaskId ? "Edit Parent Task" : "Create Parent Task"}
              </h2>
              <p className="text-xs text-[#e8eef8]/50 mt-1">
                Parent tasks define the high-level work items that contain subtasks.
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

          <form
            onSubmit={editingTaskId ? handleUpdateTask : handleCreateTask}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Task Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Authorization Service"
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white placeholder-[#e8eef8]/30 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Assignee *</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
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
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
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
                <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#e8eef8]/70 mb-2">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[#e8eef8]/15 bg-[#0a0e17] px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 md:col-span-2 mt-4">
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
                {editingTaskId ? "Update Task" : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">Total Tasks</span>
          <p className="mt-2 text-2xl font-bold text-white">{visibleTasks.length}</p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">To Do</span>
          <p className="mt-2 text-2xl font-bold text-slate-300">
            {visibleTasks.filter((t) => t.status === "To Do").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">In Progress</span>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {visibleTasks.filter((t) => t.status === "In Progress").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-xs text-[#e8eef8]/50 uppercase tracking-wider">Completed</span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {visibleTasks.filter((t) => t.status === "Done").length}
          </p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8eef8]/10 bg-[#0d131f] shadow-xl">
        <div className="border-b border-[#e8eef8]/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Parent Tasks</h2>
            <p className="text-xs text-[#e8eef8]/50">Click any parent task to open its workspace</p>
          </div>
          <span className="text-xs text-[#e8eef8]/50">
            Showing {visibleTasks.length} tasks
          </span>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#e8eef8]/40">
            No parent tasks found in your scope.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e17] border-b border-[#e8eef8]/5 text-left text-xs font-medium text-[#e8eef8]/50">
                <tr>
                  <th className="px-6 py-3.5">Task</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Assignee</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8eef8]/5 text-sm">
                {visibleTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="cursor-pointer transition hover:bg-[#181f2f]/60 group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white group-hover:text-blue-400 transition">
                        {task.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                      {task.project ? task.project.name : `Project #${task.projectId}`}
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/70">
                      {task.assignee ? task.assignee.fullName : "Unassigned"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                          task.status === "Done"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : task.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {task.status || "To Do"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          priorityColor[task.priority] || "border-gray-500/30 text-gray-300"
                        }`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#e8eef8]/60">
                      {task.dueDate || "No deadline"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Can perform="task:edit">
                          <button
                            onClick={(e) => handleEditClick(task, e)}
                            title="Edit task"
                            className="rounded-lg p-1.5 text-[#e8eef8]/50 hover:bg-blue-500/10 hover:text-blue-400 transition"
                          >
                            <PiPencilSimple size={16} />
                          </button>
                        </Can>

                        <Can perform="task:delete">
                          <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            title="Delete task"
                            className="rounded-lg p-1.5 text-[#e8eef8]/50 hover:bg-rose-500/10 hover:text-rose-400 transition"
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
        <TaskDetails task={selectedTask} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
};

export default TaskManagement;