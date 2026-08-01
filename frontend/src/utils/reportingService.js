import { supabase } from '../supabaseClient';
import { calculateDuration } from './timesheetService';

/**
 * Restaurise Reporting & Analytics Service
 * Aggregates operational data for dashboards and formal reports.
 */

/**
 * Fetches a snapshot of current store operations.
 */
export const getOperationalSnapshot = async () => {
  const { count: totalEmployees } = await supabase.from('employees').select('*', { count: 'exact', head: true });

  const { count: onDutyNow } = await supabase
    .from('employee_timesheets')
    .select('*', { count: 'exact', head: true })
    .in('status', ['Active', 'On Break']);

  const { count: pendingLeave } = await supabase
    .from('employee_leave')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pending');

  // Foreign Compliance: Documents expiring in next 90 days
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const { count: expiringDocs } = await supabase
    .from('employee_documents')
    .select('*', { count: 'exact', head: true })
    .lte('expiry_date', ninetyDaysFromNow.toISOString())
    .gte('expiry_date', new Date().toISOString());

  return {
    totalEmployees: totalEmployees || 0,
    onDutyNow: onDutyNow || 0,
    pendingLeave: pendingLeave || 0,
    expiringDocs: expiringDocs || 0
  };
};

/**
 * Aggregates labour metrics for a specific date range.
 */
export const getLabourMetrics = async (startDate, endDate) => {
  const { data: timesheets, error } = await supabase
    .from('employee_timesheets')
    .select(`
      *,
      employees (first_name, last_name, role, department)
    `)
    .gte('clock_in', startDate)
    .lte('clock_in', endDate);

  if (error) throw error;

  const metrics = (timesheets || []).reduce((acc, ts) => {
    const dept = ts.employees?.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = { hours: 0, overtime: 0, shifts: 0 };

    const duration = parseFloat(calculateDuration(ts.clock_in, ts.clock_out, ts.break_end ? 30 : 0));
    acc[dept].hours += duration;
    acc[dept].shifts += 1;
    if (duration > 9) acc[dept].overtime += (duration - 9);

    return acc;
  }, {});

  return metrics;
};

/**
 * Calculates disciplinary trends across departments.
 */
export const getDisciplinaryTrends = async () => {
  const { data: warnings, error } = await supabase
    .from('employee_warnings')
    .select(`
      warning_level,
      employees (department)
    `);

  if (error) throw error;

  const trends = (warnings || []).reduce((acc, w) => {
    const level = w.warning_level;
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  return trends;
};

/**
 * Compliance Score: % of mandatory documents present across workforce.
 */
export const getComplianceScore = async () => {
  const { data: employees } = await supabase.from('employees').select('id, sa_id_number');
  const { data: docs } = await supabase.from('employee_documents').select('employee_id, document_type');

  if (!employees) return 0;

  const requiredPerEmp = (emp) => {
    const isSA = /^\d{13}$/.test(emp.sa_id_number || '');
    return isSA ? 3 : 5; // Simplified: 3 for SA, 5 for Foreign
  };

  let totalRequired = 0;
  let totalPresent = 0;

  employees.forEach(emp => {
    const requiredCount = requiredPerEmp(emp);
    const presentCount = (docs || []).filter(d => d.employee_id === emp.id).length;
    totalRequired += requiredCount;
    totalPresent += Math.min(presentCount, requiredCount);
  });

  return totalRequired > 0 ? Math.round((totalPresent / totalRequired) * 100) : 100;
};
