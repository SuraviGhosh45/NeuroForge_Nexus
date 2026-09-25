import React from "react";

function KanbanCard({
  task,
  draggedTaskId,
  onDragStart,
  onDragEnd,
}) {
  const priority =
    task.priority || "Medium";

  const priorityClass =
    String(priority).toLowerCase();

  const taskTitle =
    task.title ||
    task.name ||
    "Untitled Task";

  const description =
    task.description ||
    "No description provided.";

  const assignee =
    task.assigneeName ||
    task.assignee?.name ||
    task.assignee?.fullName ||
    "Unassigned";

  const dueDate =
    task.dueDate ||
    task.endDate ||
    null;

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not set";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <article
      className={`kanban-card ${
        String(draggedTaskId) ===
        String(task.id)
          ? "is-dragging"
          : ""
      }`}
      draggable
      onDragStart={(event) =>
        onDragStart(event, task)
      }
      onDragEnd={onDragEnd}
    >

      {/* CARD TOP */}
      <div className="card-top">

        <span className="task-id">
          #{task.id}
        </span>

        <span
          className={`priority-badge ${priorityClass}`}
        >
          {priority}
        </span>

      </div>

      {/* TITLE */}
      <h4 className="task-title">
        {taskTitle}
      </h4>

      {/* DESCRIPTION */}
      <p className="task-description">
        {description}
      </p>

      {/* ASSIGNEE */}
      <div className="task-assignee">

        <div className="assignee-avatar">
          {String(assignee)
            .charAt(0)
            .toUpperCase()}
        </div>

        <span>{assignee}</span>

      </div>

      {/* CARD FOOTER */}
      <div className="task-card-footer">

        <span className="task-status">
          {task.status || "To Do"}
        </span>

        <span className="task-due-date">
          Due: {formatDate(dueDate)}
        </span>

      </div>

    </article>
  );
}

export default KanbanCard;