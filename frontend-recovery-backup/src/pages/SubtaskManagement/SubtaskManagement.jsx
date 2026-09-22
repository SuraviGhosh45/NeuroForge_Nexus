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

const SUBTASK_STATUSES = [
  "To Do",
  "In Progress",
  "Done",
];

const priorityColor = {
  Critical:
    "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

  High:
    "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

  Medium:
    "text-[#f0d090] border-[#f0d090]/30 bg-[#f0d090]/5",

  Low:
    "text-[#a0d0a0] border-[#a0d0a0]/30 bg-[#a0d0a0]/5",
};

const statusColor = {
  "To Do":
    "text-slate-300 border-slate-400/20 bg-slate-400/5",

  "In Progress":
    "text-blue-400 border-blue-400/20 bg-blue-400/5",

  Done:
    "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
};

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

  const [showForm, setShowForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] =
    useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [assigneeId, setAssigneeId] =
    useState("");
  const [priority, setPriority] =
    useState("Medium");
  const [status, setStatus] =
    useState("To Do");
  const [dueDate, setDueDate] =
    useState("");

  // --------------------------------------------------
  // PARENT TASK
  // --------------------------------------------------

  const parentTask = useMemo(() => {
    return getTaskById(taskId);
  }, [getTaskById, taskId]);

  // --------------------------------------------------
  // SUBTASKS
  // --------------------------------------------------

  const subtasks = useMemo(() => {
    return getSubtasksByTaskId(taskId);
  }, [getSubtasksByTaskId, taskId]);

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CREATE SUBTASK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // OPEN EDIT FORM
  // --------------------------------------------------

  const handleEditSubtask = (subtask) => {
    setEditingSubtaskId(subtask.id);

    setTitle(subtask.title || "");
    setDescription(subtask.description || "");

    setAssigneeId(
      subtask.assigneeId
        ? String(subtask.assigneeId)
        : ""
    );

    setPriority(subtask.priority || "Medium");
    setStatus(subtask.status || "To Do");
    setDueDate(subtask.dueDate || "");

    setShowForm(true);
  };

  // --------------------------------------------------
  // UPDATE SUBTASK
  // --------------------------------------------------

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

  // --------------------------------------------------
  // DELETE SUBTASK
  // --------------------------------------------------

  const handleDeleteSubtask = async (subtask) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subtask.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteSubtask(
      taskId,
      subtask.id
    );

    if (!result.success) {
      alert(result.message);
      return;
    }

    if (
      String(editingSubtaskId) ===
      String(subtask.id)
    ) {
      resetForm();
    }
  };

  // --------------------------------------------------
  // OPEN SUBTASK DETAILS
  // --------------------------------------------------

  const handleOpenSubtask = (subtask) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/${subtask.id}`
    );
  };

  // --------------------------------------------------
  // PARENT TASK NOT FOUND
  // --------------------------------------------------

  if (!parentTask) {
    return (
      <div className="min-h-full bg-[#07111f] p-6 text-[#e8eef8]">
        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${projectId}/tasks/${taskId}`
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
          >
            <PiArrowLeft />
            Back to Task
          </button>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">
            <p className="text-lg font-semibold">
              Task not found
            </p>

            <p className="mt-2 text-sm text-[#e8eef8]/50">
              This task may have been deleted or
              does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#07111f] px-4 py-6 text-[#e8eef8] sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* BACK TO TASK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${projectId}/tasks/${taskId}`
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
        >
          <PiArrowLeft />
          Back to Task
        </button>

        {/* HEADER */}

        <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">

          <div className="p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex flex-wrap items-center gap-3">

                  <span className="rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-3 py-1 text-xs text-[#e8eef8]/50">
                    TASK-{parentTask.id}
                  </span>

                  <span className="text-sm text-[#e8eef8]/40">
                    Subtasks
                  </span>

                </div>

                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                  {parentTask.title}
                </h1>

                <p className="mt-2 text-sm text-[#e8eef8]/50">
                  Manage the subtasks associated with
                  this task.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (editingSubtaskId) {
                    resetForm();
                  } else {
                    setShowForm(!showForm);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
              >
                <PiPlus />

                {showForm
                  ? "Cancel"
                  : "Add Subtask"}
              </button>

            </div>

          </div>
        </div>

        {/* CREATE / EDIT FORM */}

        {showForm && (
          <div className="mt-6 rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-6">

            <h2 className="text-lg font-semibold">
              {editingSubtaskId
                ? "Edit Subtask"
                : "Create Subtask"}
            </h2>

            <form
              onSubmit={
                editingSubtaskId
                  ? handleUpdateSubtask
                  : handleCreateSubtask
              }
              className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
            >

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Subtask Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter subtask title"
                  className="w-full rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                />
              </div>

              {/* ASSIGNEE */}

              <div>
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Assignee
                </label>

                <select
                  value={assigneeId}
                  onChange={(event) =>
                    setAssigneeId(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                >
                  <option value="">
                    Select user
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.fullName ||
                        user.name ||
                        user.username}
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
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                >
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

              <div>
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-4 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                >
                  {SUBTASK_STATUSES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Due Date
                </label>

                <div className="relative">
                  <PiCalendarBlank className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#e8eef8]/40" />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-10 py-2.5 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-[#e8eef8]/60">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe this subtask"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[#e8eef8]/15 bg-[#07111f] px-4 py-3 text-sm text-[#e8eef8] outline-none transition focus:border-blue-400"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex items-end gap-3 md:col-span-2">

                <button
                  type="submit"
                  className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
                >
                  {editingSubtaskId
                    ? "Update Subtask"
                    : "Create Subtask"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#e8eef8]/15 px-5 py-2.5 text-sm text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        )}

        {/* SUBTASK SUMMARY */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
            <p className="text-sm text-[#e8eef8]/50">
              Total Subtasks
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {subtasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
            <p className="text-sm text-[#e8eef8]/50">
              To Do
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                subtasks.filter(
                  (subtask) =>
                    subtask.status ===
                    "To Do"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
            <p className="text-sm text-[#e8eef8]/50">
              In Progress
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                subtasks.filter(
                  (subtask) =>
                    subtask.status ===
                    "In Progress"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
            <p className="text-sm text-[#e8eef8]/50">
              Completed
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                subtasks.filter(
                  (subtask) =>
                    subtask.status ===
                    "Done"
                ).length
              }
            </p>
          </div>

        </div>

        {/* SUBTASK LIST */}

        <div className="mt-6 rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">

          <div className="border-b border-[#e8eef8]/10 p-6">

            <h2 className="text-lg font-semibold">
              Subtasks
            </h2>

            <p className="mt-1 text-sm text-[#e8eef8]/40">
              All subtasks belonging to this
              task.
            </p>

          </div>

          {subtasks.length === 0 ? (
            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef8]/5">
                <PiCheckCircle className="text-2xl text-[#e8eef8]/30" />
              </div>

              <p className="mt-4 text-sm font-medium">
                No subtasks yet
              </p>

              <p className="mt-1 text-sm text-[#e8eef8]/40">
                Create the first subtask for this
                task.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-[#e8eef8]/10">

              {subtasks.map((subtask) => {

                const subtaskAssignee =
                  users.find(
                    (user) =>
                      String(user.id) ===
                      String(
                        subtask.assigneeId
                      )
                  );

                return (
                  <div
                    key={subtask.id}
                    className="p-6 transition hover:bg-[#e8eef8]/5"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* LEFT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenSubtask(
                                subtask
                              )
                            }
                            className="text-left text-base font-semibold text-[#e8eef8] hover:text-blue-400"
                          >
                            {subtask.title}
                          </button>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              statusColor[
                                subtask.status
                              ] ||
                              statusColor[
                                "To Do"
                              ]
                            }`}
                          >
                            {subtask.status ||
                              "To Do"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              priorityColor[
                                subtask.priority
                              ] || ""
                            }`}
                          >
                            {subtask.priority ||
                              "Medium"}
                          </span>

                        </div>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#e8eef8]/50">
                          {subtask.description ||
                            "No description has been added."}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#e8eef8]/40">

                          <span className="inline-flex items-center gap-1.5">
                            <PiUserCircle />

                            {subtaskAssignee?.fullName ||
                              subtaskAssignee?.name ||
                              subtaskAssignee?.username ||
                              "Unassigned"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <PiCalendarBlank />

                            {subtask.dueDate ||
                              "No due date"}
                          </span>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditSubtask(
                              subtask
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8eef8]/15 px-3 py-2 text-xs text-[#e8eef8]/60 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                        >
                          <PiPencil />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSubtask(
                              subtask
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
                        >
                          <PiTrash />
                          Delete
                        </button>

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