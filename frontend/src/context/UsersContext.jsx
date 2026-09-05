import { createContext, useContext, useState } from "react";

const UsersContext = createContext(null);

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });

  const persist = (updated) => {
    localStorage.setItem("users", JSON.stringify(updated));
    setUsers(updated);
  };

  // Used by Admin's "Add User" form — also picked up automatically by
  // Register (since AuthContext.register() writes to this same
  // localStorage key), so any registered account shows up here too.
  const createUser = (userData) => {
    persist([...users, { id: Date.now(), ...userData }]);
  };

  const updateUser = (updatedUser) => {
    persist(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const deleteUser = (userId) => {
    persist(users.filter((u) => u.id !== userId));
  };

  return (
    <UsersContext.Provider value={{ users, createUser, updateUser, deleteUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);