import React from "react";
import "./Kanban.css";

function KanbanCard({ task, onDragStart }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(event) => onDragStart(event, task)}
    >
      <div className="task-card-top">
        <span className="task-id">{task.id}</span>

        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
      </div>

      <h4>{task.title}</h4>

      <p className="task-description">{task.description}</p>

      <div className="task-info">
        <span>👤 {task.assignee}</span>
        <span>⭐ {task.storyPoints} pts</span>
      </div>

      {task.blocked && (
        <div className="blocked-badge">
          ⚠ Blocked
        </div>
      )}

      {task.dependency && (
        <div className="dependency">
          🔗 Depends on {task.dependency}
        </div>
      )}

      <div className="task-footer">
        <span>{task.sprint}</span>
        <span>Due: {task.dueDate}</span>
      </div>
    </div>
  );
}

export default KanbanCard;