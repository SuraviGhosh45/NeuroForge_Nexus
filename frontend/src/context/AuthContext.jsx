import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { normalizeRole, ROLES } from "../constants/roles.js";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/auth";
const AUTH_USER_KEY = "auth_user";
const REGISTERED_ACCOUNTS_KEY = "sdlc_registered_accounts";
const USERS_STORAGE_KEY = "sdlc_users";

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";
axios.defaults.withXSRFToken = true;

export const KNOWN_ACCOUNTS = [
  {
    id: 1,
    fullName: "Suravi Ghosh",
    name: "Suravi Ghosh",
    email: "suravighosh45@gmail.com",
    role: ROLES.ADMIN,
    teamId: 1,
  },
  {
    id: 2,
    fullName: "Elena Rostova",
    name: "Elena Rostova",
    email: "elena.rostova@neuroforge.io",
    role: ROLES.PROJECT_MANAGER,
    teamId: 1,
  },
  {
    id: 3,
    fullName: "Marcus Chen",
    name: "Marcus Chen",
    email: "marcus.chen@neuroforge.io",
    role: ROLES.PROJECT_LEAD,
    teamId: 1,
  },
  {
    id: 4,
    fullName: "David Kim",
    name: "David Kim",
    email: "david.kim@neuroforge.io",
    role: ROLES.TEAM_LEAD,
    teamId: 1,
  },
  {
    id: 5,
    fullName: "Sophia Martinez",
    name: "Sophia Martinez",
    email: "sophia.martinez@neuroforge.io",
    role: ROLES.DEVELOPER,
    teamId: 1,
  },
  {
    id: 6,
    fullName: "Liam Vance",
    name: "Liam Vance",
    email: "liam.vance@neuroforge.io",
    role: ROLES.DEVELOPER,
    teamId: 1,
  },
  {
    id: 7,
    fullName: "Aria Takahashi",
    name: "Aria Takahashi",
    email: "aria.takahashi@neuroforge.io",
    role: ROLES.TESTER,
    teamId: 1,
  },
  {
    id: 8,
    fullName: "Lucas Silva",
    name: "Lucas Silva",
    email: "lucas.silva@neuroforge.io",
    role: ROLES.QA,
    teamId: 1,
  },
];

export const normalizeUser = (user) => {
  if (!user) return null;
  const role = normalizeRole(user.role || ROLES.DEVELOPER);
  return {
    ...user,
    id: user.id || Date.now(),
    fullName: user.fullName || user.name || "User",
    name: user.fullName || user.name || "User",
    email: user.email || "",
    role,
    teamId: user.teamId || 1,
  };
};

const getStoredAccounts = () => {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveAccountLocally = (account) => {
  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(
      (a) => a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...account };
    } else {
      accounts.push(account);
    }
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn("Failed to persist account locally:", e);
  }
};

const findAccountLocally = (email) => {
  const normalized = (email || "").toLowerCase().trim();
  // 1. Check registered accounts
  const accounts = getStoredAccounts();
  const registered = accounts.find((a) => (a.email || "").toLowerCase().trim() === normalized);
  if (registered) return registered;

  // 2. Check KNOWN_ACCOUNTS
  const known = KNOWN_ACCOUNTS.find((a) => a.email.toLowerCase().trim() === normalized);
  if (known) return known;

  // 3. Check sdlc_users directory in localStorage
  try {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const directoryUser = users.find(
        (u) => (u.email || "").toLowerCase().trim() === normalized
      );
      if (directoryUser) {
        return {
          id: directoryUser.id,
          fullName: directoryUser.fullName || directoryUser.name,
          email: directoryUser.email,
          role: normalizeRole(directoryUser.role),
          teamId: directoryUser.teamId || 1,
        };
      }
    }
  } catch (e) {
    // Ignore error
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const handleUnauthorized = (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setCurrentUser(null);
      }
      return Promise.reject(error);
    };

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      handleUnauthorized
    );

    // 1. Check active session in storage
    const savedUser =
      sessionStorage.getItem(AUTH_USER_KEY) ||
      localStorage.getItem(AUTH_USER_KEY) ||
      sessionStorage.getItem("demo_user");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(normalizeUser(parsed));
        setAuthReady(true);
        return () => axios.interceptors.response.eject(interceptorId);
      } catch (e) {
        sessionStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem("demo_user");
      }
    }

    // 2. Try checking backend /me
    axios
      .get(`${API_BASE}/me`)
      .then((response) => {
        const email = response.data?.email;
        const matched = findAccountLocally(email);
        const resolvedRole = matched?.role || response.data?.role || ROLES.DEVELOPER;
        const userObj = normalizeUser({
          ...response.data,
          role: resolvedRole,
        });
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
        setCurrentUser(userObj);
      })
      .catch(() => {
        // User is not authenticated; keep currentUser as null
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthReady(true);
      });

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  const register = async (userData) => {
    const role = normalizeRole(userData.role || ROLES.DEVELOPER);
    const email = (userData.email || "").toLowerCase().trim();
    const fullName = (userData.name || userData.fullName || "User").trim();

    let userObj = {
      id: Date.now(),
      fullName,
      name: fullName,
      email,
      role,
      teamId: 1,
    };

    try {
      const response = await axios.post(`${API_BASE}/signup`, {
        fullName,
        email,
        password: userData.password,
        role,
      });

      if (response.data?.id) {
        userObj.id = response.data.id;
        userObj.fullName = response.data.fullName || fullName;
      }
    } catch (e) {
      console.warn("Backend signup unavailable, registering user locally:", e.message);
    }

    // Save account locally for future sign-ins
    saveAccountLocally({
      ...userObj,
      password: userData.password,
    });

    // Also add to system user directory if not already there
    try {
      const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const userList = rawUsers ? JSON.parse(rawUsers) : [];
      if (!userList.some((u) => (u.email || "").toLowerCase() === email)) {
        userList.push({
          id: userObj.id,
          fullName,
          name: fullName,
          email,
          role,
          status: "Active",
          skills: [],
        });
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(userList));
      }
    } catch (e) {
      console.warn("Failed to update user directory:", e);
    }

    const normalized = normalizeUser(userObj);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));
    setCurrentUser(normalized);

    return { success: true };
  };

  const login = async (email, password, remember = false) => {
    const normalizedEmail = (email || "").toLowerCase().trim();
    let userObj = null;

    // 1. Try backend login
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: normalizedEmail,
        password,
      });

      if (response.data) {
        const matched = findAccountLocally(normalizedEmail);
        const resolvedRole = matched?.role || response.data?.role || ROLES.DEVELOPER;
        userObj = {
          ...response.data,
          role: resolvedRole,
        };
      }
    } catch (backendError) {
      // 2. Fallback to local accounts
      const matched = findAccountLocally(normalizedEmail);
      if (matched) {
        // If it's a registered account with a password, verify password
        if (matched.password && matched.password !== password) {
          return {
            success: false,
            message: "Invalid password for this account. Please try again.",
          };
        }
        userObj = matched;
      } else {
        return {
          success: false,
          message: "Invalid email or password. Please verify your credentials or create a new account.",
        };
      }
    }

    if (!userObj) {
      return {
        success: false,
        message: "Unable to sign in with these credentials.",
      };
    }

    const normalized = normalizeUser(userObj);
    const targetStorage = remember ? localStorage : sessionStorage;
    targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized));

    if (remember) {
      sessionStorage.removeItem(AUTH_USER_KEY);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }

    setCurrentUser(normalized);
    return { success: true };
  };

  const logout = async () => {
    await axios.post(`${API_BASE}/logout`).catch(() => {});
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);