import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UsersContext = createContext(null);

const API_BASE = "http://localhost:8080/api/users";

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_BASE);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (updatedUser) => {
    try {
      const response = await axios.put(`${API_BASE}/${updatedUser.id}`, {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? response.data : u))
      );
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update user.";
      return { success: false, message };
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete user.";
      return { success: false, message };
    }
  };

  return (
    <UsersContext.Provider value={{ users, loading, updateUser, deleteUser, refetchUsers: fetchUsers }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);