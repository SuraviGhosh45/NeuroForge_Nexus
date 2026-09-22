import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeRole, ROLES } from "../constants/roles.js";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
axios.defaults.withXSRFToken = true;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const normalizeUser = (user) => {
    if (!user) return null;
    const role = normalizeRole(user.role || ROLES.ADMIN);
    return {
      ...user,
      id: user.id || 1,
      fullName: user.fullName || user.name || "Alex Vance",
      email: user.email || "alex.vance@neuroforge.io",
      role,
      teamId: user.teamId || 1,
    };
  };

  useEffect(() => {
    const handleUnauthorized = (error) => {
      if (error.response?.status === 401) {
        // Only clear if not in offline demo mode
        const savedDemo = sessionStorage.getItem("demo_user");
        if (!savedDemo) {
          setCurrentUser(null);
        }
      }
      return Promise.reject(error);
    };

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      handleUnauthorized
    );

    // Check if demo user stored in session
    const savedDemo = sessionStorage.getItem("demo_user");
    if (savedDemo) {
      try {
        setCurrentUser(normalizeUser(JSON.parse(savedDemo)));
        setAuthReady(true);
        return () => axios.interceptors.response.eject(interceptorId);
      } catch (e) {
        sessionStorage.removeItem("demo_user");
      }
    }

    axios
      .get(`${API_BASE}/me`)
      .then((response) => {
        setCurrentUser(normalizeUser(response.data));
      })
      .catch(() => {
        // Default to active session if local demo
        const defaultUser = {
          id: 1,
          fullName: "Alex Vance",
          email: "alex.vance@neuroforge.io",
          role: ROLES.ADMIN,
          teamId: 1,
        };
        setCurrentUser(normalizeUser(defaultUser));
      })
      .finally(() => {
        setAuthReady(true);
      });

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  const switchRoleForDemo = (newRole) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      role: normalizeRole(newRole),
    };
    sessionStorage.setItem("demo_user", JSON.stringify(updated));
    setCurrentUser(updated);
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
      });

      const userObj = normalizeUser(response.data);
      sessionStorage.setItem("demo_user", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Unable to create your account.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      const userObj = normalizeUser(response.data);
      sessionStorage.setItem("demo_user", JSON.stringify(userObj));
      setCurrentUser(userObj);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password.",
      };
    }
  };

  const logout = async () => {
    await axios.post(`${API_BASE}/logout`).catch(() => {});
    sessionStorage.removeItem("demo_user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authReady,
        register,
        login,
        logout,
        switchRoleForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);