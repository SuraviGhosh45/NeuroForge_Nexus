import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  // Real register — calls the Spring Boot backend
  const register = async (userData) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        return { success: false, message: data };
      }

      return { success: true, message: data };
    } catch (err) {
      return { success: false, message: "Cannot reach server. Is the backend running?" };
    }
  };

  // Real login — calls the Spring Boot backend
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.text();

      if (!response.ok) {
        return { success: false, message: data };
      }

      const userObj = { email };
      localStorage.setItem("currentUser", JSON.stringify(userObj));
      setCurrentUser(userObj);
      return { success: true };
    } catch (err) {
      return { success: false, message: "Cannot reach server. Is the backend running?" };
    }
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);