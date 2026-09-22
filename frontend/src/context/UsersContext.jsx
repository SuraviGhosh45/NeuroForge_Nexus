import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
  const defaultSkills = ROLE_DEFAULT_SKILLS[roleKey] || ROLE_DEFAULT_SKILLS.developer;

  return {
    ...user,
    id: user.id != null ? Number(user.id) : Date.now(),
    fullName: user.fullName || user.name || "User",
    name: user.fullName || user.name || "User",
    email: user.email || `${(user.fullName || user.name || "user").toLowerCase().replace(/\s+/g, ".")}@neuroforge.io`,
    role: user.role || "developer",
    skills: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : defaultSkills,
    status: user.status || "Active",
  };
};

const DEFAULT_USERS = [
  {
    id: 1,
    fullName: "Suravi Ghosh",
    email: "suravighosh45@gmail.com",
    role: "admin",
    skills: ["System Admin", "Access Control", "Security Compliance", "DevOps"],
    status: "Active",
  },
  {
    id: 2,
    fullName: "Elena Rostova",
    email: "elena.rostova@neuroforge.io",
    role: "project_manager",
    skills: ["Agile / Scrum", "Risk Management", "Resource Planning", "Stakeholder Mgmt"],
    status: "Active",
  },
  {
    id: 3,
    fullName: "Marcus Chen",
    email: "marcus.chen@neuroforge.io",
    role: "project_lead",
    skills: ["System Architecture", "Sprint Planning", "Technical Strategy", "Mentorship"],
    status: "Active",
  },
  {
    id: 4,
    fullName: "David Kim",
    email: "david.kim@neuroforge.io",
    role: "team_lead",
    skills: ["Sprint Leadership", "Code Review", "Task Delegation", "Architecture"],
    status: "Active",
  },
  {
    id: 5,
    fullName: "Sophia Martinez",
    email: "sophia.martinez@neuroforge.io",
    role: "developer",
    skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    status: "Active",
  },
  {
    id: 6,
    fullName: "Liam Vance",
    email: "liam.vance@neuroforge.io",
    role: "developer",
    skills: ["Spring Boot", "Java", "PostgreSQL", "Microservices"],
    status: "Active",
  },
  {
    id: 7,
    fullName: "Aria Takahashi",
    email: "aria.takahashi@neuroforge.io",
    role: "tester",
    skills: ["Selenium", "Jest", "Test Automation", "Manual Testing"],
    status: "Active",
  },
  {
    id: 8,
    fullName: "Lucas Silva",
    email: "lucas.silva@neuroforge.io",
    role: "qa",
    skills: ["Quality Assurance", "Cypress", "Performance Testing", "CI/CD"],
    status: "Active",
  },
];

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeUser);
        }
      }
    } catch (e) {
      console.warn("Failed to load cached users:", e);
    }
    return DEFAULT_USERS.map(normalizeUser);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const saveToStorage = (updatedUsers) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn("Failed to cache users in localStorage:", e);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API_BASE);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const normalized = response.data.map(normalizeUser);
        setUsers(normalized);
        saveToStorage(normalized);
      } else {
        setUsers((prev) => (prev.length > 0 ? prev : DEFAULT_USERS.map(normalizeUser)));
      }
    } catch (error) {
      console.warn("Backend user fetch failed, using local/cached users:", error.message);
      setUsers((prev) => (prev.length > 0 ? prev : DEFAULT_USERS.map(normalizeUser)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (newUser) => {
    const normalized = normalizeUser({
      ...newUser,
      id: Date.now(),
    });

    try {
      await axios.post(API_BASE, normalized);
    } catch (e) {
      console.warn("Backend user create failed, persisting locally:", e.message);
    }

    setUsers((prev) => {
      const next = [normalized, ...prev];
      saveToStorage(next);
      return next;
    });

    return { success: true, data: normalized };
  };

  const updateUser = async (updatedUser, currentUserId) => {
    const existing = users.find((u) => String(u.id) === String(updatedUser.id));

    // Enforce: No member can change other members' status (Active, Inactive, In Meeting) except their own
    let finalStatus = updatedUser.status;
    if (
      existing &&
      currentUserId &&
      String(updatedUser.id) !== String(currentUserId) &&
      updatedUser.status !== existing.status
    ) {
      finalStatus = existing.status;
    }

    const normalized = normalizeUser({
      ...updatedUser,
      status: finalStatus,
    });

    try {
      await axios.put(`${API_BASE}/${normalized.id}`, {
        fullName: normalized.fullName,
        email: normalized.email,
        role: normalized.role,
        skills: normalized.skills,
        status: normalized.status,
      });
    } catch (error) {
      console.warn("Backend user update failed, persisting locally:", error.message);
    }

    setUsers((prev) => {
      const next = prev.map((u) => (String(u.id) === String(normalized.id) ? { ...u, ...normalized } : u));
      saveToStorage(next);
      return next;
    });

    return { success: true, data: normalized };
  };

  const updateUserStatus = async (targetUserId, newStatus, currentUserId) => {
    // Strictly prevent changing other members' status
    if (currentUserId && String(targetUserId) !== String(currentUserId)) {
      return { success: false, message: "You can only update your own status." };
    }

    const user = users.find((u) => String(u.id) === String(targetUserId));
    if (!user) return { success: false, message: "User not found" };

    return updateUser({
      ...user,
      status: newStatus,
    });
  };

  const toggleUserStatus = async (targetUserId, currentUserId) => {
    // Strictly prevent changing other members' status
    if (currentUserId && String(targetUserId) !== String(currentUserId)) {
      return { success: false, message: "You can only update your own status." };
    }

    const user = users.find((u) => String(u.id) === String(targetUserId));
    if (!user) return { success: false, message: "User not found" };

    // Cycle through Active -> In Meeting -> Inactive -> Active
    let nextStatus = "Active";
    if (user.status === "Active") nextStatus = "In Meeting";
    else if (user.status === "In Meeting") nextStatus = "Inactive";
    else nextStatus = "Active";

    return updateUser({
      ...user,
      status: nextStatus,
    });
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/${userId}`);
    } catch (error) {
      console.warn("Backend user delete failed, persisting locally:", error.message);
    }

    setUsers((prev) => {
      const next = prev.filter((u) => String(u.id) !== String(userId));
      saveToStorage(next);
      return next;
    });

    return { success: true };
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

export const useUsers = () => useContext(UsersContext);