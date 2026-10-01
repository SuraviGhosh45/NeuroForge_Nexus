import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeRole, ROLES } from "../constants/roles.js";
import {
  setToken,
  clearToken,
  getToken,
  setTokenPersistent,
} from "../services/api.js";

export const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";
const USERS_BASE = "http://localhost:8080/api/users";
const AUTH_USER_KEY = "auth_user";

export const normalizeUser = (user) => {
  if (!user) return null;

  const role = normalizeRole(user.role || ROLES.UNASSIGNED);

  return {
    ...user,
    id: user.id,
    fullName: user.fullName || user.name || "User",
    name: user.fullName || user.name || "User",
    email: user.email || "",
    role,
    teamId: user.teamId ?? null,
    skills: Array.isArray(user.skills)
      ? user.skills
      : user.skill
        ? [user.skill]
        : [],
    status: user.status || "Active",
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const savedUser =
      sessionStorage.getItem(AUTH_USER_KEY) ||
      localStorage.getItem(AUTH_USER_KEY);

    const token = getToken();

    if (!token) {
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);
      setAuthReady(true);
      return;
    }

    if (savedUser) {
      try {
        setCurrentUser(normalizeUser(JSON.parse(savedUser)));
      } catch {
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    axios
      .get(`${API_BASE}/me`)
      .then((response) => {
        const user = normalizeUser(response.data);

        const storage = localStorage.getItem(AUTH_USER_KEY)
          ? localStorage
          : sessionStorage;

        storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
      })
      .catch(() => {
        clearToken();
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthReady(true);
      });
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName: userData.name || userData.fullName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });

      if (!response.data?.token) {
        return {
          success: false,
          message: "Registration failed: authentication token was not returned.",
        };
      }

      setToken(response.data.token);

      const user = normalizeUser(response.data);

      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.removeItem(AUTH_USER_KEY);

      setCurrentUser(user);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed.",
      };
    }
  };

  const login = async (email, password, remember = false) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        identifier: email,
        email,
        password,
      });

      if (!response.data?.token) {
        return {
          success: false,
          message: "Login failed: authentication token was not returned.",
        };
      }

      if (remember) {
        setTokenPersistent(response.data.token);
      } else {
        setToken(response.data.token);
      }

      const user = normalizeUser(response.data);

      const storage = remember ? localStorage : sessionStorage;

      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      if (remember) {
        sessionStorage.removeItem(AUTH_USER_KEY);
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }

      setCurrentUser(user);

      return {
        success: true,
      };
    } catch (error) {
      clearToken();
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Invalid email or password.",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`);
    } catch {
      // Logout locally even if the backend request fails.
    }

    clearToken();
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${USERS_BASE}/me`);

      clearToken();
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to delete your account.",
      };
    }
  };

  const updateCurrentUser = async (updates) => {
    try {
      const response = await axios.put(`${USERS_BASE}/me`, updates);

      const updated = normalizeUser(response.data);

      const storage = localStorage.getItem(AUTH_USER_KEY)
        ? localStorage
        : sessionStorage;

      storage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      setCurrentUser(updated);

      return {
        success: true,
        user: updated,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to update your profile.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authReady,
        register,
        login,
        logout,
        deleteAccount,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);