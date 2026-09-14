import { useTasks } from "../../context/TasksContext.jsx";

const TASK_STATUSES = ["To Do", "In Progress", "Done"];

const priorityColor = {
  High: "text-[#f0a0a0] border-[#f0a0a0]/30",
  Medium: "text-[#f0d090] border-[#f0d090]/30",
  Low: "text-[#a0d0a0] border-[#a0d0a0]/30",
};

const TaskDetails = ({ task, onClose }) => {
  const { tasks, updateTask } = useTasks();

  const currentTask = tasks.find((t) => String(t.id) === String(task.id)) || task;

  const handleTaskStatusChange = async (e) => {
    await updateTask({
      id: currentTask.id,
      title: currentTask.title,
      projectId: currentTask.project?.id,
      assigneeId: currentTask.assignee?.id,
      priority: currentTask.priority,
      dueDate: currentTask.dueDate,
      status: e.target.value,
    });
  };

  return (
    <div className="mt-6 rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#e8eef8]">Task details</h3>

        <button
          onClick={onClose}
          className="text-sm text-[#e8eef8]/50 hover:text-[#e8eef8]"
        >
          Close
        </button>
      </div>

      <div className="mt-2">
        <span className="text-xl font-semibold text-[#e8eef8]">{currentTask.title}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-[#e8eef8]/40">Assignee</p>
          <p className="mt-1 text-[#e8eef8]/80">
            {currentTask.assignee?.fullName || "Unassigned"}
          </p>
        </div>

        <div>
          <p className="text-[#e8eef8]/40">Status</p>
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

        <div>
          <p className="text-[#e8eef8]/40">Priority</p>
          <span
            className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${
              priorityColor[currentTask.priority] || ""
            }`}
          >
            {currentTask.priority || "Not set"}
          </span>
        </div>

        <div>
          <p className="text-[#e8eef8]/40">Due date</p>
          <p className="mt-1 text-[#e8eef8]/80">{currentTask.dueDate || "Not set"}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;