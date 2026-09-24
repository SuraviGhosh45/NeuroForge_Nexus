
import { useAuth } from "../../context/AuthContext.jsx";
import { normalizeRole } from "../../constants/roles.js";
import Dashboard from "./Dashboard.jsx";

/**
 * DashboardRouter dynamically renders the dashboard experience
 * for the currently authenticated user.
 *
 * Role-specific dashboard components are not currently present
 * in the repository, so the existing Dashboard component is used
 * as a temporary fallback.
 */
const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-[#e8eef8]/50">
        Loading user workspace...
      </div>
    );
  }

  normalizeRole(currentUser.role);

  return <Dashboard />;
};

export default DashboardRouter;

