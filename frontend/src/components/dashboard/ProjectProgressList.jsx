import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";

const ProjectProgressList = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const projectStats = projects.map((project) => {
    const projectTasks = tasks.filter(
      (task) =>
        String(task.project?.id ?? task.projectId) === String(project.id)
    );

    const done = projectTasks.filter(
      (task) => ["DONE", "Done"].includes(task.boardStatus || task.status)
    ).length;

    const percent = projectTasks.length
      ? Math.round((done / projectTasks.length) * 100)
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[#172033]">
        Project Progress
      </h3>

      {projectStats.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          No projects yet.
        </p>
      ) : (
        <div className="space-y-5">
          {projectStats.map((project) => (
            <div key={project.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-[#172033]">
                  {project.name}
                </span>

                <span className="font-semibold text-[#475569]">
                  {project.percent}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all"
                  style={{
                    width: `${project.percent}%`,
                  }}
                />
              </div>

              <p className="mt-1.5 text-xs text-[#64748B]">
                {project.completedTasks} of {project.totalTasks} tasks completed
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectProgressList;