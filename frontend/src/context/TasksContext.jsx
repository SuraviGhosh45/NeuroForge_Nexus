import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const TasksContext = createContext(null);

const API_BASE = "http://localhost:8080/api/tasks";

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_BASE);
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const buildPayload = (formData) => ({
    title: formData.title,
    description: formData.description || "",
    projectId: formData.projectId ? Number(formData.projectId) : null,
    assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
    status: formData.status,
    priority: formData.priority,
    dueDate: formData.dueDate || null,
  });

  const createTask = async (formData) => {
    try {
      const response = await axios.post(API_BASE, buildPayload(formData));
      setTasks((prev) => [...prev, response.data]);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create task.";
      return { success: false, message };
    }
  };

  const updateTask = async (formData) => {
    try {
      const response = await axios.put(`${API_BASE}/${formData.id}`, buildPayload(formData));
      setTasks((prev) =>
        prev.map((task) => (task.id === formData.id ? response.data : task))
      );
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update task.";
      return { success: false, message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete task.";
      return { success: false, message };
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);