import { useTasks } from "../../context/TasksContext.jsx";

const TASK_STATUSES = ["To Do", "In Progress", "Done"];

const priorityColor = {
  High: "text-red-700 border-red-200 bg-red-50",
  Medium: "text-amber-700 border-amber-200 bg-amber-50",
  Low: "text-green-700 border-green-200 bg-green-50",
};

const TaskDetails = ({ task, onClose }) => {
  const { tasks, updateTask } = useTasks();

  const currentTask =
    tasks.find((t) => String(t.id) === String(task.id)) || task;

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
    <div className="mt-6 rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#172033]">
          Task details
        </h3>

        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm font-medium text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#172033]"
        >
          Close
        </button>
      </div>

      <div className="mt-3">
        <span className="text-xl font-semibold text-[#172033]">
          {currentTask.title}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-4 text-sm">
        <div className="rounded-lg border border-slate-200 bg-[#F1F5F9] p-3">
          <p className="text-xs font-medium text-[#64748B]">
            Assignee
          </p>
          <p className="mt-1 font-medium text-[#172033]">
            {currentTask.assignee?.fullName || "Unassigned"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-[#F1F5F9] p-3">
          <p className="text-xs font-medium text-[#64748B]">
            Status
          </p>

          <select
            value={currentTask.status || "To Do"}
            onChange={handleTaskStatusChange}
            className="mt-2 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/15"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 bg-[#F1F5F9] p-3">
          <p className="text-xs font-medium text-[#64748B]">
            Priority
          </p>

          <span
            className={`mt-2 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${
              priorityColor[currentTask.priority] ||
              "border-slate-200 bg-white text-[#64748B]"
            }`}
          >
            {currentTask.priority || "Not set"}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-[#F1F5F9] p-3">
          <p className="text-xs font-medium text-[#64748B]">
            Due date
          </p>

          <p className="mt-2 font-medium text-[#172033]">
            {currentTask.dueDate || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;