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
      return "min-h-[420px] rounded-xl border border-slate-300 bg-[#F1F5F9] p-3 shadow-sm";
    }

    if (column.id === "In Progress") {
      return "min-h-[420px] rounded-xl border border-slate-300 bg-[#F1F5F9] p-3 shadow-sm";
    }

    return "min-h-[420px] rounded-xl border border-slate-300 bg-[#F1F5F9] p-3 shadow-sm";
  };

  return (
    <div
      className={getColumnClass()}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, column.id)}
    >
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              column.id === "To Do"
                ? "bg-blue-500"
                : column.id === "In Progress"
                ? "bg-indigo-500"
                : "bg-green-500"
            }`}
          ></span>

          <h3 className="text-sm font-semibold text-[#172033]">
            {column.title}
          </h3>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#475569] shadow-sm ring-1 ring-slate-200">
          {tasks.length}
        </span>
      </div>

      <div className="my-2 border-b border-slate-300"></div>

      <div className="flex min-h-[350px] flex-col gap-3">
        {tasks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EEF7] text-xl font-medium text-[#64748B]">
              +
            </div>

            <span className="text-sm font-medium text-[#64748B]">
              Drop tasks here
            </span>
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