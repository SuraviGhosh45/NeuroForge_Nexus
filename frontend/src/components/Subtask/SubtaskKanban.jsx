import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    PiArrowLeft,
    PiCalendarBlank,
    PiUserCircle,
    PiLockKey,
} from "react-icons/pi";

import { useTasks } from "../../context/TasksContext.jsx";
import { useUsers } from "../../context/UsersContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProjects } from "../../context/ProjectContext.jsx";
import { useProjectTeam } from "../../context/ProjectTeamContext.jsx";
import { useTeams } from "../../context/TeamsContext.jsx";
import { canMoveSubtaskKanban } from "../../utils/access.js";

const COLUMNS = [
    {
        id: "To Do",
        title: "To Do",
        color: "text-slate-300",
        dot: "bg-slate-400",
    },
    {
        id: "In Progress",
        title: "In Progress",
        color: "text-blue-400",
        dot: "bg-blue-400",
    },
    {
        id: "Done",
        title: "Done",
        color: "text-emerald-400",
        dot: "bg-emerald-400",
    },
];

const priorityColor = {
    Critical:
        "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

    High:
        "text-[#f0a0a0] border-[#f0a0a0]/30 bg-[#f0a0a0]/5",

    Medium:
        "text-[#f0d090] border-[#f0d090]/30 bg-[#f0d090]/5",

    Low:
        "text-[#a0d0a0] border-[#a0d0a0]/30 bg-[#a0d0a0]/5",
};

