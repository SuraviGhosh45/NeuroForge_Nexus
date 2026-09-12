import React, { useState } from "react";
import KanbanColumn from "./KanbanColumn";

const COLUMNS = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in-progress",
    title: "In Progress",
  },
  {
    id: "in-review",
    title: "In Review",
  },
  {
    id: "done",
    title: "Done",
  },
];

const INITIAL_TASKS = [
  {
    id: "PAY-124",
    title: "Payment API Integration",
    description: "Integrate payment service with the application.",
    priority: "High",
    assignee: "Rahul",
    storyPoints: 8,
    sprint: "Sprint 12",
    dueDate: "18 Jun",
    status: "todo",
    blocked: false,
    dependency: null,
  },

  {
    id: "PAY-125",
    title: "Payment Validation",
    description: "Add validation for payment requests.",
    priority: "Medium",
    assignee: "Priya",
    storyPoints: 5,
    sprint: "Sprint 12",
    dueDate: "19 Jun",
    status: "todo",
    blocked: false,
    dependency: "PAY-124",
  },

  {
    id: "PAY-126",
    title: "Transaction Service",
    description: "Develop transaction processing service.",
    priority: "High",
    assignee: "Aman",
    storyPoints: 8,
    sprint: "Sprint 12",
    dueDate: "20 Jun",
    status: "in-progress",
    blocked: true,
    dependency: "PAY-124",
  },

  {
    id: "PAY-127",
    title: "Payment Database",
    description: "Create database tables for payment transactions.",
    priority: "Medium",
    assignee: "Neha",
    storyPoints: 5,
    sprint: "Sprint 12",
    dueDate: "17 Jun",
    status: "in-progress",
    blocked: false,
    dependency: null,
  },

  {
    id: "PAY-128",
    title: "Payment Unit Tests",
    description: "Write unit tests for payment services.",
    priority: "Low",
    assignee: "Rohit",
    storyPoints: 3,
    sprint: "Sprint 12",
    dueDate: "21 Jun",
    status: "in-review",
    blocked: false,
    dependency: "PAY-126",
  },

  {
    id: "PAY-129",
    title: "Payment UI",
    description: "Complete payment screen and user interactions.",
    priority: "Medium",
    assignee: "Anjali",
    storyPoints: 5,
    sprint: "Sprint 12",
    dueDate: "16 Jun",
    status: "done",
    blocked: false,
    dependency: null,
  },
];

function KanbanBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (event, task) => {
    setDraggedTask(task);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", task.id);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, newStatus) => {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("taskId");

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );

    setDraggedTask(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const totalTasks = tasks.length;

  const completedTasks = getTasksByStatus("done").length;

  const totalStoryPoints = tasks.reduce(
    (total, task) => total + task.storyPoints,
    0
  );

  const completedStoryPoints = tasks
    .filter((task) => task.status === "done")
    .reduce((total, task) => total + task.storyPoints, 0);

  return (
    <section className="kanban-board-section">

      <div className="kanban-header">

        <div>
          <span className="section-label">
            SPRINT MANAGEMENT
          </span>

          <h2>Sprint 12</h2>

          <p>
            Goal: Payment Service
          </p>
        </div>

        <div className="sprint-status">
          <span className="status-dot"></span>
          Active Sprint
        </div>

      </div>


      <div className="sprint-summary">

        <div className="summary-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </div>

        <div className="summary-card">
          <span>Story Points</span>
          <strong>{totalStoryPoints}</strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </div>

        <div className="summary-card">
          <span>Completed Points</span>
          <strong>{completedStoryPoints}</strong>
        </div>

        <div className="summary-card">
          <span>Velocity</span>
          <strong>67</strong>
        </div>

        <div className="summary-card">
          <span>Burndown</span>
          <strong>67 / 80</strong>
        </div>

      </div>


      <div className="kanban-board">

        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}

      </div>

    </section>
  );
}

export default KanbanBoard;