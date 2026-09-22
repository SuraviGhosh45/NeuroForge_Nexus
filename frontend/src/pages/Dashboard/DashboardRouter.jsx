import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, normalizeRole } from "../../constants/roles.js";
import AdminDashboard from "./roles/AdminDashboard.jsx";
import ProjectManagerDashboard from "./roles/ProjectManagerDashboard.jsx";
import ProjectLeadDashboard from "./roles/ProjectLeadDashboard.jsx";
import TeamLeadDashboard from "./roles/TeamLeadDashboard.jsx";
import MemberDashboard from "./roles/MemberDashboard.jsx";

/**
 * DashboardRouter dynamically renders the tailored dashboard experience
 * per user role according to Section 5 of the SDLC Architecture.
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

  const role = normalizeRole(currentUser.role);

  switch (role) {
    case ROLES.ADMIN:
      return <AdminDashboard />;
    case ROLES.PROJECT_MANAGER:
      return <ProjectManagerDashboard />;
    case ROLES.PROJECT_LEAD:
      return <ProjectLeadDashboard />;
    case ROLES.TEAM_LEAD:
      return <TeamLeadDashboard />;
    case ROLES.DEVELOPER:
    case ROLES.TESTER:
    case ROLES.QA:
    default:
      return <MemberDashboard />;
  }
};

export default DashboardRouter;
