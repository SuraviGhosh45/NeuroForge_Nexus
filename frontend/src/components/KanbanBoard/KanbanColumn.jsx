import React from "react";
import KanbanCard from "./KanbanCard";
import "./Kanban.css";

function KanbanColumn({
  column,
  tasks,
  onDragStart,
  onDrop,
  onDragOver,
}) {
  return (
    <div
      className="kanban-column"
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, column.id)}
    >
      <div className="column-header">
        <div>
          <h3>{column.title}</h3>
          <span>{tasks.length} tasks</span>
        </div>

        <span className="column-count">
          {tasks.length}
        </span>
      </div>

      <div className="column-content">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="empty-column">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;