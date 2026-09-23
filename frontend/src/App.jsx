import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { TeamsProvider } from "./context/TeamsContext.jsx";
import { ProjectProvider } from "./context/ProjectContext.jsx";
import { ProjectTeamProvider } from "./context/ProjectTeamContext.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import ScopeGuard from "./routes/ScopeGuard.jsx";
import DashboardLayout from "./components/layouts/DashboardLayout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

// Role-Routed Dashboard
import DashboardRouter from "./pages/Dashboard/DashboardRouter.jsx";

// Module Pages
import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import TeamManagement from "./pages/TeamManagement/TeamManagement.jsx";
import ProjectManagement from "./pages/ProjectManagement/ProjectManagement.jsx";
import ProjectWorkspace from "./pages/ProjectWorkspace/ProjectWorkspace.jsx";
import TaskManagement from "./pages/TaskManagement/TaskManagement.jsx";
import ParentTaskDetailsPage from "./pages/TaskManagement/ParentTaskDetailsPage.jsx";
import SubtaskManagement from "./pages/SubtaskManagement/SubtaskManagement.jsx";
import SubtaskDetails from "./components/Subtask/SubtaskDetails.jsx";
import SubtaskKanban from "./components/Subtask/SubtaskKanban.jsx";
import SubtaskCalendar from "./components/Subtask/SubtaskCalendar.jsx";
import GlobalCalendar from "./pages/Calendar/GlobalCalendar.jsx";
import MyTask from "./pages/Mytask/MyTask.jsx";
import KanbanBoard from "./components/KanbanBoard/KanbanBoard.jsx";

import { ROLES, MEMBER_ROLES } from "./constants/roles.js";
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
      {/* Public Routes */}
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
      <Route path="/unauthorized" element={protect(<Unauthorized />)} />

      {/* Role-Based Dynamic Dashboard */}
      <Route
        path="/dashboard"
        element={protect(<DashboardRouter />)}
      />

      {/* User Management (Admin Only) */}
      <Route
        path="/user-management"
        element={protect(
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <UserManagement />
          </RoleRoute>
        )}
      />

      {/* Team Management - Redirect to Projects (team members managed directly inside projects) */}
      <Route
        path="/teams"
        element={<Navigate to="/projects" replace />}
      />

      {/* Project Management & Workspace */}
      <Route
        path="/projects"
        element={protect(<ProjectManagement />)}
      />
      <Route
        path="/projects/:projectId"
        element={protect(
          <ScopeGuard>
            <ProjectWorkspace />
          </ScopeGuard>
        )}
      />

      {/* Parent Task Management - Redirect to Projects (parent tasks managed directly inside project workspace) */}
      <Route
        path="/tasks"
        element={<Navigate to="/projects" replace />}
      />

      {/* Parent Task Details Workspace */}
      <Route
        path="/projects/:projectId/tasks/:taskId"
        element={protect(
          <ScopeGuard>
            <ParentTaskDetailsPage />
          </ScopeGuard>
        )}
      />

      {/* Subtask Management */}
      <Route
        path="/projects/:projectId/tasks/:taskId/subtasks"
        element={protect(
          <ScopeGuard>
            <SubtaskManagement />
          </ScopeGuard>
        )}
      />

      {/* Individual Subtask Details Workspace */}
      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId"
        element={protect(
          <ScopeGuard>
            <SubtaskDetails />
          </ScopeGuard>
        )}
      />

      {/* Subtask Kanban */}
      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId/kanban"
        element={protect(
          <ScopeGuard>
            <SubtaskKanban />
          </ScopeGuard>
        )}
      />

      {/* Subtask Calendar */}
      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId/calendar"
        element={protect(
          <ScopeGuard>
            <SubtaskCalendar />
          </ScopeGuard>
        )}
      />

      {/* Global Master Calendar */}
      <Route
        path="/calendar"
        element={protect(<GlobalCalendar />)}
      />

      {/* My Work (Everyone EXCEPT Admin) */}
      <Route
        path="/my-tasks"
        element={protect(
          <RoleRoute allowedRoles={[ROLES.PROJECT_MANAGER, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD, ...MEMBER_ROLES]}>
            <MyTask />
          </RoleRoute>
        )}
      />

      {/* General Kanban */}
      <Route
        path="/kanban"
        element={protect(<KanbanBoard />)}
      />

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14] p-8 text-[#e8eef8]">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm font-medium">Loading SDLC workspace...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AppRoutes />;
  }

  return (
    <UsersProvider>
      <TeamsProvider>
        <ProjectProvider>
          <ProjectTeamProvider>
            <TasksProvider>
              <AppRoutes />
            </TasksProvider>
          </ProjectTeamProvider>
        </ProjectProvider>
      </TeamsProvider>
    </UsersProvider>
  );
};

export default App;