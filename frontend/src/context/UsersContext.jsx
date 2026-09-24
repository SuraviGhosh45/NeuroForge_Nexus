import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../services/api.js";

const UsersContext = createContext(null);

const API_BASE = "http://localhost:8080/api/users";
const USERS_STORAGE_KEY = "sdlc_users";

export const ROLE_DEFAULT_SKILLS = {
  admin: ["System Admin", "Access Control", "Security Compliance", "DevOps"],
  project_manager: ["Agile / Scrum", "Risk Management", "Resource Planning", "Stakeholder Mgmt"],
  project_lead: ["System Architecture", "Sprint Planning", "Technical Strategy", "Mentorship"],
  team_lead: ["Sprint Leadership", "Code Review", "Task Delegation", "Architecture"],
  developer: ["React", "Spring Boot", "REST APIs", "PostgreSQL", "Git"],
  tester: ["Test Automation", "Selenium", "Jest", "Manual Testing", "JIRA"],
  qa: ["Quality Assurance", "Cypress", "Performance Testing", "CI/CD", "API Testing"],
};

export const normalizeUserRole = (role) => {
  if (!role || typeof role !== "string") return "developer";
  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
};

export const normalizeUser = (user) => {
  const roleKey = normalizeUserRole(user.role);
  const defaultSkills =
    ROLE_DEFAULT_SKILLS[roleKey] || ROLE_DEFAULT_SKILLS.developer;

  const backendSkills =
    Array.isArray(user.skills) && user.skills.length > 0
      ? user.skills
      : null;

  return {
    ...user,
    id: user.id != null ? Number(user.id) : Date.now(),
    fullName: user.fullName || user.name || "User",
    name: user.fullName || user.name || "User",
    email: user.email || "",
    role: user.role || "developer",
    skills: backendSkills || defaultSkills,
    status: user.status || "Active",
  };
};


export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const saveToStorage = (updatedUsers) => {
    try {
      localStorage.setItem(
        USERS_STORAGE_KEY,
        JSON.stringify(updatedUsers)
      );
    } catch (e) {
      console.warn(
        "Failed to cache users in localStorage:",
        e
      );
    }
  };

  const getCurrentUserRole = () => {
    try {
      const storedUser =
        sessionStorage.getItem("auth_user") ||
        localStorage.getItem("auth_user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return user?.role
        ? String(user.role).toUpperCase()
        : null;
    } catch (e) {
      return null;
    }
  };

  const fetchUsers = async () => {
    const currentRole = getCurrentUserRole();
    setLoading(true);
    setError("");

    try {
      const response = currentRole === "ADMIN"
        ? await axios.get(API_BASE)
        : ["PROJECT_MANAGER", "PROJECT_LEAD", "TEAM_LEAD"].includes(currentRole)
          ? await axios.get(`${API_BASE}/options`)
          : { data: [] };

      const normalized = Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
      setUsers(normalized);
      if (currentRole === "ADMIN") saveToStorage(normalized);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (newUser) => {
    try {
      const response = await axios.post(API_BASE, {
        fullName: newUser.fullName || newUser.name,
        email: newUser.email,
        password: newUser.password || "TempPass@123",
        role: newUser.role,
        status: newUser.status || "Active",
      });
      const normalized = normalizeUser(response.data);
      setUsers((prev) => [normalized, ...prev]);
      return { success: true, data: normalized };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || "Failed to create user." };
    }
  };

  const updateUser = async (updatedUser, currentUserId) => {
    const existing = users.find((u) => String(u.id) === String(updatedUser.id));
    if (!existing) return { success: false, message: "User not found." };

    try {
      let response = await axios.put(`${API_BASE}/${updatedUser.id}`, {
        fullName: updatedUser.fullName || updatedUser.name,
        email: updatedUser.email,
      });
      if (updatedUser.role && String(updatedUser.role).toLowerCase() !== String(existing.role).toLowerCase()) {
        response = await axios.patch(`${API_BASE}/${updatedUser.id}/role`, { role: updatedUser.role });
      }
      if (updatedUser.status && updatedUser.status !== existing.status) {
        response = await axios.patch(`${API_BASE}/${updatedUser.id}/status`, { status: updatedUser.status });
      }
      const normalized = normalizeUser(response.data || { ...existing, ...updatedUser });
      setUsers((prev) => prev.map((u) => String(u.id) === String(normalized.id) ? normalized : u));
      return { success: true, data: normalized };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update user." };
    }
  };

  const updateUserStatus = async (targetUserId, newStatus, currentUserId) => {
    try {
      const response = await axios.patch(`${API_BASE}/${targetUserId}/status`, { status: newStatus });
      const normalized = normalizeUser(response.data);
      setUsers((prev) => prev.map((u) => String(u.id) === String(targetUserId) ? normalized : u));
      return { success: true, data: normalized };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to update status." };
    }
  };

  const toggleUserStatus = async (targetUserId, currentUserId) => {
    const user = users.find((u) => String(u.id) === String(targetUserId));
    if (!user) return { success: false, message: "User not found." };
    const nextStatus = user.status === "Active" ? "In Meeting" : user.status === "In Meeting" ? "Inactive" : "Active";
    return updateUserStatus(targetUserId, nextStatus, currentUserId);
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/${userId}`);
      setUsers((prev) => prev.filter((u) => String(u.id) !== String(userId)));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to delete user." };
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        createUser,
        updateUser,
        updateUserStatus,
        toggleUserStatus,
        deleteUser,
        refetchUsers: fetchUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () =>
  useContext(UsersContext);