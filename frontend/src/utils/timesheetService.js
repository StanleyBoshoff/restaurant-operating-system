import { supabase } from '../supabaseClient';

/**
 * Timesheet & Attendance Service
 * Handles Clock-in, Clock-out, and Break logic for the Restaurise REMS.
 */

/**
 * Starts a new timesheet record for an employee.
 */
export const clockIn = async (employeeId, branchId) => {
  // 🛡️ Leave Guard: Check if employee is on approved leave today
  const today = new Date().toISOString().split('T')[0];
  const isOnLeave = await isEmployeeOnLeave(employeeId, today);

  if (isOnLeave) {
    throw new Error("Action Blocked: Employee is on approved leave today.");
  }

  const { data, error } = await supabase
    .from('employee_timesheets')
    .insert([{
      employee_id: employeeId,
      branch_id: branchId,
      clock_in: new Date().toISOString(),
      shift_date: today,
      record_source: 'Terminal',
      status: 'Active'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Marks the end of a shift and calculates total duration.
 */
export const clockOut = async (timesheetId) => {
  const clockOutTime = new Date().toISOString();

  const { data, error } = await supabase
    .from('employee_timesheets')
    .update({
      clock_out: clockOutTime,
      record_source: 'Terminal',
      status: 'Completed'
    })
    .eq('id', timesheetId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Checks if an employee is on approved leave for a specific date.
 */
export const isEmployeeOnLeave = async (employeeId, dateISO) => {
  const { data } = await supabase
    .from('employee_leave')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('status', 'Approved')
    .lte('start_date', dateISO)
    .gte('end_date', dateISO);

  return (data && data.length > 0);
};

/**
 * Automatically clocks out shifts that exceed the configured threshold.
 */
export const performGhostClockOutCheck = async () => {
  const settings = await getPayrollSettings();
  const maxHrs = settings.auto_clock_out_hrs || 12;

  // Find Active shifts older than maxHrs
  const thresholdTime = new Date(Date.now() - maxHrs * 60 * 60 * 1000).toISOString();

  const { data: overstayShifts } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('status', 'Active')
    .lt('clock_in', thresholdTime);

  if (!overstayShifts || overstayShifts.length === 0) return;

  const updates = overstayShifts.map(s => {
    const autoOut = new Date(new Date(s.clock_in).getTime() + maxHrs * 60 * 60 * 1000).toISOString();
    return {
      ...s,
      clock_out: autoOut,
      status: 'Completed',
      auto_clocked_out: true,
      notes: (s.notes ? s.notes + " | " : "") + `Auto clock-out after ${maxHrs}h.`
    };
  });

  const { error } = await supabase.from('employee_timesheets').upsert(updates);
  if (error) console.error("Ghost Clock-out failed:", error.message);
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
 * Calculates summary stats for a single employee.
 */
export const getEmployeeTimesheetStats = async (employeeId) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

  const { data: shifts, error } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('clock_in', weekAgo.toISOString());

  if (error) throw error;

  let totalHours = 0;
  let totalOvertime = 0;

  (shifts || []).forEach(s => {
    const duration = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
    totalHours += duration;
    if (duration > 9) totalOvertime += (duration - 9);
  });

  return {
    weeklyHours: totalHours.toFixed(1),
    weeklyOvertime: totalOvertime.toFixed(1),
    punctuality: 100 // Logic for "Late" requires Roster comparison
  };
};

/**
 * Batch saves or updates timesheet records for a monthly register.
 */
export const upsertMonthlyRegister = async (records, commit = false) => {
  const recordsWithState = records.map(r => ({
    ...r,
    is_committed: commit
  }));

  const { error } = await supabase
    .from('employee_timesheets')
    .upsert(recordsWithState, { onConflict: 'employee_id, shift_date' });

  if (error) throw error;
};

/**
 * Saves a single shift record to the cloud.
 */
export const upsertSingleShift = async (record) => {
  const { error } = await supabase
    .from('employee_timesheets')
    .upsert(record, { onConflict: 'employee_id, shift_date' });

  if (error) throw error;
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

/**
 * Utility to calculate duration in hours with automated break logic.
 */
export const calculateDurationWithSettings = (start, end, settings) => {
  if (!start || !end) return 0;

  const startTime = new Date(start);
  const endTime = new Date(end);
  let durationMinutes = (endTime - startTime) / 1000 / 60;

  if (settings?.auto_deduct_lunch) {
    const thresholdMins = (settings.break_threshold_hrs || 5) * 60;
    if (durationMinutes >= thresholdMins) {
      durationMinutes -= (settings.lunch_duration_mins || 60);
    }
  }

  return (Math.max(0, durationMinutes) / 60).toFixed(2);
};

/**
 * Fetches the store-wide payroll settings.
 */
export const getPayrollSettings = async () => {
  const { data, error } = await supabase
    .from('company_payroll_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // If not found, return sensible defaults
    return {
      auto_deduct_lunch: true,
      lunch_duration_mins: 60,
      break_threshold_hrs: 5,
      sunday_multiplier: 1.5,
      holiday_multiplier: 2.0
    };
  }
  return data;
};

export const updatePayrollSettings = async (settings) => {
  const { error } = await supabase
    .from('company_payroll_settings')
    .upsert([settings]);

  if (error) throw error;
};
