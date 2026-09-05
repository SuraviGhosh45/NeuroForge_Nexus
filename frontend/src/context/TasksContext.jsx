import { createContext, useState, useContext } from "react";

const TasksContext = createContext(null);

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updatedTasks) => {
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  // Create a new task
  const createTask = (newTask) => {
    const newTasks = [
      ...tasks,
      {
        id: Date.now(),
        subtasks: [],
        comments: [],
        activity: [],
        ...newTask,
      },
    ];

    persist(newTasks);
  };

  // Update an existing task
  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map((task) =>
      String(task.id) === String(updatedTask.id)
        ? updatedTask
        : task
    );

    persist(updatedTasks);
  };

  // Delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(
      (task) => String(task.id) !== String(taskId)
    );

    persist(updatedTasks);
  };

  // Add a new subtask
  const addSubtask = (taskId, title) => {
    const updatedTasks = tasks.map((task) =>
      String(task.id) === String(taskId)
        ? {
            ...task,
            subtasks: [
              ...(task.subtasks || []),
              {
                id: Date.now(),
                title,
                status: "To Do",
              },
            ],
          }
        : task
    );

    persist(updatedTasks);
  };

  // Update an existing subtask
  const updateSubtask = (
    taskId,
    subtaskId,
    updatedSubtask
  ) => {
    const updatedTasks = tasks.map((task) =>
      String(task.id) === String(taskId)
        ? {
            ...task,
            subtasks: (task.subtasks || []).map((subtask) =>
              String(subtask.id) === String(subtaskId)
                ? {
                    ...subtask,
                    ...updatedSubtask,
                  }
                : subtask
            ),
          }
        : task
    );

    persist(updatedTasks);
  };

  // Update subtask status and automatically update parent task status
  const updateSubtaskStatus = (
    taskId,
    subtaskId,
    status
  ) => {
    const updatedTasks = tasks.map((task) => {
      if (String(task.id) !== String(taskId)) {
        return task;
      }

      const updatedSubtasks = (task.subtasks || []).map(
        (subtask) =>
          String(subtask.id) === String(subtaskId)
            ? {
                ...subtask,
                status,
              }
            : subtask
      );

      let taskStatus = task.status;

      if (updatedSubtasks.length > 0) {
        const allDone = updatedSubtasks.every(
          (subtask) => subtask.status === "Done"
        );

        const anyInProgress = updatedSubtasks.some(
          (subtask) => subtask.status === "In Progress"
        );

        if (allDone) {
          taskStatus = "Done";
        } else if (anyInProgress) {
          taskStatus = "In Progress";
        } else {
          taskStatus = "To Do";
        }
      }

      return {
        ...task,
        status: taskStatus,
        subtasks: updatedSubtasks,
      };
    });

    persist(updatedTasks);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        createTask,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        updateSubtaskStatus,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);