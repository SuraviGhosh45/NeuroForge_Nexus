import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
      });

      const user = {
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: "Admin",
      };

      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      const user = {
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: "Admin",
      };

      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password.";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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