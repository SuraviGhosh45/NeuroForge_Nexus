import { usePermission } from "../../hooks/usePermission.js";

/**
 * Declarative component for conditional rendering based on RBAC permissions:
 * <Can perform="project:create">
 *   <button>Create Project</button>
 * </Can>
 */
const Can = ({ perform, scope = true, fallback = null, children }) => {
  const { can } = usePermission();

  if (!can(perform, scope)) {
    return fallback;
  }

  return children;
};

export default Can;
