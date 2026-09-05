import { useAuth } from "../../context/AuthContext.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import StatCard from "../../components/dashboard/StatCard.jsx";
import TaskOverviewChart from "../../components/dashboard/TaskOverviewChart.jsx";
import ProjectProgressList from "../../components/dashboard/ProjectProgressList.jsx";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const { projects } = useProjects();

  if (!currentUser) {
    return (
      <div className="text-[#e8eef8]/50">
        Loading user...
      </div>
    );
  }

  // --------------------------------------------------
  // PROJECT STATISTICS
  // --------------------------------------------------

  const totalProjects = projects.length;

  // --------------------------------------------------
  // TASK STATISTICS
  // --------------------------------------------------

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  // --------------------------------------------------
  // CURRENT USER TASKS
  // --------------------------------------------------

  const myTasks = tasks.filter(
    (task) =>
      String(task.assigneeId) === String(currentUser.id)
  );

  const myCompletedTasks = myTasks.filter(
    (task) => task.status === "Done"
  ).length;

  const myInProgressTasks = myTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  return (
    <div>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">
          Dashboard
        </h2>

        <p className="mt-1 text-sm text-[#e8eef8]/50">
          Welcome back, {currentUser.name}
        </p>
      </div>

      {/* Main Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

        <StatCard
          label="Total Projects"
          value={totalProjects}
          sublabel="Projects"
        />

        <StatCard
          label="Total Tasks"
          value={totalTasks}
          sublabel="Tasks"
        />

        <StatCard
          label="In Progress"
          value={inProgressTasks}
          sublabel="Tasks"
        />

        <StatCard
          label="Completed"
          value={completedTasks}
          sublabel="Tasks"
        />

      </div>

      {/* Task Overview */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">

        <TaskOverviewChart
          totalTasks={totalTasks}
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          completedTasks={completedTasks}
        />

        <ProjectProgressList
          projects={projects}
          tasks={tasks}
        />

      </div>

      {/* My Tasks Summary */}
      <div className="mt-6 rounded-xl border border-[#e8eef8]/10 bg-[#181b23] p-5">

        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            My Tasks
          </h3>

          <p className="mt-1 text-sm text-[#e8eef8]/50">
            Tasks currently assigned to you
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-lg border border-[#e8eef8]/10 bg-[#0f1117] p-4">
            <p className="text-sm text-[#e8eef8]/50">
              Assigned
            </p>

            <p className="mt-2 text-xl font-semibold">
              {myTasks.length}
            </p>
          </div>

          <div className="rounded-lg border border-[#e8eef8]/10 bg-[#0f1117] p-4">
            <p className="text-sm text-[#e8eef8]/50">
              In Progress
            </p>

            <p className="mt-2 text-xl font-semibold">
              {myInProgressTasks}
            </p>
          </div>

          <div className="rounded-lg border border-[#e8eef8]/10 bg-[#0f1117] p-4">
            <p className="text-sm text-[#e8eef8]/50">
              Completed
            </p>

            <p className="mt-2 text-xl font-semibold">
              {myCompletedTasks}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;

