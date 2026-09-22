import "./Kanban.css";

function KanbanCard({ task, onDragStart, onDragEnd, isDragging }) {
  const priority = task.priority || "Medium";

  return (
    <div
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <span className="task-id">#{task.id}</span>

        <span className={`priority ${priority.toLowerCase()}`}>
          {priority}
        </span>
      </div>

      <h4>{task.title}</h4>

      {task.description && (
        <p className="task-description">
          {task.description}
        </p>
      )}

      <div className="task-info">
        <span>
          👤 {task.assignee?.fullName || "Unassigned"}
        </span>
      </div>

      <div className="task-footer">
        <span>{task.status || "To Do"}</span>

        <span>
          Due: {task.dueDate || "Not set"}
        </span>
      </div>
    </div>
  );
}

export default KanbanCard;