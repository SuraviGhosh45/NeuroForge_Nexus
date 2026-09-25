import { useAuth } from "../../context/AuthContext.jsx";
import Dashboard from "./Dashboard.jsx";

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-[#e8eef8]/50">
        Loading user workspace...
      </div>
    );
  }

  return <Dashboard />;
};

export default DashboardRouter;