import { supabase } from '../supabaseClient';

/**
 * Service for Managing Operational Tasks
 */

export const getTasksToday = async () => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      employees!tasks_assigned_to_id_fkey (first_name, last_name, role),
      checklists (name)
    `)
    .or(`due_date.eq.${today},status.neq.Completed`)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
};

export const createTask = async (task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTaskStatus = async (taskId, status, metadata = {}) => {
  const update = {
    status,
    ...metadata
  };

  if (status === 'In Progress') update.started_at = new Date().toISOString();
  if (status === 'Completed') update.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Synchronizes today's tasks by generating them from recurring templates.
 * This ensures every day starts with a fresh set of operational goals.
 */
export const syncDailyTasks = async () => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch all recurring templates
  const { data: templates } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_recurring', true);

  if (!templates || templates.length === 0) return;

  // 2. Check which ones already exist for today
  const { data: existing } = await supabase
    .from('tasks')
    .select('title')
    .eq('due_date', today);

  const existingTitles = new Set(existing?.map(e => e.title) || []);

  // 3. Create missing ones
  const toCreate = templates
    .filter(t => !existingTitles.has(t.title))
    .map(t => ({
      title: t.title,
      description: t.description,
      category: t.category,
      checklist_id: t.checklist_id,
      required_permission_id: t.required_permission_id,
      deadline_time: t.deadline_time,
      is_recurring: false, // This is the live instance
      due_date: today,
      status: 'Pending'
    }));

  if (toCreate.length > 0) {
    const { error } = await supabase.from('tasks').insert(toCreate);
    if (error) console.error("Task generation failed:", error.message);
  }
};

/**
 * Auto-Assignment Logic: Assign to the lowest level qualified person clocked in.
 */
export const getAutoAssignee = async (permissionId) => {
  // 1. Get Active Staff
  const { data: shifts } = await supabase
    .from('employee_timesheets')
    .select('employee_id')
    .eq('status', 'Active');

  if (!shifts || shifts.length === 0) return null;

  // 2. Fetch qualified employees
  const { data: emps } = await supabase
    .from('employees')
    .select(`
      id, first_name, last_name,
      roles (
        authority_level,
        permissions
      )
    `)
    .in('id', shifts.map(s => s.employee_id));

  const qualified = emps?.filter(e => e.roles?.permissions?.[permissionId]) || [];
  if (qualified.length === 0) return null;

  // 3. Lowest level wins
  qualified.sort((a, b) => a.roles.authority_level - b.roles.authority_level);
  return qualified[0];
};

/**
 * Fetches all completed tasks for the archive.
 */
export const getArchivedTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      employees!tasks_assigned_to_id_fkey (first_name, last_name, role),
      checklists (name)
    `)
    .eq('status', 'Completed')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data;
};
