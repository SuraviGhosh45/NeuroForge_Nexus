import { useState } from "react";
import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import TaskDetails from "../../components/task/TaskDetails.jsx";

const TaskManagement = () => {
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const { users } = useUsers();
  const { projects } = useProjects();

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("To Do");

  // --------------------------------------------------
  // SELECTED TASK
  // --------------------------------------------------

  const selectedTask = tasks.find(
    (task) =>
      String(task.id) === String(selectedTaskId)
  );

  // --------------------------------------------------
  // GET PROJECT NAME
  // Supports both new projectId and old project data
  // --------------------------------------------------

  const getProjectName = (task) => {
    if (task.projectId) {
      const project = projects.find(
        (project) =>
          String(project.id) === String(task.projectId)
      );

      return project?.name || "Unknown Project";
    }

    // Support old tasks created with `project`
    if (task.project) {
      return task.project;
    }

    return "Unknown Project";
  };

  // --------------------------------------------------
  // GET USER NAME
  // Supports both new assigneeId and old assignee data
  // --------------------------------------------------

  const getUserName = (task) => {
    if (task.assigneeId) {
      const user = users.find(
        (user) =>
          String(user.id) === String(task.assigneeId)
      );

      return user?.name || "Unassigned";
    }

    // Support old tasks created with `assignee`
    if (task.assignee) {
      return task.assignee;
    }

    return "Unassigned";
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CREATE TASK
  // --------------------------------------------------

  const handleCreateTask = (e) => {
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

    createTask({
      title: title.trim(),
      key: `TSK-${tasks.length + 1}`,
      projectId,
      assigneeId,
      status: "To Do",
      priority,
      dueDate,
    });

    resetForm();
  };

  // --------------------------------------------------
  // START EDITING
  // --------------------------------------------------

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);

    setTitle(task.title || "");

    /*
      New tasks use projectId.
      Old tasks may have project name instead.
    */
    setProjectId(task.projectId || "");

    /*
      New tasks use assigneeId.
      Old tasks may have assignee name instead.
    */
    setAssigneeId(task.assigneeId || "");

    setPriority(task.priority || "");
    setDueDate(task.dueDate || "");
    setStatus(task.status || "To Do");

    setShowAddForm(false);
  };

  // --------------------------------------------------
  // UPDATE TASK
  // --------------------------------------------------

  const handleUpdateTask = (e) => {
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

    const existingTask = tasks.find(
      (task) =>
        String(task.id) === String(editingTaskId)
    );

    if (!existingTask) {
      return;
    }

    updateTask({
      ...existingTask,

      title: title.trim(),

      // Use the new relationship fields
      projectId,
      assigneeId,

      priority,
      dueDate,
      status,
    });

    resetForm();
  };

  // --------------------------------------------------
  // DELETE TASK
  // --------------------------------------------------

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(
      (item) =>
        String(item.id) === String(taskId)
    );

    if (!task) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    deleteTask(taskId);

    // Close task details if the deleted task was open
    if (
      String(selectedTaskId) === String(taskId)
    ) {
      setSelectedTaskId(null);
    }

    // Close edit form if deleting edited task
    if (
      String(editingTaskId) === String(taskId)
    ) {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] p-6 text-[#e8eef8]">

      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Task Management
          </h1>

          <p className="mt-1 text-sm text-[#e8eef8]/50">
            Create and manage project tasks
          </p>
        </div>

        <button
          onClick={() => {
            if (editingTaskId) {
              resetForm();
            } else {
              setShowAddForm(!showAddForm);
            }
          }}
          className="rounded-md bg-[#e8eef8] px-4 py-2 text-sm font-medium text-[#07111f] hover:bg-white"
        >
          {showAddForm || editingTaskId
            ? "Cancel"
            : "+ Add Task"}
        </button>

      </div>

      {/* ------------------------------------------------ */}
      {/* CREATE / EDIT FORM */}
      {/* ------------------------------------------------ */}

      {(showAddForm || editingTaskId) && (
        <div className="mb-6 rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-6">

          <h2 className="mb-5 text-lg font-semibold">
            {editingTaskId
              ? "Edit Task"
              : "Create Task"}
          </h2>

          <form
            onSubmit={
              editingTaskId
                ? handleUpdateTask
                : handleCreateTask
            }
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >

            {/* TASK TITLE */}
            <div>
              <label className="mb-2 block text-sm text-[#e8eef8]/60">
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter task title"
                className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
              />
            </div>

            {/* PROJECT */}
            <div>
              <label className="mb-2 block text-sm text-[#e8eef8]/60">
                Project
              </label>

              <select
                value={projectId}
                onChange={(e) =>
                  setProjectId(e.target.value)
                }
                className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ASSIGNEE */}
            <div>
              <label className="mb-2 block text-sm text-[#e8eef8]/60">
                Assignee
              </label>

              <select
                value={assigneeId}
                onChange={(e) =>
                  setAssigneeId(e.target.value)
                }
                className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
              >
                <option value="">
                  Select user
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name} — {user.role}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="mb-2 block text-sm text-[#e8eef8]/60">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
              >
                <option value="">
                  Select priority
                </option>

                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>

                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>

            {/* STATUS */}
            {editingTaskId && (
              <div>
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
                >
                  <option value="To Do">
                    To Do
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Done">
                    Done
                  </option>
                </select>
              </div>
            )}

            {/* DUE DATE */}
            <div>
              <label className="mb-2 block text-sm text-[#e8eef8]/60">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
                className="w-full rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-4 py-2.5 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex items-end">

              <button
                type="submit"
                className="w-full rounded-md bg-[#e8eef8] px-4 py-2.5 text-sm font-medium text-[#07111f] hover:bg-white"
              >
                {editingTaskId
                  ? "Update Task"
                  : "Create Task"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* TASK STATS */}
      {/* ------------------------------------------------ */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            Total Tasks
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {tasks.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            To Do
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {
              tasks.filter(
                (task) => task.status === "To Do"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {
              tasks.filter(
                (task) =>
                  task.status === "In Progress"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {
              tasks.filter(
                (task) => task.status === "Done"
              ).length
            }
          </p>
        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* TASK TABLE */}
      {/* ------------------------------------------------ */}

      <div className="overflow-hidden rounded-xl border border-[#e8eef8]/10 bg-[#181b23]">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b border-[#e8eef8]/10">

              <tr className="text-left text-sm text-[#e8eef8]/50">

                <th className="px-4 py-3">
                  Task
                </th>

                <th className="px-4 py-3">
                  Project
                </th>

                <th className="px-4 py-3">
                  Assignee
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Priority
                </th>

                <th className="px-4 py-3">
                  Due Date
                </th>

                <th className="px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {tasks.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm text-[#e8eef8]/40"
                  >
                    No tasks created yet
                  </td>
                </tr>

              ) : (

                tasks.map((task) => (

                  <tr
                    key={task.id}
                    className="border-b border-[#e8eef8]/10 hover:bg-[#e8eef8]/5"
                  >

                    {/* TASK */}
                    <td className="px-4 py-4">

                      <button
                        onClick={() =>
                          setSelectedTaskId(task.id)
                        }
                        className="text-left"
                      >

                        <p className="font-medium text-[#e8eef8] hover:underline">
                          {task.title}
                        </p>

                        <p className="mt-1 text-xs text-[#e8eef8]/40">
                          {task.key}
                        </p>

                      </button>

                    </td>

                    {/* PROJECT */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {getProjectName(task)}
                    </td>

                    {/* ASSIGNEE */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {getUserName(task)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">

                      <span className="rounded-full border border-[#e8eef8]/15 px-3 py-1 text-xs text-[#e8eef8]/70">
                        {task.status || "To Do"}
                      </span>

                    </td>

                    {/* PRIORITY */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {task.priority || "Not Set"}
                    </td>

                    {/* DUE DATE */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {task.dueDate || "No due date"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            handleEditClick(task)
                          }
                          className="rounded-md border border-[#e8eef8]/15 px-3 py-1.5 text-xs text-[#e8eef8]/70 hover:bg-[#e8eef8]/10 hover:text-[#e8eef8]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteTask(task.id)
                          }
                          className="rounded-md border border-red-400/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/10"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* TASK DETAILS */}
      {/* ------------------------------------------------ */}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() =>
            setSelectedTaskId(null)
          }
        />
      )}

    </div>
  );
};

export default TaskManagement;