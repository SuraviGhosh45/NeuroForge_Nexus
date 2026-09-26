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

import DashboardRouter from "./pages/Dashboard/DashboardRouter.jsx";

import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import UserDetails from "./pages/UserManagement/UserDetails.jsx";
import ProjectManagement from "./pages/ProjectManagement/ProjectManagement.jsx";
import ProjectWorkspace from "./pages/ProjectWorkspace/ProjectWorkspace.jsx";
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
        path="/unauthorized"
        element={protect(<Unauthorized />)}
      />

      <Route
        path="/dashboard"
        element={protect(<DashboardRouter />)}
      />

      <Route
        path="/user-management"
        element={protect(
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <UserManagement />
          </RoleRoute>
        )}
      />

      <Route
        path="/user-management/:userId"
        element={protect(
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <UserDetails />
          </RoleRoute>
        )}
      />

      <Route
        path="/teams"
        element={<Navigate to="/projects" replace />}
      />

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

      <Route
        path="/tasks"
        element={<Navigate to="/projects" replace />}
      />

      <Route
        path="/projects/:projectId/tasks/:taskId"
        element={protect(
          <ScopeGuard>
            <ParentTaskDetailsPage />
          </ScopeGuard>
        )}
      />

      <Route
        path="/projects/:projectId/tasks/:taskId/subtasks"
        element={protect(
          <ScopeGuard>
            <SubtaskManagement />
          </ScopeGuard>
        )}
      />

      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId"
        element={protect(
          <ScopeGuard>
            <SubtaskDetails />
          </ScopeGuard>
        )}
      />

      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId/kanban"
        element={protect(
          <ScopeGuard>
            <SubtaskKanban />
          </ScopeGuard>
        )}
      />

      <Route
        path="/projects/:projectId/tasks/:taskId/:subtaskId/calendar"
        element={protect(
          <ScopeGuard>
            <SubtaskCalendar />
          </ScopeGuard>
        )}
      />

      <Route
        path="/calendar"
        element={protect(<GlobalCalendar />)}
      />

      <Route
        path="/my-tasks"
        element={protect(
          <RoleRoute
            allowedRoles={[
              ROLES.PROJECT_MANAGER,
              ROLES.PROJECT_LEAD,
              ROLES.TEAM_LEAD,
              ...MEMBER_ROLES,
            ]}
          >
            <MyTask />
          </RoleRoute>
        )}
      />

      <Route
        path="/kanban"
        element={protect(<KanbanBoard />)}
      />

      <Route
        path="*"
        element={
          <Navigate
            to={currentUser ? "/dashboard" : "/login"}
            replace
          />
        }
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
      <div className="flex min-h-screen items-center justify-center bg-[#e8eef7] p-8 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

          <span className="text-sm font-medium text-slate-600">
            Loading SDLC workspace...
          </span>
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