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
  const userObj = {
    id: 1,
    fullName: userData.name,
    email: userData.email,
    role: "Admin",
  };

  localStorage.setItem("currentUser", JSON.stringify(userObj));
  setCurrentUser(userObj);

  return { success: true };
};

  const login = async (email, password) => {
  const userObj = {
    id: 1,
    fullName: "Test User",
    email: email,
    role: "Admin",
  };

  localStorage.setItem("currentUser", JSON.stringify(userObj));
  setCurrentUser(userObj);

  return { success: true };
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