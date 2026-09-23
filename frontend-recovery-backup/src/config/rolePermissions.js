export const rolePermissions = {
    Admin: {
    scope: "all",
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canFilterByRole: true,
  },
  "Project Lead": {
    scope: "project",
    canAdd: false,   //changable if needed
    canEdit: false,
    canDelete: false,
    canFilterByRole: true,
  },
  "Project Manager": {
    scope: "project",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canFilterByRole: true,
  },
  "Team Lead": {
    scope: "team",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canFilterByRole: false,
  },
  Developer: {
    scope: "self",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canFilterByRole: false,
  },
  Tester: {
    scope: "self",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canFilterByRole: false,
  },
  QA: {
    scope: "self",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canFilterByRole: false,
  },
};

export const getPermissions = (role) => rolePermissions[role] ?? rolePermissions.Developer;