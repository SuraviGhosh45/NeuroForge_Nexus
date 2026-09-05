import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import TaskDetails from "../../components/task/TaskDetails.jsx";

const MyTasks = () => {
  const { currentUser } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { projects } = useProjects();

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Get only tasks assigned to the logged-in user
  const myTasks = tasks.filter(
    (task) =>
      String(task.assigneeId) === String(currentUser?.id)
  );

  const selectedTask = myTasks.find(
    (task) => String(task.id) === String(selectedTaskId)
  );

  // Get project name using projectId
  const getProjectName = (projectId) => {
    const project = projects.find(
      (project) =>
        String(project.id) === String(projectId)
    );

    return project?.name || "Unknown Project";
  };

  // Update task status
  const handleStatusChange = (task, newStatus) => {
    updateTask({
      ...task,
      status: newStatus,
    });
  };

  // Statistics
  const totalTasks = myTasks.length;

  const todoTasks = myTasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const inProgressTasks = myTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = myTasks.filter(
    (task) => task.status === "Done"
  ).length;

  return (
    <div className="min-h-screen bg-[#0f1117] p-6 text-[#e8eef8]">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          My Tasks
        </h1>

        <p className="mt-1 text-sm text-[#e8eef8]/50">
          View and manage tasks assigned to you
        </p>
      </div>

      {/* User Information */}
      {currentUser && (
        <div className="mb-6 rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            Logged in as
          </p>

          <p className="mt-1 text-lg font-medium">
            {currentUser.name}
          </p>

          <p className="mt-1 text-sm text-[#e8eef8]/50">
            {currentUser.email}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            Total Tasks
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {totalTasks}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            To Do
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {todoTasks}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {inProgressTasks}
          </p>
        </div>

        <div className="rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">
          <p className="text-sm text-[#e8eef8]/50">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {completedTasks}
          </p>
        </div>

      </div>

      {/* Task Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8eef8]/10 bg-[#181b23]">

        <div className="border-b border-[#e8eef8]/10 px-5 py-4">
          <h2 className="text-lg font-semibold">
            Assigned Tasks
          </h2>
        </div>

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
                  Status
                </th>

                <th className="px-4 py-3">
                  Priority
                </th>

                <th className="px-4 py-3">
                  Due Date
                </th>

              </tr>

            </thead>

            <tbody>

              {myTasks.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >

                    <p className="text-sm text-[#e8eef8]/40">
                      No tasks assigned to you yet.
                    </p>

                  </td>

                </tr>

              ) : (

                myTasks.map((task) => (

                  <tr
                    key={task.id}
                    className="border-b border-[#e8eef8]/10 hover:bg-[#e8eef8]/5"
                  >

                    {/* Task */}
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

                    {/* Project */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {getProjectName(task.projectId)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">

                      <select
                        value={task.status || "To Do"}
                        onChange={(e) =>
                          handleStatusChange(
                            task,
                            e.target.value
                          )
                        }
                        className="rounded-md border border-[#e8eef8]/15 bg-[#0f1117] px-3 py-2 text-sm text-[#e8eef8] outline-none focus:border-[#e8eef8]/40"
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

                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4">

                      <span className="rounded-full border border-[#e8eef8]/15 px-3 py-1 text-xs text-[#e8eef8]/70">
                        {task.priority || "Not Set"}
                      </span>

                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4 text-sm text-[#e8eef8]/60">
                      {task.dueDate || "No due date"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Task Details */}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

    </div>
  );
};

export default MyTasks;

