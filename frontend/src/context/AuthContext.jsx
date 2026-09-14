import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const register = (userData) => {
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: "Unassigned",
      team: null,
    };

    const existingUsers = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    localStorage.setItem(
      "users",
      JSON.stringify([...existingUsers, newUser])
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify(newUser)
    );

    setCurrentUser(newUser);

    return { success: true };
  };

  const login = (email) => {
    const existingUsers = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    const found = existingUsers.find(
      (user) => user.email === email
    );

    if (!found) {
      return {
        success: false,
        message: "No account found. Please register first.",
      };
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(found)
    );

    setCurrentUser(found);

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