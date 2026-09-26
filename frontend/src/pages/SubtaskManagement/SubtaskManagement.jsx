import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiCheckCircle,
  PiPencil,
  PiPlus,
  PiTrash,
  PiUserCircle,
} from "react-icons/pi";

import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { usePermission } from "../../hooks/usePermission.js";
import Can from "../../components/common/Can.jsx";

const SUBTASK_STATUSES = [
  "To Do",
  "In Progress",
  "In Review",
  "Ready for Testing",
  "In Testing",
  "In QA",
  "Done",
];

const priorityColor = {
  Critical:
    "border-red-200 bg-red-50 text-red-700",

  High:
    "border-orange-200 bg-orange-50 text-orange-700",

  Medium:
    "border-amber-200 bg-amber-50 text-amber-700",

  Low:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusColor = {
  "To Do":
    "border-slate-200 bg-slate-100 text-slate-600",

  "In Progress":
    "border-blue-200 bg-blue-50 text-blue-700",

  "In Review":
    "border-amber-200 bg-amber-50 text-amber-700",

  "Ready for Testing":
    "border-purple-200 bg-purple-50 text-purple-700",

  "In Testing":
    "border-indigo-200 bg-indigo-50 text-indigo-700",

  "In QA":
    "border-cyan-200 bg-cyan-50 text-cyan-700",

  Done:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#172033] placeholder:text-slate-400 outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15";

const SubtaskManagement = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const {
    getTaskById,
    getSubtasksByTaskId,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  } = useTasks();

  const { users } = useUsers();
  const { can } = usePermission();
  const { currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [dueDate, setDueDate] = useState("");

  const parentTask = useMemo(() => {
    return getTaskById(taskId);
  }, [getTaskById, taskId]);

  const subtasks = useMemo(() => {
    return getSubtasksByTaskId(taskId);
  }, [getSubtasksByTaskId, taskId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setPriority("Medium");
    setStatus("To Do");
    setDueDate("");
    setEditingSubtaskId(null);
    setShowForm(false);
  };

  const handleCreateSubtask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a subtask title.");
      return;
    }

    const result = await createSubtask(taskId, {
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      status: "To Do",
      dueDate,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    resetForm();
  };

  const handleEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);

    setTitle(subtask.title || "");
    setDescription(subtask.description || "");

    setAssigneeId(
      subtask.assigneeId ? String(subtask.assigneeId) : ""
    );

    setPriority(subtask.priority || "Medium");
    setStatus(subtask.status || "To Do");
    setDueDate(subtask.dueDate || "");

    setShowForm(true);
  };

  const handleUpdateSubtask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a subtask title.");
      return;
    }

    const result = await updateSubtask(taskId, {
      id: editingSubtaskId,
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      status,
      dueDate,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    resetForm();
  };

  const handleDeleteSubtask = async (subtask) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subtask.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteSubtask(taskId, subtask.id);

    if (!result.success) {
      alert(result.message);
      return;
    }

    if (String(editingSubtaskId) === String(subtask.id)) {
      resetForm();
    }
  };

  const handleOpenSubtask = (subtask) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/${subtask.id}`
    );
  };

  if (!parentTask) {
    return (
      <div className="min-h-full bg-[#E8EEF7] px-4 py-6 text-[#172033] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              navigate(`/projects/${projectId}/tasks/${taskId}`)
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#172033]"
          >
            <PiArrowLeft size={18} />
            Back to Task
          </button>

          <div className="rounded-2xl border border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#172033]">
              Task not found
            </p>

            <p className="mt-2 text-sm text-[#64748B]">
              This task may have been deleted or does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#E8EEF7] px-4 py-6 text-[#172033] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() =>
            navigate(`/projects/${projectId}/tasks/${taskId}`)
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#172033]"
        >
          <PiArrowLeft size={18} />
          Back to Task
        </button>

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#172033] shadow-lg shadow-slate-900/10">
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg border border-slate-600 bg-[#24324A] px-3 py-1 text-xs font-semibold text-slate-300">
                    TASK-{parentTask.id}
                  </span>

                  <span className="text-sm text-slate-400">
                    Subtasks
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  {parentTask.title}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Manage the subtasks associated with this task.
                </p>
              </div>

              <Can perform="subtask:create">
                <button
                  type="button"
                  onClick={() => {
                    if (editingSubtaskId) {
                      resetForm();
                    } else {
                      setShowForm(!showForm);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
                >
                  <PiPlus size={18} />

                  {showForm ? "Cancel" : "Add Subtask"}
                </button>
              </Can>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#172033]">
                {editingSubtaskId
                  ? "Edit Subtask"
                  : "Create Subtask"}
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Add the details needed to track this subtask.
              </p>
            </div>

            <form
              onSubmit={
                editingSubtaskId
                  ? handleUpdateSubtask
                  : handleCreateSubtask
              }
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Subtask Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter subtask title"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Assignee
                </label>

                <select
                  value={assigneeId}
                  onChange={(event) =>
                    setAssigneeId(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Select user</option>

                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName ||
                        user.name ||
                        user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className={inputClass}
                >
                  {SUBTASK_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Due Date
                </label>

                <div className="relative">
                  <PiCalendarBlank
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    className={`${inputClass} px-10`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#475569]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe this subtask"
                  rows={4}
                  className={`${inputClass} resize-none px-4 py-3`}
                />
              </div>

              <div className="flex items-end gap-3 md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
                >
                  {editingSubtaskId
                    ? "Update Subtask"
                    : "Create Subtask"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-[#172033]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-700 bg-[#172033] p-5 shadow-lg shadow-slate-900/10">
            <p className="text-sm font-medium text-slate-400">
              Total Subtasks
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {subtasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#64748B]">
              To Do
            </p>

            <p className="mt-2 text-2xl font-bold text-[#172033]">
              {
                subtasks.filter(
                  (subtask) => subtask.status === "To Do"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#64748B]">
              In Progress
            </p>

            <p className="mt-2 text-2xl font-bold text-[#2563EB]">
              {
                subtasks.filter(
                  (subtask) =>
                    subtask.status === "In Progress"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#64748B]">
              Completed
            </p>

            <p className="mt-2 text-2xl font-bold text-[#16A34A]">
              {
                subtasks.filter(
                  (subtask) => subtask.status === "Done"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-[#172033]">
              Subtasks
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              All subtasks belonging to this task.
            </p>
          </div>

          {subtasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
                <PiCheckCircle
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#172033]">
                No subtasks yet
              </p>

              <p className="mt-1 text-sm text-[#64748B]">
                Create the first subtask for this task.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {subtasks.map((subtask) => {
                const subtaskAssignee = users.find(
                  (user) =>
                    String(user.id) ===
                    String(subtask.assigneeId)
                );

                return (
                  <div
                    key={subtask.id}
                    className="p-6 transition hover:bg-[#F1F5F9]"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenSubtask(subtask)
                            }
                            className="text-left text-base font-semibold text-[#172033] transition hover:text-[#2563EB]"
                          >
                            {subtask.title}
                          </button>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusColor[subtask.status] ||
                              statusColor["To Do"]
                            }`}
                          >
                            {subtask.status || "To Do"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              priorityColor[
                                subtask.priority
                              ] || priorityColor.Medium
                            }`}
                          >
                            {subtask.priority || "Medium"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">
                          {subtask.description ||
                            "No description has been added."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#64748B]">
                          <span className="inline-flex items-center gap-1.5">
                            <PiUserCircle size={16} />

                            {subtaskAssignee?.fullName ||
                              subtaskAssignee?.name ||
                              subtaskAssignee?.username ||
                              "Unassigned"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <PiCalendarBlank size={16} />

                            {subtask.dueDate ||
                              "No due date"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(can("subtask:edit") ||
                          String(subtask.assigneeId) ===
                            String(currentUser?.id)) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEditSubtask(subtask)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
                          >
                            <PiPencil size={15} />
                            Edit
                          </button>
                        )}

                        {can("subtask:delete") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteSubtask(subtask)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <PiTrash size={15} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskManagement;