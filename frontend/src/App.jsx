import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { TeamsProvider } from "./context/TeamsContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./components/layouts/DashboardLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import TeamManagement from "./pages/TeamManagement/TeamManagement.jsx";
import TaskManagement from "./pages/TaskManagement/TaskManagement.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import ProjectManagement from "./pages/ProjectManagement/ProjectManagement.jsx";
import MyTask from "./pages/Mytask/MyTask.jsx";
import KanbanBoard from "./components/KanbanBoard/KanbanBoard.jsx";
import "./App.css";

const protect = (content) => (
  <ProtectedRoute>
    <DashboardLayout>{content}</DashboardLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Landing />
          )
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={protect(<Dashboard />)}
      />

      <Route
        path="/user-management"
        element={protect(<UserManagement />)}
      />

      <Route
        path="/teams"
        element={protect(<TeamManagement />)}
      />

      <Route
        path="/tasks"
        element={protect(<TaskManagement />)}
      />

      <Route
        path="/projects"
        element={protect(<ProjectManagement />)}
      />

      <Route
        path="/my-tasks"
        element={protect(<MyTask />)}
      />

      <Route
        path="/kanban"
        element={protect(<KanbanBoard />)}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const AuthenticatedApp = () => {
  const { currentUser, authReady } = useAuth();

  if (!authReady) {
    return <div className="min-h-screen bg-[#07111f] p-8 text-[#e8eef8]">Loading workspace...</div>;
  }

  if (!currentUser) {
    return <AppRoutes />;
  }

  return (
    <UsersProvider>
      <TeamsProvider>
        <ProjectProvider>
          <TasksProvider>
            <AppRoutes />
          </TasksProvider>
        </ProjectProvider>
      </TeamsProvider>
    </UsersProvider>
  );
};

export default App;