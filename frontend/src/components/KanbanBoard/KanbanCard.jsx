import "./Kanban.css";

function KanbanCard({ task, onDragStart, onDragEnd }) {
  const priority = task.priority || "Medium";

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-top">
        <span className="task-id">{task.taskKey || task.id}</span>

        <span className={`priority ${priority.toLowerCase()}`}>
          {priority}
        </span>
      </div>

      <h4>{task.title}</h4>

      <p className="task-description">{task.description}</p>

      <div className="task-info">
        <span>👤 {task.assigneeName || "Unassigned"}</span>
      </div>

      {task.blocked && (
        <div className="blocked-badge">
          ⚠ Blocked
        </div>
      )}

      {task.dependsOn?.length > 0 && (
        <div className="dependency">
          🔗 Depends on {task.dependsOn.join(", ")}
        </div>
      )}

      <div className="task-footer">
        <span>{task.sprintName || "Backlog"}</span>
        <span>Due: {task.dueDate || "-"}</span>
      </div>
    </div>
  );
}

export default KanbanCard;