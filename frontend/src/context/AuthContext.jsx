import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
axios.defaults.withXSRFToken = true;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const normalizeUser = (user) => ({
    ...user,
    role: user.role || "Admin",
  });

  useEffect(() => {
    const handleUnauthorized = (error) => {
      if (error.response?.status === 401) {
        setCurrentUser(null);
      }
      return Promise.reject(error);
    };

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      handleUnauthorized
    );

    axios
      .get(`${API_BASE}/me`)
      .then((response) => setCurrentUser(normalizeUser(response.data)))
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthReady(true));

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
      });
      const userObj = normalizeUser(response.data);
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
      const response = await axios.post(`${API_BASE}/login`, { email, password });
      const userObj = normalizeUser(response.data);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);