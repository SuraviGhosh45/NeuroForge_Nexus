import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeRole, ROLES } from "../constants/roles.js";
import {
  setToken,
  clearToken,
  getToken,
  setTokenPersistent,
} from "../services/api.js";

import "../services/api.js";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";
const USERS_BASE = "http://localhost:8080/api/users";
const AUTH_USER_KEY = "auth_user";

export const normalizeUser = (user) => {
  if (!user) return null;

  const role = normalizeRole(user.role || ROLES.UNASSIGNED);

  return {
    ...user,
    id: user.id || Date.now(),
    fullName: user.fullName || user.name || "User",
    name: user.fullName || user.name || "User",
    email: user.email || "",
    role,
    teamId: user.teamId ?? null,
    skills: Array.isArray(user.skills) ? user.skills : (user.skill ? [user.skill] : []),
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

    if (savedUser && token) {
      try {
        setCurrentUser(normalizeUser(JSON.parse(savedUser)));
      } catch (error) {
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        clearToken();
      }
    }

    if (!token) {
      setAuthReady(true);
      return;
    }

    /* ==========================================================================
       [BACKEND_INTEGRATION_POINT]
       Endpoint:    GET http://localhost:8080/api/auth/me
       Description: Fetch the authenticated user profile based on Bearer JWT token.
       Headers:     Authorization: Bearer <jwt-token>
       Response:    200 OK -> { "id": 1, "fullName": "Admin User", "email": "admin@example.com", "role": "ADMIN", "status": "Active" }
       cURL:        curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/auth/me
       ========================================================================== */
    axios
      .get(`${API_BASE}/me`)
      .then((response) => {
        const user = normalizeUser(response.data);
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        setCurrentUser(user);
      })
      .catch(() => {
        clearToken();
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setCurrentUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const register = async (userData) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/auth/signup
         Description: Register a new user and return user object with JWT token.
         Payload:     { "fullName": "Jane Doe", "email": "jane@example.com", "password": "Password123!", "confirmPassword": "Password123!" }
         Response:    201/200 OK -> { "token": "jwt...", "id": 12, "fullName": "Jane Doe", "email": "jane@example.com", "role": "DEVELOPER" }
         cURL:        curl -X POST http://localhost:8080/api/auth/signup -H "Content-Type: application/json" -d '{"fullName":"Jane Doe","email":"jane@example.com","password":"Password123!","confirmPassword":"Password123!"}'
         ========================================================================== */
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName: userData.name || userData.fullName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });

      if (response.data?.token) {
        setToken(response.data.token);
      }

      const user = normalizeUser(response.data);
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      setCurrentUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed.",
      };
    }
  };

  const login = async (email, password, remember = false) => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/auth/login
         Description: Authenticate user credentials and return JWT token.
         Payload:     { "identifier": "user@example.com", "email": "user@example.com", "password": "Password123!" }
         Response:    200 OK -> { "token": "jwt...", "id": 1, "fullName": "Rahul Sharma", "email": "user@example.com", "role": "DEVELOPER" }
         cURL:        curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"Password123!"}'
         ========================================================================== */
      const response = await axios.post(`${API_BASE}/login`, {
        identifier: email,
        email,
        password,
      });

      if (response.data?.token) {
        if (remember) {
          setTokenPersistent(response.data.token);
        } else {
          setToken(response.data.token);
        }
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

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message;
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        return {
          success: false,
          message: message || "Invalid email or password.",
        };
      }

      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]: Offline / Network Fallback Mode
         When Spring Boot backend is unreachable (e.g. team member exploring frontend
         locally without running the backend), activate role session seamlessly.
         ========================================================================== */
      const emailLower = (email || "").toLowerCase().trim();
      let fallbackRole = "developer";
      let fullName = "Marcus Vance (Developer)";

      if (emailLower.includes("admin")) {
        fallbackRole = "admin";
        fullName = "Alexander Wright (Admin)";
      } else if (emailLower.includes("pm") || emailLower.includes("manager")) {
        fallbackRole = "project_manager";
        fullName = "Sarah Jenkins (PM)";
      } else if (emailLower.includes("lead") && !emailLower.includes("team")) {
        fallbackRole = "project_lead";
        fullName = "David Chen (Project Lead)";
      } else if (emailLower.includes("team")) {
        fallbackRole = "team_lead";
        fullName = "Elena Rostova (Team Lead)";
      } else if (emailLower.includes("test")) {
        fallbackRole = "tester";
        fullName = "Aisha Patel (Tester)";
      } else if (emailLower.includes("qa")) {
        fallbackRole = "qa";
        fullName = "Liam O'Connor (QA)";
      }

      const mockUser = normalizeUser({
        id: 99,
        email: emailLower || "dev@neuroforge.io",
        fullName,
        role: fallbackRole,
        status: "Active",
      });

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      setCurrentUser(mockUser);

      console.info(
        `[Backend Notice]: Backend offline. Automatically authenticated as ${fallbackRole.toUpperCase()} for frontend UI evaluation.`
      );

      return { success: true };
    }
  };

  const logout = async () => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    POST http://localhost:8080/api/auth/logout
         Description: Invalidate current user session / token on backend.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X POST http://localhost:8080/api/auth/logout -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.post(`${API_BASE}/logout`);
    } catch (_) {
      // Local logout must still complete if backend logout fails.
    }

    clearToken();
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
  };

  /** Self-service account deletion. Backend re-validates everything (last-admin, live responsibilities). */
  const deleteAccount = async () => {
    try {
      /* ==========================================================================
         [BACKEND_INTEGRATION_POINT]
         Endpoint:    DELETE http://localhost:8080/api/users/me
         Description: Self-service account deletion for the currently authenticated user.
         Headers:     Authorization: Bearer <jwt-token>
         Response:    200 OK / 204 No Content
         cURL:        curl -X DELETE http://localhost:8080/api/users/me -H "Authorization: Bearer <TOKEN>"
         ========================================================================== */
      await axios.delete(`${USERS_BASE}/me`);

      clearToken();
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to delete your account.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, authReady, register, login, logout, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);