const SubtaskKanban = () => {
    const {
        projectId,
        taskId,
        subtaskId,
    } = useParams();

    const navigate = useNavigate();

    const {
        getTaskById,
        getSubtasksByTaskId,
        updateSubtask,
    } = useTasks();

    const { users } = useUsers();
    const { currentUser } = useAuth();
    const { getProjectById } = useProjects();
    const { projectTeams = {} } = useProjectTeam();
    const { teams = [] } = useTeams();

    const project = getProjectById(projectId);

    const [draggedSubtaskId, setDraggedSubtaskId] =
        useState(null);

    const [dragOverColumn, setDragOverColumn] =
        useState(null);

    const [isUpdating, setIsUpdating] =
        useState(false);

    // --------------------------------------------------
    // ROUTE VALIDATION
    // --------------------------------------------------

    if (!projectId || !taskId || !subtaskId) {
        return (
            <div className="min-h-full bg-[#07111f] p-6 text-[#e8eef8]">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">
                        <p className="text-lg font-semibold">
                            Invalid subtask URL
                        </p>

                        <p className="mt-2 text-sm text-[#e8eef8]/50">
                            Project, task, or subtask information is
                            missing from the URL.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/tasks")
                            }
                            className="mt-6 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
                        >
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // PARENT TASK
    // --------------------------------------------------

    const parentTask = useMemo(() => {
        return getTaskById(taskId);
    }, [getTaskById, taskId]);

    // --------------------------------------------------
    // SUBTASKS
    // --------------------------------------------------

    const subtasks = useMemo(() => {
        return getSubtasksByTaskId(taskId);
    }, [getSubtasksByTaskId, taskId]);

    // --------------------------------------------------
    // GET ASSIGNEE
    // --------------------------------------------------

    const getAssignee = (assigneeId) => {
        return users.find(
            (user) =>
                String(user.id) ===
                String(assigneeId)
        );
    };

    // --------------------------------------------------
    // DRAG START
    // --------------------------------------------------

    const handleDragStart = (
        event,
        subtask
    ) => {
        const canMove = canMoveSubtaskKanban(
            currentUser,
            subtask,
            parentTask,
            project,
            projectTeams,
            teams
        );

        if (!canMove) {
            event.preventDefault();
            return;
        }

        setDraggedSubtaskId(subtask.id);

        event.dataTransfer.effectAllowed =
            "move";

        event.dataTransfer.setData(
            "text/plain",
            String(subtask.id)
        );
    };

    // --------------------------------------------------
    // DRAG END
    // --------------------------------------------------

    const handleDragEnd = () => {
        setDraggedSubtaskId(null);
        setDragOverColumn(null);
    };

    // --------------------------------------------------
    // DRAG OVER COLUMN
    // --------------------------------------------------

    const handleDragOver = (
        event,
        columnId
    ) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        setDragOverColumn(columnId);
    };

    // --------------------------------------------------
    // DRAG LEAVE COLUMN
    // --------------------------------------------------

    const handleDragLeave = (
        event,
        columnId
    ) => {
        const currentTarget =
            event.currentTarget;

        const relatedTarget =
            event.relatedTarget;

        if (
            relatedTarget &&
            currentTarget.contains(
                relatedTarget
            )
        ) {
            return;
        }

        if (
            dragOverColumn === columnId
        ) {
            setDragOverColumn(null);
        }
    };

    // --------------------------------------------------
    // DROP SUBTASK
    // --------------------------------------------------

    const handleDrop = async (
        event,
        newStatus
    ) => {
        event.preventDefault();

        const draggedId =
            event.dataTransfer.getData(
                "text/plain"
            ) || draggedSubtaskId;

        setDragOverColumn(null);

        if (!draggedId) {
            setDraggedSubtaskId(null);
            return;
        }

        const draggedSubtask =
            subtasks.find(
                (subtask) =>
                    String(subtask.id) ===
                    String(draggedId)
            );

        if (!draggedSubtask) {
            setDraggedSubtaskId(null);
            return;
        }

        const canMove = canMoveSubtaskKanban(
            currentUser,
            draggedSubtask,
            parentTask,
            project,
            projectTeams,
            teams
        );

        if (!canMove) {
            setDraggedSubtaskId(null);
            return;
        }

        /*
         * Nothing to update if the card is dropped
         * into its existing column.
         */
        if (
            (draggedSubtask.status ||
                "To Do") ===
            newStatus
        ) {
            setDraggedSubtaskId(null);
            return;
        }

        setIsUpdating(true);

        const result =
            await updateSubtask(
                taskId,
                {
                    ...draggedSubtask,
                    status: newStatus,
                }
            );

        setIsUpdating(false);
        setDraggedSubtaskId(null);

        if (!result.success) {
            alert(result.message);
        }
    };

    // --------------------------------------------------
    // OPEN SUBTASK
    // --------------------------------------------------

    const handleOpenSubtask = (
        subtask
    ) => {
        navigate(
            `/projects/${projectId}/tasks/${taskId}/${subtask.id}`
        );
    };

    // --------------------------------------------------
    // PARENT TASK NOT FOUND
    // --------------------------------------------------

    if (!parentTask) {
        return (
            <div className="min-h-full bg-[#07111f] p-6 text-[#e8eef8]">
                <div className="mx-auto max-w-7xl">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/projects/${projectId}/tasks/${taskId}`
                            )
                        }
                        className="mb-6 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
                    >
                        <PiArrowLeft />
                        Back to Task
                    </button>

                    <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-10 text-center">

                        <p className="text-lg font-semibold">
                            Task not found
                        </p>

                        <p className="mt-2 text-sm text-[#e8eef8]/50">
                            This task may have been deleted or
                            does not exist.
                        </p>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#07111f] px-4 py-6 text-[#e8eef8] sm:px-6 lg:px-8">

            <div className="mx-auto max-w-[1600px]">

                {/* BACK TO SUB TASK DETAILS */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/projects/${projectId}/tasks/${taskId}/${subtaskId}`
                        )
                    }
                    className="mb-5 inline-flex items-center gap-2 text-sm text-[#e8eef8]/50 transition hover:text-[#e8eef8]"
                >
                    <PiArrowLeft />
                    Back to Sub Task
                </button>

                {/* HEADER */}

                <div className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b]">

                    <div className="border-b border-[#e8eef8]/10 p-6">

                        <div>

                            <div className="flex flex-wrap items-center gap-3">

                                <span className="rounded-lg border border-[#e8eef8]/10 bg-[#e8eef8]/5 px-3 py-1 text-xs text-[#e8eef8]/50">
                                    TASK-{parentTask.id}
                                </span>

                                <span className="text-sm text-[#e8eef8]/40">
                                    Subtask Kanban
                                </span>

                            </div>

                            <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                                {parentTask.title}
                            </h1>

                            <p className="mt-2 text-sm text-[#e8eef8]/50">
                                Drag and drop subtasks between
                                columns to update their status.
                            </p>

                        </div>

                    </div>

                    {/* SUBTASK NAVIGATION */}

                    <div className="overflow-x-auto p-2">

                        <div className="flex min-w-max gap-1">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/projects/${projectId}/tasks/${taskId}/${subtaskId}`
                                    )
                                }
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#e8eef8]/50 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                            >
                                Sub Task Details
                            </button>

                            <button
                                type="button"
                                className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white"
                            >
                                Kanban
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/projects/${projectId}/tasks/${taskId}/${subtaskId}/calendar`
                                    )
                                }
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#e8eef8]/50 transition hover:bg-[#e8eef8]/5 hover:text-[#e8eef8]"
                            >
                                Calendar
                            </button>

                        </div>

                    </div>
                </div>

                {/* SUMMARY */}

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {COLUMNS.map(
                        (column) => {

                            const count =
                                subtasks.filter(
                                    (subtask) =>
                                        (
                                            subtask.status ||
                                            "To Do"
                                        ) ===
                                        column.id
                                ).length;

                            return (
                                <div
                                    key={
                                        column.id
                                    }
                                    className="rounded-2xl border border-[#e8eef8]/10 bg-[#0d1a2b] p-5"
                                >

                                    <div className="flex items-center justify-between">

                                        <p className="text-sm text-[#e8eef8]/50">
                                            {column.title}
                                        </p>

                                        <span
                                            className={`text-sm font-semibold ${column.color}`}
                                        >
                                            {count}
                                        </span>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>

                {/* KANBAN BOARD */}

                <div className="mt-6 overflow-x-auto">

                    <div className="grid min-w-[1000px] grid-cols-3 gap-5">

                        {COLUMNS.map(
                            (column) => {

                                const columnSubtasks =
                                    subtasks.filter(
                                        (subtask) =>
                                            (
                                                subtask.status ||
                                                "To Do"
                                            ) ===
                                            column.id
                                    );

                                const isDropTarget =
                                    dragOverColumn ===
                                    column.id;

                                return (
                                    <div
                                        key={
                                            column.id
                                        }
                                        onDragOver={(
                                            event
                                        ) =>
                                            handleDragOver(
                                                event,
                                                column.id
                                            )
                                        }
                                        onDragLeave={(
                                            event
                                        ) =>
                                            handleDragLeave(
                                                event,
                                                column.id
                                            )
                                        }
                                        onDrop={(
                                            event
                                        ) =>
                                            handleDrop(
                                                event,
                                                column.id
                                            )
                                        }
                                        className={`min-h-[500px] rounded-2xl border bg-[#0d1a2b] transition-all duration-200 ${
                                            isDropTarget
                                                ? "border-blue-400/50 bg-blue-400/5 shadow-[0_0_0_1px_rgba(96,165,250,0.15)]"
                                                : "border-[#e8eef8]/10"
                                        }`}
                                    >

                                        {/* COLUMN HEADER */}

                                        <div className="flex items-center justify-between border-b border-[#e8eef8]/10 p-5">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
                                                />

                                                <h2 className="text-sm font-semibold">
                                                    {column.title}
                                                </h2>

                                            </div>

                                            <span className="rounded-full bg-[#e8eef8]/5 px-2.5 py-1 text-xs text-[#e8eef8]/50">
                                                {
                                                    columnSubtasks.length
                                                }
                                            </span>

                                        </div>

                                        {/* DROP AREA */}

                                        <div className="space-y-3 p-4">

                                            {columnSubtasks.length ===
                                            0 ? (
                                                <div
                                                    className={`flex min-h-[220px] items-center justify-center rounded-xl border border-dashed transition ${
                                                        isDropTarget
                                                            ? "border-blue-400/40 bg-blue-400/5"
                                                            : "border-[#e8eef8]/10"
                                                    }`}
                                                >

                                                    <div className="text-center">

                                                        <p className="text-sm text-[#e8eef8]/30">
                                                            {
                                                                isDropTarget
                                                                    ? "Drop subtask here"
                                                                    : "No subtasks"
                                                            }
                                                        </p>

                                                        {!isDropTarget && (
                                                            <p className="mt-1 text-xs text-[#e8eef8]/20">
                                                                Drag a card here
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>
                                            ) : (
                                                columnSubtasks.map(
                                                    (
                                                        subtask
                                                    ) => {

                                                        const assignee =
                                                            getAssignee(
                                                                subtask.assigneeId
                                                            );

                                                        const priorityStyles =
                                                            priorityColor[
                                                                subtask.priority
                                                            ] ||
                                                            "";

                                                        const isDragging =
                                                            String(
                                                                draggedSubtaskId
                                                            ) ===
                                                            String(
                                                                subtask.id
                                                            );

                                                        const canDrag = !isUpdating && canMoveSubtaskKanban(
                                                            currentUser,
                                                            subtask,
                                                            parentTask,
                                                            project,
                                                            projectTeams,
                                                            teams
                                                        );

                                                        return (
                                                            <div
                                                                key={
                                                                    subtask.id
                                                                }
                                                                draggable={
                                                                    canDrag
                                                                }
                                                                onDragStart={(
                                                                    event
                                                                ) =>
                                                                    handleDragStart(
                                                                        event,
                                                                        subtask
                                                                    )
                                                                }
                                                                onDragEnd={
                                                                    handleDragEnd
                                                                }
                                                                className={`rounded-xl border bg-[#07111f] p-4 transition-all duration-200 ${
                                                                    canDrag
                                                                        ? "cursor-grab active:cursor-grabbing hover:border-[#e8eef8]/20 hover:bg-[#0a1625]"
                                                                        : "cursor-default opacity-85 hover:border-[#e8eef8]/15"
                                                                } ${
                                                                    isDragging
                                                                        ? "scale-[0.98] border-blue-400/40 opacity-40"
                                                                        : "border-[#e8eef8]/10"
                                                                }`}
                                                            >

                                                                {/* DRAG INDICATOR */}

                                                                <div className="mb-3 flex items-center justify-between">

                                                                    <span className="text-[10px] uppercase tracking-wider text-[#e8eef8]/30 flex items-center gap-1">
                                                                        {canDrag ? (
                                                                            "Drag to move"
                                                                        ) : (
                                                                            <>
                                                                                <PiLockKey size={12} className="text-amber-400" />
                                                                                <span>Locked</span>
                                                                            </>
                                                                        )}
                                                                    </span>

                                                                    <span className="text-[10px] text-[#e8eef8]/20">
                                                                        {
                                                                            subtask.id
                                                                        }
                                                                    </span>

                                                                </div>

                                                                {/* TITLE */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenSubtask(
                                                                            subtask
                                                                        )
                                                                    }
                                                                    className="w-full text-left text-sm font-semibold transition hover:text-blue-400"
                                                                >
                                                                    {
                                                                        subtask.title
                                                                    }
                                                                </button>

                                                                {/* DESCRIPTION */}

                                                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#e8eef8]/40">
                                                                    {
                                                                        subtask.description ||
                                                                        "No description has been added."
                                                                    }
                                                                </p>

                                                                {/* PRIORITY */}

                                                                <div className="mt-4">

                                                                    <span
                                                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${priorityStyles}`}
                                                                    >
                                                                        {
                                                                            subtask.priority ||
                                                                            "Medium"
                                                                        }
                                                                    </span>

                                                                </div>

                                                                {/* ASSIGNEE / DATE */}

                                                                <div className="mt-4 space-y-2">

                                                                    <div className="flex items-center gap-2 text-xs text-[#e8eef8]/40">

                                                                        <PiUserCircle />

                                                                        <span className="truncate">
                                                                            {
                                                                                assignee?.fullName ||
                                                                                assignee?.name ||
                                                                                assignee?.username ||
                                                                                "Unassigned"
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-xs text-[#e8eef8]/40">

                                                                        <PiCalendarBlank />

                                                                        <span>
                                                                            {
                                                                                subtask.dueDate ||
                                                                                "No due date"
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )
                                            )}

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                {/* DRAGGING STATUS */}

                {draggedSubtaskId && (
                    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-blue-400/20 bg-[#0d1a2b] px-4 py-2 text-xs text-blue-400 shadow-xl">
                        Dragging subtask — drop it into a
                        column
                    </div>
                )}

            </div>
        </div>
    );
};

export default SubtaskKanban;