import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeRole, ROLES } from "../constants/roles.js";
import { SEED_USERS } from "./UsersContext.jsx";
import {
  setToken,
  clearToken,
  getToken,
  setTokenPersistent,
  getApiBase,
} from "../services/api.js";

export const AuthContext = createContext(null);

const API_BASE = getApiBase();
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
      .get(`${API_BASE}/auth/me`)
      .then((response) => {
        const user = normalizeUser(response.data);

        const storage = localStorage.getItem(AUTH_USER_KEY)
          ? localStorage
          : sessionStorage;

        storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
      })
      .catch((err) => {
        // If backend is offline or it's a demo session, retain savedUser so team members stay logged in
        if (savedUser && (!err.response || token?.startsWith("demo-token"))) {
          try {
            setCurrentUser(normalizeUser(JSON.parse(savedUser)));
            return;
          } catch {
            // ignore
          }
        }
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
      const response = await axios.post(`${API_BASE}/auth/signup`, {
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
      const response = await axios.post(`${API_BASE}/auth/login`, {
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
      const normalizedEmail = (email || "").trim().toLowerCase();
      const matchedSeed = SEED_USERS.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail ||
          u.role.toLowerCase() === normalizedEmail
      );

      const isNetworkError =
        !error.response ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNREFUSED";

      // If backend is unreachable or demo testing password, allow demo authentication
      if ((isNetworkError || password === "password123") && matchedSeed) {
        const demoToken = `demo-token-${matchedSeed.id}-${Date.now()}`;
        if (remember) {
          setTokenPersistent(demoToken);
        } else {
          setToken(demoToken);
        }
        const user = normalizeUser({ ...matchedSeed, token: demoToken });
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        if (remember) {
          sessionStorage.removeItem(AUTH_USER_KEY);
        } else {
          localStorage.removeItem(AUTH_USER_KEY);
        }
        setCurrentUser(user);
        return { success: true };
      }

      clearToken();
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          (isNetworkError
            ? "Backend offline. Click any demo profile below to sign in instantly."
            : "Invalid email or password."),
      };
    }
  };

  const loginAsDemo = (roleOrEmail = "developer") => {
    const target =
      SEED_USERS.find(
        (u) =>
          u.role.toLowerCase() === roleOrEmail.toLowerCase() ||
          u.email.toLowerCase() === roleOrEmail.toLowerCase()
      ) || SEED_USERS[0];

    const demoToken = `demo-token-${target.id}-${Date.now()}`;
    setToken(demoToken);
    const user = normalizeUser({ ...target, token: demoToken });
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(user);
    return { success: true, user };
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
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
      await axios.delete(`${API_BASE}/users/me`);

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
      const response = await axios.put(`${API_BASE}/users/me`, updates);

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
        loginAsDemo,
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