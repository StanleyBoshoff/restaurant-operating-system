/**
 * Restaurise Hierarchy & Permission Engine
 * Enforces authority levels and data visibility rules across the REMS.
 *
 * Hierarchy: 10 (Master Technician / Admin) down to 1 (Lowest / Entry).
 */

export const AUTHORITY_LEVELS = {
  MASTER_TECH: 10,
  OWNER: 9,
  HR_MANAGER: 8,
  GM: 7,
  DEPT_HEAD: 6,
  MANAGER: 5,
  SUPERVISOR: 4,
  SENIOR_STAFF: 3,
  STAFF: 2,
  ENTRY: 1
};

/**
 * Checks if a user has access to a specific module (Sidebar level).
 */
export const canAccessModule = (user, moduleName) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  // Level 10 always has full system access (Technician Bypass)
  if (authority_level >= AUTHORITY_LEVELS.MASTER_TECH) return true;

  // For levels 1-9, access is strictly driven by the matrix.
  // Map module names to their corresponding permission matrix keys
  const moduleMap = {
    'settings': 'can_access_settings',
    'disciplinary': 'can_manage_disciplinary',
    'reports': 'can_view_reports',
    'leave': 'can_view_leave_tracker',
    'timesheets': 'can_view_timesheets',
    'checklists': 'can_manage_checklists',
    'forms': 'can_submit_forms',
    'training': 'can_manage_training'
  };

  const key = moduleMap[moduleName.toLowerCase()];
  if (key && permissions) {
    return permissions[key] || false;
  }

  // Dashboard and Employees are public entry points, content filtering happens inside.
  return true;
};

/**
 * Generic permission check for any action/feature.
 * Strictly checks the matrix for levels 1-9.
 */
export const canDo = (user, permissionKey) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  if (authority_level >= AUTHORITY_LEVELS.MASTER_TECH) return true;

  return permissions?.[permissionKey] || false;
};

/**
 * Field-level security logic.
 * Strictly checks the matrix for levels 1-9.
 */
export const canViewSensitiveField = (user, fieldName) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  if (authority_level >= AUTHORITY_LEVELS.MASTER_TECH) return true;

  switch (fieldName) {
    case 'salary_wage': return permissions?.can_view_salary || false;
    case 'private_notes': return permissions?.can_view_all_staff || false;
    case 'emergency_contact': return true; // Safety override (Always visible)
    default: return true;
  }
};

/**
 * Determines if a manager can see/manage a specific target employee.
 */
export const canManageEmployee = (manager, target) => {
  if (!manager || !target) return false;

  const mLevel = manager.role_data?.authority_level || 1;
  const tLevel = target.role_data?.authority_level || 1;

  // Higher level manages lower level
  if (mLevel > tLevel) {
    if (manager.role_data?.permissions?.can_view_all_staff) return true;
    if (manager.department === target.department || manager.department === 'Admin') {
      return true;
    }
  }

  return false;
};
