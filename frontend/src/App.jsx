import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { TeamsProvider } from "./context/TeamsContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./components/layouts/DashboardLayout.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import TeamManagement from "./pages/TeamManagement/TeamManagement.jsx";
import TaskManagement from "./pages/TaskManagement/TaskManagement.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import ProjectManagement from "./pages/ProjectManagement/ProjectManagement.jsx";
import MyTask from "./pages/Mytask/MyTask.jsx";
import "./App.css";

const protect = (content, allowedRoles) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <DashboardLayout>{content}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <UsersProvider>
        <TeamsProvider>
          <ProjectProvider>
            <TasksProvider>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/login" replace />}
                />

                <Route
                  path="/login"
                  element={<Login />}
                />

                <Route
                  path="/register"
                  element={<Register />}
                />

                <Route
                  path="/dashboard"
                  element={protect(<Dashboard />)}
                />

                <Route
                  path="/user-management"
                  element={protect(
                    <UserManagement />,
                    ["Admin"]
                  )}
                />

                <Route
                  path="/teams"
                  element={protect(
                    <TeamManagement />,
                    [
                      "Admin",
                      "Project Lead",
                      "Project Manager",
                      "Team Lead",
                    ]
                  )}
                />

                <Route
                  path="/tasks"
                  element={protect(
                    <TaskManagement />,
                    [
                      "Admin",
                      "Project Lead",
                      "Project Manager",
                      "Team Lead",
                    ]
                  )}
                />

                <Route
                  path="/projects"
                  element={protect(
                    <ProjectManagement />,
                    [
                      "Admin",
                      "Project Lead",
                      "Project Manager",
                      "Team Lead",
                    ]
                  )}
                />

                <Route
                  path="/my-tasks"
                  element={protect(
                    <MyTask />,
                    [
                      "Team Lead",
                      "Developer",
                      "Tester",
                      "QA",
                    ]
                  )}
                />

                <Route
                  path="*"
                  element={<Navigate to="/login" replace />}
                />
              </Routes>
            </TasksProvider>
          </ProjectProvider>
        </TeamsProvider>
      </UsersProvider>
    </AuthProvider>
  );
};

export default App;