/**
 * Restaurise Hierarchy & Permission Engine
 * Enforces authority levels and data visibility rules across the REMS.
 */

export const AUTHORITY_LEVELS = {
  ADMIN: 1,      // Full control
  BOSS: 2,       // Owner/HR (Everything except system settings)
  SR_MANAGER: 3, // GM/Head Chef (Full departmental access)
  MANAGER: 4,    // Floor Manager/Sous Chef (Team management)
  SUPERVISOR: 5, // Lead/2IC (Limited team visibility)
  STAFF: 6       // Entry level (Self-access only)
};

/**
 * Checks if a user has access to a specific module.
 */
export const canAccessModule = (user, moduleName) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  // Level 1 always has access
  if (authority_level === AUTHORITY_LEVELS.ADMIN) return true;

  // Level 2 (Boss) has access to everything except settings
  if (authority_level === AUTHORITY_LEVELS.BOSS) {
    return moduleName.toLowerCase() !== 'settings';
  }

  // Otherwise check the specific permission bit
  switch (moduleName.toLowerCase()) {
    case 'settings': return permissions?.can_access_settings || false;
    case 'reports': return authority_level <= AUTHORITY_LEVELS.MANAGER;
    case 'disciplinary': return permissions?.can_manage_disciplinary || false;
    default: return true; // Standard modules accessible by default
  }
};

/**
 * Field-level security logic.
 */
export const canViewSensitiveField = (user, fieldName) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  if (authority_level <= AUTHORITY_LEVELS.BOSS) return true;

  switch (fieldName) {
    case 'salary_wage': return permissions?.can_view_salary || false;
    case 'emergency_contact': return true; // Always visible for safety
    case 'private_notes': return authority_level <= AUTHORITY_LEVELS.SR_MANAGER;
    default: return true;
  }
};

/**
 * Determines if a manager can see/manage a specific target employee.
 */
export const canManageEmployee = (manager, target) => {
  if (!manager || !target) return false;
  const mLevel = manager.role_data?.authority_level || 6;
  const tLevel = target.role_data?.authority_level || 6;

  // Admin/Boss see everyone
  if (mLevel <= AUTHORITY_LEVELS.BOSS) return true;

  // Cannot manage someone higher or equal in authority
  if (mLevel >= tLevel) return false;

  // Departmental Isolation: If they are management, they must be in the same department
  if (manager.department && target.department) {
    if (manager.department !== target.department && manager.department !== 'Admin') {
      return false;
    }
  }

  return true;
};
