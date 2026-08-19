import { supabase } from '../supabaseClient';

/**
 * Timesheet & Attendance Service
 * Handles Clock-in, Clock-out, and Break logic for the Restaurise REMS.
 */

/**
 * Starts a new timesheet record for an employee.
 */
export const clockIn = async (employeeId, branchId) => {
  // 🛡️ Integrity Guard: Check if employee already has an active shift
  const activeShift = await getActiveTimesheet(employeeId);
  if (activeShift) {
    throw new Error("Action Blocked: You already have an active shift.");
  }

  // 🛡️ Leave Guard: Check if employee is on approved leave today
  const today = new Date().toISOString().split('T')[0];
  const isOnLeave = await isEmployeeOnLeave(employeeId, today);

  if (isOnLeave) {
    throw new Error("Action Blocked: Employee is on approved leave today.");
  }

  const { error } = await supabase
    .from('employee_timesheets')
    .insert([{
      employee_id: employeeId,
      branch_id: branchId,
      clock_in: new Date().toISOString(),
      shift_date: today,
      record_source: 'Terminal',
      status: 'Active'
    }]);

  if (error) throw error;
  return { action_meta: 'Clocked In Successfully' };
};

/**
 * Marks the end of a shift and calculates total duration.
 */
export const clockOut = async (timesheetId) => {
  const clockOutTime = new Date().toISOString();

  const { error } = await supabase
    .from('employee_timesheets')
    .update({
      clock_out: clockOutTime,
      record_source: 'Terminal',
      status: 'Completed'
    })
    .eq('id', timesheetId);

  if (error) throw error;
  return { action_meta: 'Shift Completed Successfully' };
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
 * Automatically clocks out shifts that exceed the configured threshold or reach the cutoff time.
 */
export const performGhostClockOutCheck = async () => {
  const settings = await getPayrollSettings();
  const maxHrs = settings.auto_clock_out_hrs || 12;
  const cutoffTime = settings.shift_end_cutoff_time || '23:59:59';

  // Find Active shifts older than maxHrs
  const thresholdTime = new Date(Date.now() - maxHrs * 60 * 60 * 1000).toISOString();

  const { data: activeShifts } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('status', 'Active');

  if (!activeShifts || activeShifts.length === 0) return;

  const updates = [];
  const now = new Date();

  activeShifts.forEach(s => {
    const clockInDate = new Date(s.clock_in);

    // Check 1: Exceeds max hours
    const isOverstay = clockInDate < new Date(thresholdTime);

    // Check 2: Past cutoff time (same day or next day depends on business logic, usually same day)
    const [h, m, s_part] = cutoffTime.split(':');
    const cutoffToday = new Date(now);
    cutoffToday.setHours(parseInt(h), parseInt(m), parseInt(s_part), 0);
    const isPastCutoff = now > cutoffToday;

    if (isOverstay || isPastCutoff) {
      // Determine auto-out time: either clockIn + maxHrs OR the cutoff time
      const autoOut = isOverstay
        ? new Date(clockInDate.getTime() + maxHrs * 60 * 60 * 1000).toISOString()
        : cutoffToday.toISOString();

      updates.push({
        ...s,
        clock_out: autoOut,
        status: 'Completed',
        auto_clocked_out: true,
        notes: (s.notes ? s.notes + " | " : "") +
               (isOverstay ? `Auto clock-out after ${maxHrs}h.` : `Auto clock-out at cutoff ${cutoffTime}.`)
      });
    }
  });

  if (updates.length > 0) {
    const { error } = await supabase.from('employee_timesheets').upsert(updates);
    if (error) console.error("Ghost Clock-out failed:", error.message);
  }
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

  const { error } = await supabase
    .from('employee_timesheets')
    .update(updateData)
    .eq('id', timesheetId);

  if (error) throw error;
  return {
    action_meta: isStarting ? 'Break Started' : 'Duty Resumed after Break'
  };
};

/**
 * Fetches the most recent timesheet for an employee for the current day.
 */
export const getLatestShiftToday = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('employee_timesheets')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('shift_date', today)
    .order('clock_in', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Permanently removes a shift record (Manager Authorized).
 */
export const deleteShiftRecord = async (timesheetId) => {
  const { error } = await supabase
    .from('employee_timesheets')
    .delete()
    .eq('id', timesheetId);

  if (error) throw error;
  return true;
};

/**
 * Converts a previous accidental "Clock Out" into a "Break Start" and resumes the shift.
 */
export const convertOutToBreak = async (timesheetId) => {
  const now = new Date().toISOString();

  // 1. Get the existing shift to find the previous clock_out time
  const { data: oldShift } = await supabase
    .from('employee_timesheets')
    .select('clock_out')
    .eq('id', timesheetId)
    .single();

  if (!oldShift?.clock_out) throw new Error("No previous clock-out found to convert.");

  // 2. Transform the record
  const { error } = await supabase
    .from('employee_timesheets')
    .update({
      break_start: oldShift.clock_out, // The accidental 'out' becomes the 'break start'
      break_end: now,                 // Current time becomes 'break end'
      clock_out: null,                // Clear the exit time
      status: 'Active',               // Back to floor
      notes: "Correction: Accidental clock-out converted to break by Manager."
    })
    .eq('id', timesheetId);

  if (error) throw error;
  return { action_meta: 'Shift Resumed: Accidental Exit Corrected' };
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
 * Handles both full ISO strings and HH:mm time strings.
 */
export const calculateDurationWithSettings = (start, end, settings, breakStart = null, breakEnd = null) => {
  if (!start || !end) return 0;

  let startTime = new Date(start);
  let endTime = new Date(end);

  // 💡 Midnight Cross Detection for HH:mm strings (Standardized dummy date)
  // If start and end are on the same dummy day but end < start, assume next day.
  if (startTime.getFullYear() === 2000 && endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  let durationMinutes = (endTime - startTime) / 1000 / 60;

  if (settings?.auto_deduct_lunch) {
    const thresholdMins = (settings.break_threshold_hrs || 5) * 60;
    if (durationMinutes >= thresholdMins) {
      // Calculate actual break taken (if any)
      let actualBreakMins = 0;
      if (breakStart && breakEnd) {
        actualBreakMins = (new Date(breakEnd) - new Date(breakStart)) / 1000 / 60;
      }

      // Rule: Deduct at least the allowed duration (lunch_duration_mins)
      // If they take a break for longer, ensure the extra time gets deducted.
      const deduction = Math.max(actualBreakMins, settings.lunch_duration_mins || 60);
      durationMinutes -= deduction;
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
