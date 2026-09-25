import React, { useMemo, useState } from "react";
import KanbanColumn from "./KanbanColumn.jsx";
import { useTasks } from "../../context/TasksContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import "./Kanban.css";

const COLUMNS = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "In Review", title: "In Review" },
  { id: "Done", title: "Done" },
];

function KanbanBoard() {
  const { tasks, updateTask, updateTaskStatus } = useTasks();

  const {
    projects,
    selectedProjectId,
    selectProject,
  } = useProjects();

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (event, task) => {
    setDraggedTaskId(task.id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", String(task.id));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();
    event.stopPropagation();

    const taskId =
      event.dataTransfer.getData("taskId") || draggedTaskId;

    if (!taskId) {
      setDraggedTaskId(null);
      return;
    }

    const task = tasks.find(
      (item) => String(item.id) === String(taskId)
    );

    if (!task) {
      setDraggedTaskId(null);
      return;
    }

    if (task.status === newStatus || task.boardStatus === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    const result = updateTaskStatus
      ? await updateTaskStatus(task.id, newStatus)
      : await updateTask({ ...task, status: newStatus });

    if (!result.success) {
      console.error(
        "Failed to update task status:",
        result.message
      );
    }

    setDraggedTaskId(null);
  };

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }

    return tasks.filter(
      (task) =>
        String(task.projectId) ===
        String(selectedProjectId)
    );
  }, [tasks, selectedProjectId]);

  const normalizeStatus = (status) => {
    if (!status) return "To Do";
    const upper = String(status).toUpperCase().replace(/\s+/g, "_");
    if (upper === "TODO" || upper === "TO_DO") return "To Do";
    if (upper === "IN_PROGRESS") return "In Progress";
    if (upper === "IN_REVIEW" || upper === "READY_FOR_TESTING" || upper === "IN_TESTING" || upper === "IN_QA") return "In Review";
    if (upper === "DONE" || upper === "COMPLETED") return "Done";
    return status;
  };

  const tasksByStatus = useMemo(() => {
    const groupedTasks = {
      "To Do": [],
      "In Progress": [],
      "In Review": [],
      Done: [],
    };

    projectTasks.forEach((task) => {
      const status = normalizeStatus(task.status || task.boardStatus);

      if (groupedTasks[status]) {
        groupedTasks[status].push(task);
      } else {
        groupedTasks["To Do"].push(task);
      }
    });

    return groupedTasks;
  }, [projectTasks]);

  const totalTasks = projectTasks.length;
  const completedTasks = tasksByStatus.Done.length;

  const selectedProject = projects.find(
    (project) =>
      String(project.id) ===
      String(selectedProjectId)
  );

  return (
    <section className="kanban-page">

      {/* HEADER */}
      <div className="kanban-header">

        <div className="kanban-title-area">
          <span className="kanban-label">
            KANBAN BOARD
          </span>

          <h1>Task Board</h1>

          <p>
            Manage and track your project tasks
            across different stages.
          </p>
        </div>

        {/* PROJECT SELECTOR */}
        <div className="project-selector">

          <label htmlFor="kanban-project-select">
            Project
          </label>

          <select
            id="kanban-project-select"
            value={selectedProjectId || ""}
            onChange={(event) =>
              selectProject(event.target.value)
            }
          >
            {projects.length === 0 ? (
              <option value="">
                No projects available
              </option>
            ) : (
              projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))
            )}
          </select>

        </div>
      </div>

      {/* PROJECT NAME */}
      {selectedProject && (
        <div className="selected-project">
          <span className="project-dot"></span>
          <span>{selectedProject.name}</span>
        </div>
      )}

      {/* SUMMARY */}
      <div className="kanban-summary">

        <div className="summary-card">
          <div className="summary-icon total">
            T
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon todo">
            T
          </div>

          <div>
            <span>To Do</span>
            <strong>
              {tasksByStatus["To Do"].length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon progress">
            P
          </div>

          <div>
            <span>In Progress</span>
            <strong>
              {tasksByStatus["In Progress"].length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon done">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedTasks}</strong>
          </div>
        </div>

      </div>

      {/* BOARD */}
      <div className="kanban-board">

        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            draggedTaskId={draggedTaskId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

      </div>

    </section>
  );
}

export default KanbanBoard;