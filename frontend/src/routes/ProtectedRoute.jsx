import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  // User is not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Route have no role restrictions
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // User have no permission
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;