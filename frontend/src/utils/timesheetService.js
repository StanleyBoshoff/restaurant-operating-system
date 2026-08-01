import { supabase } from '../supabaseClient';

/**
 * Timesheet & Attendance Service
 * Handles Clock-in, Clock-out, and Break logic for the Restaurise REMS.
 */

/**
 * Starts a new timesheet record for an employee.
 * @param {string} employeeId
 * @param {string} branchId
 */
export const clockIn = async (employeeId, branchId) => {
  const { data, error } = await supabase
    .from('employee_timesheets')
    .insert([{
      employee_id: employeeId,
      branch_id: branchId,
      clock_in: new Date().toISOString(),
      status: 'Active'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Marks the end of a shift and calculates total duration.
 * @param {string} timesheetId
 */
export const clockOut = async (timesheetId) => {
  const clockOutTime = new Date().toISOString();

  // First, get the clock_in time to calculate duration (though we can do this in SQL or post-fetch)
  const { data: record, error: fetchError } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('id', timesheetId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('employee_timesheets')
    .update({
      clock_out: clockOutTime,
      status: 'Completed'
    })
    .eq('id', timesheetId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Toggles a break for an active timesheet.
 * @param {string} timesheetId
 * @param {boolean} isStarting
 */
export const toggleBreak = async (timesheetId, isStarting) => {
  const now = new Date().toISOString();
  const updateData = isStarting
    ? { break_start: now, status: 'On Break' }
    : { break_end: now, status: 'Active' };

  const { data, error } = await supabase
    .from('employee_timesheets')
    .update(updateData)
    .eq('id', timesheetId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetches the currently active timesheet for an employee.
 * @param {string} employeeId
 */
export const getActiveTimesheet = async (employeeId) => {
  const { data, error } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('employee_id', employeeId)
    .in('status', ['Active', 'On Break'])
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Fetches all timesheets for a specific date range.
 * @param {string} startDate ISO date
 * @param {string} endDate ISO date
 */
export const getTimesheetsInRange = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from('employee_timesheets')
    .select(`
      *,
      employees (
        first_name,
        last_name,
        role,
        employee_number
      )
    `)
    .gte('clock_in', startDate)
    .lte('clock_in', endDate)
    .order('clock_in', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Utility to calculate duration in hours.
 */
export const calculateDuration = (start, end, breakMinutes = 0) => {
  if (!start || !end) return 0;
  const durationMs = new Date(end) - new Date(start);
  const durationMinutes = (durationMs / 1000 / 60) - breakMinutes;
  return (durationMinutes / 60).toFixed(2);
};
