import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getApiBase } from "../services/api.js";

const UsersContext = createContext(null);

const API_BASE = getApiBase();
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

export const SEED_USERS = [
  { id: 1, fullName: "Alexander Wright", email: "admin@neuroforge.io", role: "admin", status: "Active", skills: ["System Admin", "Access Control", "Security Compliance", "DevOps"] },
  { id: 2, fullName: "Sarah Jenkins", email: "pm@neuroforge.io", role: "project_manager", status: "Active", skills: ["Agile / Scrum", "Risk Management", "Resource Planning"] },
  { id: 3, fullName: "David Chen", email: "lead@neuroforge.io", role: "project_lead", status: "Active", skills: ["System Architecture", "Sprint Planning", "Technical Strategy"] },
  { id: 4, fullName: "Elena Rostova", email: "teamlead@neuroforge.io", role: "team_lead", status: "Active", skills: ["Sprint Leadership", "Code Review", "Task Delegation"] },
  { id: 5, fullName: "Marcus Vance", email: "dev@neuroforge.io", role: "developer", status: "Active", skills: ["React", "Spring Boot", "REST APIs", "PostgreSQL"] },
  { id: 6, fullName: "Aisha Patel", email: "tester@neuroforge.io", role: "tester", status: "Active", skills: ["Selenium", "Jest", "Manual Testing", "JIRA"] },
  { id: 7, fullName: "Liam O'Connor", email: "qa@neuroforge.io", role: "qa", status: "In Meeting", skills: ["Cypress", "Performance Testing", "CI/CD", "API Testing"] },
];

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
        ? await axios.get(`${API_BASE}/users`)
        : ["PROJECT_MANAGER", "PROJECT_LEAD", "TEAM_LEAD"].includes(currentRole)
          ? await axios.get(`${API_BASE}/users/options`)
          : { data: [] };

      const normalized = Array.isArray(response.data) ? response.data.map(normalizeUser) : [];
      if (normalized.length === 0) {
        const cached = localStorage.getItem(USERS_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setUsers(parsed.map(normalizeUser));
              return;
            }
          } catch {
            // ignore
          }
        }
        setUsers(SEED_USERS.map(normalizeUser));
      } else {
        setUsers(normalized);
        if (currentRole === "ADMIN") saveToStorage(normalized);
      }
    } catch (error) {
            const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed.map(normalizeUser));
            return;
          }
        } catch {
          // ignore
        }
      }
      setUsers(SEED_USERS.map(normalizeUser));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (newUser) => {
    try {
            const response = await axios.post(`${API_BASE}/users`, {
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
            let response = await axios.put(`${API_BASE}/users/${updatedUser.id}`, {
        fullName: updatedUser.fullName || updatedUser.name,
        email: updatedUser.email,
      });
      if (updatedUser.role && String(updatedUser.role).toLowerCase() !== String(existing.role).toLowerCase()) {
        response = await axios.patch(`${API_BASE}/users/${updatedUser.id}/role`, { role: updatedUser.role });
      }
      if (updatedUser.status && updatedUser.status !== existing.status) {
        response = await axios.patch(`${API_BASE}/users/${updatedUser.id}/status`, { status: updatedUser.status });
      }
      const normalized = normalizeUser(response.data || { ...existing, ...updatedUser });
      setUsers((prev) => {
        const next = prev.map((u) => String(u.id) === String(normalized.id) ? normalized : u);
        saveToStorage(next);
        return next;
      });
      return { success: true, data: normalized };
    } catch (error) {
            const normalized = normalizeUser({ ...existing, ...updatedUser });
      setUsers((prev) => {
        const next = prev.map((u) => String(u.id) === String(normalized.id) ? normalized : u);
        saveToStorage(next);
        return next;
      });
      return { success: true, data: normalized, offlineFallback: true };
    }
  };

  const updateUserStatus = async (targetUserId, newStatus, currentUserId) => {
    try {
            const response = await axios.patch(`${API_BASE}/users/${targetUserId}/status`, { status: newStatus });
      const normalized = normalizeUser(response.data);
      setUsers((prev) => {
        const next = prev.map((u) => String(u.id) === String(targetUserId) ? normalized : u);
        saveToStorage(next);
        return next;
      });
      return { success: true, data: normalized };
    } catch (error) {
            setUsers((prev) => {
        const next = prev.map((u) => {
          if (String(u.id) === String(targetUserId)) {
            return normalizeUser({ ...u, status: newStatus });
          }
          return u;
        });
        saveToStorage(next);
        return next;
      });
      return { success: true, data: { id: targetUserId, status: newStatus }, offlineFallback: true };
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
            await axios.delete(`${API_BASE}/users/${userId}`);
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