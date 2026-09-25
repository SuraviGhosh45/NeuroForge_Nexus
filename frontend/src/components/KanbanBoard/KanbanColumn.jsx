import React from "react";
import KanbanCard from "./KanbanCard.jsx";

function KanbanColumn({
  column,
  tasks,
  draggedTaskId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const getColumnClass = () => {
    if (column.id === "To Do") {
      return "kanban-column todo-column";
    }

    if (column.id === "In Progress") {
      return "kanban-column progress-column";
    }

    return "kanban-column done-column";
  };

  return (
    <div
      className={getColumnClass()}
      onDragOver={onDragOver}
      onDrop={(event) =>
        onDrop(event, column.id)
      }
    >

      <div className="column-header">

        <div className="column-title">

          <span className="column-status-dot"></span>

          <h3>{column.title}</h3>

        </div>

        <span className="task-count">
          {tasks.length}
        </span>

      </div>

      <div className="column-divider"></div>

      <div className="column-tasks">

        {tasks.length === 0 ? (
          <div className="empty-column">
            <div className="empty-icon">
              +
            </div>

            <span>Drop tasks here</span>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              draggedTaskId={draggedTaskId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}

      </div>

    </div>
  );
}

export default KanbanColumn;