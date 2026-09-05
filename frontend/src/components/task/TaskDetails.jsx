import { useState } from "react";
import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";

const SUBTASK_STATUSES = ["To Do", "In Progress", "Done"];
const TASK_STATUSES = ["To Do", "In Progress", "Done"];

const priorityColor = {
  High: "text-[#f0a0a0] border-[#f0a0a0]/30",
  Medium: "text-[#f0d090] border-[#f0d090]/30",
  Low: "text-[#a0d0a0] border-[#a0d0a0]/30",
};

const TaskDetails = ({ task }) => {
  const {
    tasks,
    addSubtask,
    updateSubtaskStatus,
    updateTask,
  } = useTasks();

  const { users } = useUsers();

  const [newSubtask, setNewSubtask] = useState("");

  // Always get the latest version of this task from context
  const currentTask =
    tasks.find((t) => String(t.id) === String(task.id)) || task;

  // Find the assignee using assigneeId
  const assignee = users.find(
    (user) =>
      String(user.id) === String(currentTask.assigneeId)
  );

  const handleAddSubtask = (e) => {
    e.preventDefault();

    if (!newSubtask.trim()) return;

    addSubtask(currentTask.id, newSubtask.trim());
    setNewSubtask("");
  };

  const handleTaskStatusChange = (e) => {
    updateTask({
      ...currentTask,
      status: e.target.value,
    });
  };

  return (
    <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">

      {/* TASK HEADER */}
      <h3 className="text-lg font-semibold text-[#e8eef8]">
        Task details
      </h3>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xl font-semibold text-[#e8eef8]">
          {currentTask.title}
        </span>

        <span className="rounded-md border border-[#e8eef8]/15 px-2 py-0.5 text-xs text-[#e8eef8]/70">
          {currentTask.key || "TASK"}
        </span>
      </div>

      {/* TASK INFORMATION */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">

        {/* ASSIGNEE */}
        <div>
          <p className="text-[#e8eef8]/40">
            Assignee
          </p>

          <p className="mt-1 text-[#e8eef8]/80">
            {assignee?.name || "Unassigned"}
          </p>
        </div>

        {/* STATUS */}
        <div>
          <p className="text-[#e8eef8]/40">
            Status
          </p>

          <select
            value={currentTask.status || "To Do"}
            onChange={handleTaskStatusChange}
            className="mt-1 rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-2 py-1 text-xs text-[#e8eef8] outline-none"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* PRIORITY */}
        <div>
          <p className="text-[#e8eef8]/40">
            Priority
          </p>

          <span
            className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${
              priorityColor[currentTask.priority] || ""
            }`}
          >
            {currentTask.priority || "Not set"}
          </span>
        </div>

        {/* DUE DATE */}
        <div>
          <p className="text-[#e8eef8]/40">
            Due date
          </p>

          <p className="mt-1 text-[#e8eef8]/80">
            {currentTask.dueDate || "Not set"}
          </p>
        </div>

      </div>

      {/* SUBTASKS */}
      <div className="mt-6">

        <div className="border-b border-[#e8eef8]/10 pb-2">
          <h4 className="text-sm font-medium text-[#e8eef8]">
            Subtasks ({(currentTask.subtasks || []).length})
          </h4>
        </div>

        <div className="mt-4 space-y-2">

          {(currentTask.subtasks || []).map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between rounded-md border border-[#e8eef8]/10 px-4 py-2.5"
            >

              <span className="text-sm text-[#e8eef8]/80">
                {subtask.title}
              </span>

              <select
                value={subtask.status || "To Do"}
                onChange={(e) =>
                  updateSubtaskStatus(
                    currentTask.id,
                    subtask.id,
                    e.target.value
                  )
                }
                className="rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-2 py-1 text-xs text-[#e8eef8] outline-none"
              >
                {SUBTASK_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>

            </div>
          ))}

          {/* ADD SUBTASK */}
          <form
            onSubmit={handleAddSubtask}
            className="mt-3 flex gap-2"
          >

            <input
              type="text"
              placeholder="New subtask"
              value={newSubtask}
              onChange={(e) =>
                setNewSubtask(e.target.value)
              }
              className="flex-1 rounded-md border border-[#e8eef8]/15 bg-[#07111f] px-3 py-2 text-sm text-[#e8eef8] outline-none"
            />

            <button
              type="submit"
              className="rounded-md bg-[#378add] px-4 py-2 text-sm font-medium text-white"
            >
              Add subtask
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};

export default TaskDetails;