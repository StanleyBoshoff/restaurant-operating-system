/**
 * Restaurise Hierarchy & Permission Engine (Strict Data-Driven Mode)
 * Everything is controlled by the matrix ticks in Supabase.
 */

export const AUTHORITY_LEVELS = {
  SYSTEM_ADMIN: 11,
  OWNER: 10,
  HR_MANAGER: 9,
  GM: 8,
  DEPT_HEAD: 7,
  MANAGER: 6,
  SUPERVISOR: 5,
  SENIOR_STAFF: 4,
  STAFF: 3,
  ENTRY: 2,
  GUEST: 1
};

/**
 * Checks if a user has access to a specific module (Sidebar level).
 */
export const canAccessModule = (user, moduleName) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  // ONLY Level 11 (System Admin) has a hard-coded bypass.
  if (authority_level >= 11) return true;

  // SPECIAL RULE: Employees module access depends on specific level visibility
  if (moduleName.toLowerCase() === 'employees') {
    const hasAnyLevelTick = Object.keys(permissions || {}).some(k => k.startsWith('can_view_lvl_') && permissions[k] === true);
    return hasAnyLevelTick;
  }

  // For other modules, access is driven by the matrix.
  const moduleMap = {
    'dashboard': 'can_view_dashboard',
    'employees': 'can_view_all_staff', // Keep for safety
    'attendance': 'can_view_timesheets',
    'leave': 'can_view_leave_tracker',
    'disciplinary': 'can_manage_disciplinary',
    'reports': 'can_view_reports',
    'training': 'can_manage_training',
    'tasks': 'can_manage_tasks',
    'checklists': 'can_manage_checklists',
    'forms': 'can_submit_forms',
    'safety': 'can_access_safety',
    'communication': 'can_access_communication',
    'settings': 'can_access_settings'
  };

  const key = moduleMap[moduleName.toLowerCase()];
  if (key && permissions) return permissions[key] || false;

  return key ? false : true;
};

/**
 * Generic permission check for any action/feature.
 */
export const canDo = (user, permissionKey) => {
  if (!user || !user.role_data) return false;
  if (user.role_data.authority_level >= 11) return true;
  return user.role_data.permissions?.[permissionKey] || false;
};

/**
 * Field-level security logic.
 */
export const canViewSensitiveField = (user, fieldName, targetEmployee = null) => {
  if (!user || !user.role_data) return false;
  const { permissions, authority_level } = user.role_data;

  if (authority_level >= 11) return true;

  // 1. Check if allowed to see this target LEVEL at all
  if (targetEmployee && targetEmployee.role_data) {
    const targetLevel = targetEmployee.role_data.authority_level || 1;
    if (targetLevel >= 11) return false; // Level 11 is always hidden

    if (!permissions?.[`can_view_lvl_${targetLevel}`]) {
        return false;
    }
  }

  // 2. Check specific field permissions
  switch (fieldName) {
    case 'salary_wage': return permissions?.can_view_salary || false;
    case 'bank_details': return permissions?.can_view_bank_details || false;
    case 'sa_id_number': return permissions?.can_view_id_passport || false;
    case 'passport_number': return permissions?.can_view_id_passport || false;
    case 'private_notes': return permissions?.can_view_all_staff || false;
    default: return true;
  }
};

/**
 * Determines if a manager can see/manage a specific target employee.
 */
export const canManageEmployee = (manager, target) => {
  if (!manager || !target) return false;
  const mPerms = manager.role_data?.permissions;
  const mLevel = manager.role_data?.authority_level || 1;
  const tLevel = target.role_data?.authority_level || 1;

  if (mLevel >= 11) return true;
  if (tLevel >= 11) return false;

  // STRICT TICK CHECK: Can I see this level?
  return mPerms?.[`can_view_lvl_${tLevel}`] || false;
};

/**
 * Determines if a user can edit specific profile sections.
 */
export const canEditProfileSection = (user, sectionName, targetEmployee) => {
  if (!user || !user.role_data) return false;
  const { authority_level, permissions } = user.role_data;

  if (authority_level >= 11) return true;

  const isSelf = targetEmployee && targetEmployee.id === user.id;

  // 1. SELF-SERVICE CHECK
  if (isSelf) {
      return permissions?.can_edit_own_details || false;
  }

  // 2. OTHERS CHECK
  if (targetEmployee && targetEmployee.role_data) {
    const targetLevel = targetEmployee.role_data.authority_level || 1;

    // Must be able to see them AND have the "Modify Others" tick
    if (!permissions?.[`can_view_lvl_${targetLevel}`]) return false;
    if (!permissions?.can_edit_personnel) return false;
  }

  // 3. DATA TYPE CHECK
  switch (sectionName) {
    case 'salary': return permissions?.can_edit_salary || false;
    case 'banking': return permissions?.can_edit_bank_details || false;
    case 'medical': return permissions?.can_edit_medical || false;
    case 'documents': return permissions?.can_upload_docs || false;
    default: return permissions?.can_edit_personnel || false;
  }
};
