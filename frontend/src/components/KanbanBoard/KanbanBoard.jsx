import { useEffect, useState } from "react";
import axios from "axios";
import KanbanColumn from "./KanbanColumn";

const API_BASE = "http://localhost:8080/api";

const EMPTY_COLUMNS = [
  { status: "TODO", title: "To Do", cards: [] },
  { status: "IN_PROGRESS", title: "In Progress", cards: [] },
  { status: "IN_REVIEW", title: "In Review", cards: [] },
  { status: "DONE", title: "Done", cards: [] },
];

function KanbanBoard({ projects = [] }) {
  const [projectId, setProjectId] = useState("");
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [sprintForm, setSprintForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });
  const [creatingSprint, setCreatingSprint] = useState(false);

  const activeProjectId = projectId || (projects[0] ? String(projects[0].id) : "");

  useEffect(() => {
    if (!activeProjectId) {
      return undefined;
    }

    let cancelled = false;
    const loadBoard = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE}/projects/${activeProjectId}/board`);
        if (!cancelled) setBoard(response.data);
      } catch (requestError) {
        if (cancelled) return;
        setBoard(null);
        setError(
          requestError.response?.status === 404
            ? "This project has no active sprint yet. Activate a sprint to open its board."
            : requestError.response?.data?.message || requestError.response?.data?.detail || "Unable to load the project board."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [activeProjectId]);

  const refreshBoard = async () => {
    if (!activeProjectId) return;
    const response = await axios.get(`${API_BASE}/projects/${activeProjectId}/board`);
    setBoard(response.data);
  };

  const createAndActivateSprint = async (event) => {
    event.preventDefault();
    if (!activeProjectId || !sprintForm.name.trim()) return;
    if (sprintForm.startDate && sprintForm.endDate && sprintForm.endDate < sprintForm.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    setCreatingSprint(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE}/projects/${activeProjectId}/sprints`, {
        ...sprintForm,
        name: sprintForm.name.trim(),
        startDate: sprintForm.startDate || null,
        endDate: sprintForm.endDate || null,
      });
      await axios.patch(`${API_BASE}/sprints/${response.data.id}/activate`);
      setSprintForm({ name: "", goal: "", startDate: "", endDate: "" });
      await refreshBoard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.detail || "Unable to create and activate the sprint.");
    } finally {
      setCreatingSprint(false);
    }
  };

  const handleDragStart = (event, task) => {
    setDraggedTaskId(String(task.id));
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.setData("taskId", String(task.id));
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();
    event.stopPropagation();
    const taskId =
      event.dataTransfer.getData("text/plain") ||
      event.dataTransfer.getData("taskId") ||
      draggedTaskId;
    const task = (board?.columns || EMPTY_COLUMNS)
      .flatMap((column) => column.cards)
      .find((card) => String(card.id) === String(taskId));
    setDraggedTaskId(null);

    const sourceStatus = String(task?.boardStatus || "").toUpperCase();
    const targetStatus = String(newStatus || "").toUpperCase();
    if (!task || !taskId || sourceStatus === targetStatus) return;

    const previousBoard = board;
    const columns = (board?.columns || EMPTY_COLUMNS).map((column) => ({
      ...column,
      cards: [...column.cards],
    }));
    const source = columns.find(
      (column) => String(column.status).toUpperCase() === sourceStatus
    );
    const destination = columns.find(
      (column) => String(column.status).toUpperCase() === targetStatus
    );
    if (!source || !destination) return;

    source.cards = source.cards.filter((card) => String(card.id) !== String(taskId));
    destination.cards = [
      ...destination.cards,
      { ...task, boardStatus: targetStatus, position: destination.cards.length },
    ];
    setBoard({ ...board, columns });
    setError("");

    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/board`, {
        boardStatus: targetStatus,
        position: destination.cards.length - 1,
      });
      await refreshBoard();
    } catch (requestError) {
      setBoard(previousBoard);
      setError(
        requestError.response?.data?.message ||
        requestError.response?.data?.detail ||
        requestError.response?.data?.error ||
        "The task could not be moved."
      );
    }
  };

  if (projects.length === 0) {
    return <section className="kanban-board-section"><p>Create a project to use sprint management.</p></section>;
  }

  const columns = board?.columns || EMPTY_COLUMNS;
  const metrics = board?.metrics;

  return (
    <section className="kanban-board-section">
      <div className="kanban-header">
        <div>
          <span className="section-label">SPRINT MANAGEMENT</span>
          <div className="kanban-project-picker">
            <label htmlFor="kanban-project">Project</label>
            <select id="kanban-project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </div>
          <h2>{board?.name || "Active sprint board"}</h2>
          <p>{board?.goal || "Select a project with an active sprint."}</p>
        </div>
        {board && <div className="sprint-status"><span className="status-dot"></span>{board.status}</div>}
      </div>

      {!board && !loading && (
        <form className="sprint-setup" onSubmit={createAndActivateSprint}>
          <div>
            <h3>Create an active sprint</h3>
            <p>New tasks can be added to this project sprint after it is activated.</p>
          </div>
          <div className="sprint-setup-grid">
            <input
              aria-label="Sprint name"
              placeholder="Sprint name"
              value={sprintForm.name}
              onChange={(event) => setSprintForm({ ...sprintForm, name: event.target.value })}
              required
            />
            <input
              aria-label="Sprint goal"
              placeholder="Sprint goal"
              value={sprintForm.goal}
              onChange={(event) => setSprintForm({ ...sprintForm, goal: event.target.value })}
            />
            <input
              aria-label="Start date"
              type="date"
              value={sprintForm.startDate}
              onChange={(event) => setSprintForm({ ...sprintForm, startDate: event.target.value })}
            />
            <input
              aria-label="End date"
              type="date"
              value={sprintForm.endDate}
              onChange={(event) => setSprintForm({ ...sprintForm, endDate: event.target.value })}
            />
            <button type="submit" disabled={creatingSprint}>
              {creatingSprint ? "Creating..." : "Create & Activate"}
            </button>
          </div>
        </form>
      )}

      {metrics && (
        <div className="sprint-summary">
          <div className="summary-card"><span>Total Tasks</span><strong>{metrics.totalTasks}</strong></div>
          <div className="summary-card"><span>Completed</span><strong>{metrics.completedTasks}</strong></div>
        </div>
      )}

      {loading && <p className="kanban-message">Loading the project board...</p>}
      {error && <p className="kanban-error">{error}</p>}

      {board && !loading && (
        <div className="kanban-board">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              column={{ id: column.status, title: column.title }}
              tasks={column.cards}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default KanbanBoard;
