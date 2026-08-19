import { supabase } from '../supabaseClient';

/**
 * Service for managing Operational Checklists.
 */

/**
 * Fetches all items for a specific checklist by name.
 */
export const getChecklistItems = async (checklistName) => {
  const { data: checklist, error: clError } = await supabase
    .from('checklists')
    .select('id')
    .eq('name', checklistName)
    .maybeSingle();

  if (clError) throw clError;
  if (!checklist) return [];

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('checklist_id', checklist.id)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Determines the "Lowest Level Qualified Staff" currently on duty for a checklist.
 * Logic: Scan all 'Active' employees, find those with the required permission, pick the lowest level.
 */
export const getAssignedStaffForChecklist = async (permissionId) => {
  if (!permissionId) return null;

  // 1. Get all Active staff
  const { data: activeShifts } = await supabase
    .from('employee_timesheets')
    .select('employee_id')
    .eq('status', 'Active');

  if (!activeShifts || activeShifts.length === 0) return null;

  const activeEmpIds = activeShifts.map(s => s.employee_id);

  // 2. Fetch their roles and permissions
  const { data: emps } = await supabase
    .from('employees')
    .select(`
      id, first_name, last_name,
      roles (
        authority_level,
        permissions
      )
    `)
    .in('id', activeEmpIds);

  // 3. Filter by permission and find the lowest level
  const qualified = emps?.filter(e => e.roles?.permissions?.[permissionId]) || [];

  if (qualified.length === 0) return null;

  // Sort by authority_level ascending
  qualified.sort((a, b) => a.roles.authority_level - b.roles.authority_level);

  return qualified[0]; // The lowest level qualified person
};

/**
 * Submits a completed checklist with full accountability metadata.
 */
export const submitChecklist = async (checklistName, submissionData, managerId, managerName, startedAt) => {
  const { data: checklist } = await supabase
    .from('checklists')
    .select('id')
    .eq('name', checklistName)
    .maybeSingle();

  const { data, error } = await supabase
    .from('checklist_submissions')
    .insert([{
      checklist_id: checklist?.id,
      submitted_by_id: managerId,
      submitted_by_name: managerName,
      submission_data: submissionData,
      started_at: startedAt,
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
