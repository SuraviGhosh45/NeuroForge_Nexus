import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";

const ProjectProgressList = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const projectStats = projects.map((project) => {
    // Get tasks belonging to this project
    const projectTasks = tasks.filter(
      (task) =>
        String(task.projectId) === String(project.id)
    );

    // Count completed tasks
    const done = projectTasks.filter(
      (task) => task.status === "Done"
    ).length;

    // Calculate progress
    const percent = projectTasks.length
      ? Math.round(
          (done / projectTasks.length) * 100
        )
      : 0;

    return {
      id: project.id,
      name: project.name,
      percent,
      totalTasks: projectTasks.length,
      completedTasks: done,
    };
  });

  return (
    <div className="rounded-xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5">

      <h3 className="mb-4 text-lg font-semibold text-[#e8eef8]">
        Project Progress
      </h3>

      {projectStats.length === 0 ? (
        <p className="text-sm text-[#e8eef8]/40">
          No projects yet.
        </p>
      ) : (
        <div className="space-y-5">

          {projectStats.map((project) => (
            <div key={project.id}>

              {/* Project name + percentage */}
              <div className="mb-1.5 flex items-center justify-between text-sm">

                <span className="text-[#e8eef8]/80">
                  {project.name}
                </span>

                <span className="text-[#e8eef8]/50">
                  {project.percent}%
                </span>

              </div>

              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8eef8]/10">

                <div
                  className="h-full rounded-full bg-[#378add] transition-all"
                  style={{
                    width: `${project.percent}%`,
                  }}
                />

              </div>

              {/* Task count */}
              <p className="mt-1.5 text-xs text-[#e8eef8]/40">
                {project.completedTasks} of{" "}
                {project.totalTasks} tasks completed
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProjectProgressList;

