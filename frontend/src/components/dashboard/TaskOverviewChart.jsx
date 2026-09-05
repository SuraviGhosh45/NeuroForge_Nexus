
import { PieChart, Pie, Cell } from "recharts";
import { useTasks } from "../../context/TasksContext.jsx";

const STATUS_COLORS = {
  "To Do": "#7f77dd",
  "In Progress": "#f2a623",
  Done: "#22c55e",
};

const TaskOverviewChart = () => {
  const { tasks } = useTasks();

  // Count tasks by status
  const counts = Object.keys(STATUS_COLORS).map((status) => ({
    name: status,
    value: tasks.filter(
      (task) => task.status === status
    ).length,
  }));

  const total = counts.reduce(
    (sum, count) => sum + count.value,
    0
  );

  return (
    <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">
      <h3 className="mb-4 text-lg font-semibold text-[#e8eef8]">
        Task Overview
      </h3>

      {total === 0 ? (
        <p className="text-sm text-[#e8eef8]/40">
          No tasks yet.
        </p>
      ) : (
        <div className="flex items-center gap-6">

          {/* Pie Chart */}
          <PieChart width={140} height={140}>
            <Pie
              data={counts}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
            >
              {counts.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name]}
                />
              ))}
            </Pie>
          </PieChart>

          {/* Status List */}
          <ul className="flex-1 space-y-3">

            {counts.map((entry) => (
              <li
                key={entry.name}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[entry.name],
                  }}
                />

                <span className="text-[#e8eef8]/70">
                  {entry.name}
                </span>

                <span className="ml-auto font-medium text-[#e8eef8]">
                  {entry.value}
                </span>
              </li>
            ))}

          </ul>

        </div>
      )}
    </div>
  );
};

export default TaskOverviewChart;

