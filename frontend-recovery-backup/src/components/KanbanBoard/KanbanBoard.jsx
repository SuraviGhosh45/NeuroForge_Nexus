import React, { useMemo, useState } from "react";
import KanbanColumn from "./KanbanColumn.jsx";
import { useTasks } from "../../context/TasksContext.jsx";

const COLUMNS = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Done", title: "Done" },
];

function KanbanBoard() {
  const { tasks, updateTask } = useTasks();

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

    // Do nothing if the task is dropped into the same column.
    if (task.status === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    const result = await updateTask({
      ...task,
      status: newStatus,
    });

    if (!result.success) {
      console.error(
        "Failed to update task status:",
        result.message
      );
    }

    setDraggedTaskId(null);
  };

  const tasksByStatus = useMemo(() => {
    const groupedTasks = {
      "To Do": [],
      "In Progress": [],
      "Done": [],
    };

    tasks.forEach((task) => {
      const status = task.status || "To Do";

      if (groupedTasks[status]) {
        groupedTasks[status].push(task);
      }
    });

    return groupedTasks;
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasksByStatus["Done"].length;

  return (
    <section className="kanban-board-section">
      <div className="kanban-header">
        <div>
          <span className="section-label">
            KANBAN BOARD
          </span>

          <h2>Task Board</h2>

          <p>
            Manage tasks by moving them between statuses.
          </p>
        </div>

        <div className="sprint-status">
          <span className="status-dot"></span>
          Active Board
        </div>
      </div>

      <div className="sprint-summary">
        <div className="summary-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="summary-card">
          <span>To Do</span>
          <strong>{tasksByStatus["To Do"].length}</strong>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <strong>{tasksByStatus["In Progress"].length}</strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </div>
      </div>

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