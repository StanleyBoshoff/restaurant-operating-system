import { supabase } from '../supabaseClient';

/**
 * Service for Managing Operational Tasks
 */

/**
 * Automatically sweeps and flags tasks from past days that were not finished on their scheduled day.
 * - Tasks never started ('Pending', 'Open') -> Flagged 'Not Done'
 * - Tasks started but not finished ('In Progress') -> Flagged 'Not Completed'
 */
export const flagPastOverdueTasks = async () => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Fetch all active tasks (not already finished or expired)
    const { data: activeTasks } = await supabase
      .from('tasks')
      .select('id, due_date, status, title')
      .not('status', 'in', '("Completed","Not Done","Not Completed")');

    if (!activeTasks || activeTasks.length === 0) return;

    const notDoneIds = [];
    const notCompletedIds = [];

    activeTasks.forEach(task => {
      if (!task.due_date) return;
      const taskDate = task.due_date.split('T')[0];

      // If the task due date is strictly before today (midnight passed or past test date)
      if (taskDate < today) {
        if (task.status === 'In Progress') {
          notCompletedIds.push(task.id);
        } else {
          notDoneIds.push(task.id);
        }
      }
    });

    if (notDoneIds.length > 0) {
      await supabase
        .from('tasks')
        .update({ status: 'Not Done', completed_at: new Date().toISOString() })
        .in('id', notDoneIds);
    }

    if (notCompletedIds.length > 0) {
      await supabase
        .from('tasks')
        .update({ status: 'Not Completed', completed_at: new Date().toISOString() })
        .in('id', notCompletedIds);
    }
  } catch (err) {
    console.error("Auto-expire past tasks error:", err.message);
  }
};

/**
 * Fetches strictly TODAY'S tasks for active floor boards.
 * Past incomplete tasks are auto-expired to prevent "playing catch-up".
 */
export const getTasksToday = async () => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Auto-sweep and expire past incomplete tasks
  await flagPastOverdueTasks();

  // 2. Ensure today's daily recurring tasks exist
  await syncDailyTasks();

  // 3. Query active tasks and filter strictly for TODAY'S date
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      employees!tasks_assigned_to_id_fkey (first_name, last_name, role),
      checklists (
        id,
        name,
        checklist_submissions (
          submitted_by_name,
          completed_at
        )
      )
    `)
    .not('status', 'in', '("Completed","Not Done","Not Completed")')
    .order('deadline_time', { ascending: true });

  if (error) throw error;

  // Filter strictly for today's date
  const todayTasks = (data || []).filter(task => {
    if (!task.due_date) return false;
    const taskDate = task.due_date.split('T')[0];
    return taskDate === today;
  });

  return todayTasks;
};

/**
 * Fetches archived tasks (Completed, Not Done, or Not Completed) for historical audits.
 */
export const getCompletedTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      employees!tasks_assigned_to_id_fkey (first_name, last_name, role),
      checklists (
        id,
        name,
        checklist_submissions (
          submitted_by_name,
          completed_at
        )
      )
    `)
    .in('status', ['Completed', 'Not Done', 'Not Completed'])
    .order('due_date', { ascending: false });

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
  if (status === 'Completed' || status === 'Not Done' || status === 'Not Completed') {
    update.completed_at = new Date().toISOString();
  }

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
 * Ensures exactly ONE instance exists per daily template for today.
 */
export const syncDailyTasks = async () => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch all recurring templates
  const { data: templates } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_recurring', true);

  if (!templates || templates.length === 0) return;

  // 2. Check existing active tasks for TODAY
  const { data: existing } = await supabase
    .from('tasks')
    .select('title, due_date, status')
    .not('status', 'in', '("Completed","Not Done","Not Completed")');

  const existingTodayTitles = new Set(
    existing
      ?.filter(e => e.due_date && e.due_date.split('T')[0] === today)
      .map(e => e.title) || []
  );

  // 3. Create missing ones strictly for today
  const toCreate = templates
    .filter(t => !existingTodayTitles.has(t.title))
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
