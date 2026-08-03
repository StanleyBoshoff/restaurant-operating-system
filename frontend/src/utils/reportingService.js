import { supabase } from '../supabaseClient';
import { calculateDuration } from './timesheetService';
import { calculateAnnualLeave, calculateSickLeave, calculateFamilyLeave } from './leaveEngine';
import { getSaHolidaysForYear } from './saHolidayEngine';

/**
 * Restaurise Reporting & Analytics Service (UUID Compliant)
 * Unified source for dashboard metrics and statutory legal reports.
 */

// --- 📊 DASHBOARD & CORE ANALYTICS ---

export const getOperationalSnapshot = async () => {
  const { count: totalEmployees } = await supabase.from('employees').select('*', { count: 'exact', head: true });
  const { count: onDutyNow } = await supabase.from('employee_timesheets').select('*', { count: 'exact', head: true }).in('status', ['Active', 'On Break']);
  const { count: pendingLeave } = await supabase.from('employee_leave').select('*', { count: 'exact', head: true }).eq('status', 'Pending');

  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
  const { count: expiringDocs } = await supabase.from('employee_documents').select('*', { count: 'exact', head: true }).lte('expiry_date', ninetyDaysFromNow.toISOString()).gte('expiry_date', new Date().toISOString());

  return {
    totalEmployees: totalEmployees || 0,
    onDutyNow: onDutyNow || 0,
    pendingLeave: pendingLeave || 0,
    expiringDocs: expiringDocs || 0
  };
};

export const getLabourMetrics = async (startDate, endDate) => {
  const { data: timesheets, error } = await supabase.from('employee_timesheets').select('*, employees(first_name, last_name, role, department)').gte('clock_in', startDate).lte('clock_in', endDate);
  if (error) throw error;
  return (timesheets || []).reduce((acc, ts) => {
    const dept = ts.employees?.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = { hours: 0, overtime: 0, shifts: 0 };
    const duration = parseFloat(calculateDuration(ts.clock_in, ts.clock_out || new Date().toISOString(), ts.break_end ? 30 : 0));
    acc[dept].hours += duration;
    acc[dept].shifts += 1;
    if (duration > 9) acc[dept].overtime += (duration - 9);
    return acc;
  }, {});
};

export const getComplianceScore = async () => {
  const { data: employees } = await supabase.from('employees').select('id, sa_id_number');
  const { data: docs } = await supabase.from('employee_documents').select('employee_id, document_type');
  if (!employees) return 0;
  const requiredPerEmp = (emp) => /^\d{13}$/.test(emp.sa_id_number || '') ? 3 : 5;
  let totalReq = 0, totalPres = 0;
  employees.forEach(emp => {
    const req = requiredPerEmp(emp);
    const pres = (docs || []).filter(d => d.employee_id === emp.id).length;
    totalReq += req; totalPres += Math.min(pres, req);
  });
  return totalReq > 0 ? Math.round((totalPres / totalReq) * 100) : 100;
};

export const getDisciplinaryTrends = async () => {
  const { data: warnings, error } = await supabase.from('employee_warnings').select('warning_level, employees(department)');
  if (error) throw error;
  return (warnings || []).reduce((acc, w) => {
    acc[w.warning_level] = (acc[w.warning_level] || 0) + 1;
    return acc;
  }, {});
};

// --- 📅 LEAVE & STATUTORY REPORTS (INDIVIDUAL & DEPT CAPABLE) ---

/**
 * Common query helper for employees filtered by dept/id
 */
const getScopedEmployees = async (dept, employeeId) => {
  let query = supabase.from('employees').select('*');
  if (employeeId) query = query.eq('id', employeeId);
  else if (dept !== 'All') query = query.eq('department', dept);
  const { data } = await query;
  return data || [];
};

/**
 * Common query helper for leave filtered by dept/id
 */
const getScopedLeave = async (dept, employeeId, extraFilter = {}) => {
  let query = supabase.from('employee_leave').select('*, employees!inner(*)');
  if (employeeId) query = query.eq('employee_id', employeeId);
  else if (dept !== 'All') query = query.eq('employees.department', dept);

  Object.entries(extraFilter).forEach(([key, val]) => {
    query = query.eq(key, val);
  });

  const { data } = await query;
  return data || [];
};

export const getShiftCoverageReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: leave } = await supabase.from('employee_leave').select('employee_id').eq('status', 'Approved').lte('start_date', endDate).gte('end_date', startDate);

  return emps.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    department: emp.department,
    status: (leave || []).some(l => l.employee_id === emp.id) ? 'ON LEAVE' : 'AVAILABLE'
  }));
};

export const getLeaveBalancesReport = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: allLeave } = await supabase.from('employee_leave').select('*');

  return emps.map(emp => {
    const history = (allLeave || []).filter(l => l.employee_id === emp.id);
    return {
      name: `${emp.first_name} ${emp.last_name}`,
      dept: emp.department,
      annual: calculateAnnualLeave(emp, history).toFixed(2),
      sick: calculateSickLeave(emp, history),
      family: calculateFamilyLeave(emp, history)
    };
  });
};

export const getPendingLeaveRequests = async (dept = 'All', employeeId = null) => {
  return await getScopedLeave(dept, employeeId, { status: 'Pending' });
};

export const getSickLeaveHistory = async (dept = 'All', employeeId = null) => {
  const data = await getScopedLeave(dept, employeeId, { leave_type: 'Sick Leave' });
  return data.map(r => ({
    name: `${r.employees.first_name} ${r.employees.last_name}`,
    dates: `${r.start_date} to ${r.end_date}`,
    stat_days: r.total_statutory_days_deducted,
    status: r.status,
    attachment_url: r.attachment_url
  }));
};

export const getMedicalValidityLog = async (dept = 'All', employeeId = null) => {
  let query = supabase.from('employee_leave').select('*, employees!inner(*)').not('attachment_url', 'is', null);
  if (employeeId) query = query.eq('employee_id', employeeId);
  else if (dept !== 'All') query = query.eq('employees.department', dept);
  const { data } = await query;
  return (data || []).map(r => ({
    name: `${r.employees.first_name} ${r.employees.last_name}`,
    type: r.leave_type,
    period: `${r.start_date} to ${r.end_date}`,
    attachment_url: r.attachment_url
  }));
};

export const getMedicalCertificatesReport = getMedicalValidityLog;

export const getFamilyLeaveReport = async (dept = 'All', employeeId = null) => {
  const data = await getScopedLeave(dept, employeeId);
  return data.filter(r => ['Family Responsibility', 'Maternity Leave', 'Paternity Leave'].includes(r.leave_type));
};

export const getAbsenteeismLog = async (dept = 'All', employeeId = null) => {
  const data = await getScopedLeave(dept, employeeId);
  return data.filter(r => ['Unpaid Leave', 'Absent'].includes(r.leave_type));
};

export const getTOILBalances = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: shifts } = await supabase.from('employee_timesheets').select('employee_id, clock_in, clock_out, break_end');

  return emps.map(emp => {
    const empShifts = (shifts || []).filter(s => s.employee_id === emp.id);
    const otHours = empShifts.reduce((acc, s) => {
        const dur = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
        return acc + (dur > 9 ? dur - 9 : 0);
    }, 0);
    return { name: `${emp.first_name} ${emp.last_name}`, department: emp.department, earnedOT: otHours.toFixed(1), balance: otHours.toFixed(1) };
  });
};

export const getLeaveLiability = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: leave } = await supabase.from('employee_leave').select('*').eq('status', 'Approved');

  return emps.map(emp => {
    const history = (leave || []).filter(l => l.employee_id === emp.id);
    const bal = calculateAnnualLeave(emp, history);
    const salary = parseFloat((emp.salary_wage || '0').replace(/[^0-9.]/g, ''));
    const daily = salary / 21.67;
    return { name: `${emp.first_name} ${emp.last_name}`, department: emp.department, balance: bal.toFixed(2), liability: 'R' + (bal * daily).toFixed(2) };
  });
};

export const getAWOLAudit = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: shifts } = await supabase.from('employee_timesheets').select('employee_id, clock_in');
  const { data: leave } = await supabase.from('employee_leave').select('employee_id, start_date, end_date').eq('status', 'Approved');

  const awol = [];
  const today = new Date();
  emps.forEach(emp => {
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today); date.setDate(today.getDate() - i);
      const iso = date.toISOString().split('T')[0];
      const hasShift = (shifts || []).some(s => s.employee_id === emp.id && s.clock_in.startsWith(iso));
      const hasLeave = (leave || []).some(l => l.employee_id === emp.id && iso >= l.start_date && iso <= l.end_date);
      if (!hasShift && !hasLeave && date.getDay() !== 0) {
        awol.push({ name: `${emp.first_name} ${emp.last_name}`, date: iso, risk: 'High (AWOL)' });
      }
    }
  });
  return awol;
};

export const getOperationalDensity = async () => {
  const { data: leave } = await supabase.from('employee_leave').select('start_date, end_date').eq('status', 'Approved');
  const density = {};
  (leave || []).forEach(l => {
    let curr = new Date(l.start_date); const end = new Date(l.end_date);
    while (curr <= end) {
      const iso = curr.toISOString().split('T')[0];
      density[iso] = (density[iso] || 0) + 1;
      curr.setDate(curr.getDate() + 1);
    }
  });
  return Object.entries(density).map(([date, count]) => ({ date, staff_on_leave: count, operational_impact: count > 3 ? 'Critical' : 'Moderate' })).sort((a,b) => new Date(b.date) - new Date(a.date));
};

export const getSickLeaveCycleAudit = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  const { data: leave } = await supabase.from('employee_leave').select('*').eq('status', 'Approved').eq('leave_type', 'Sick Leave');

  return emps.map(emp => {
    const history = (leave || []).filter(l => l.employee_id === emp.id);
    const balance = calculateSickLeave(emp, history);
    return { name: `${emp.first_name} ${emp.last_name}`, cycle_total: emp.work_week_days === 6 ? 36 : 30, used: (emp.work_week_days === 6 ? 36 : 30) - balance, remaining: balance };
  });
};

export const getPublicHolidayLieuLedger = async () => {
  const year = new Date().getFullYear();
  const holidays = getSaHolidaysForYear(year);
  const { data: shifts } = await supabase.from('employee_timesheets').select('*, employees(first_name, last_name, department)');
  const worked = [];
  holidays.forEach(h => {
    (shifts || []).filter(s => s.clock_in.startsWith(h.date)).forEach(s => {
      worked.push({ name: `${s.employees.first_name} ${s.employees.last_name}`, holiday: h.name, date: h.date, compensation: 'Lieu Owed' });
    });
  });
  return worked;
};

export const getMaternityServiceRecord = async (dept = 'All', employeeId = null) => {
  const emps = await getScopedEmployees(dept, employeeId);
  return emps.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, id: emp.sa_id_number, start: emp.start_date, salary: emp.salary_wage }));
};

export const getCustomLeaveReport = async (filters = {}) => {
  const { dept = 'All', leaveType = 'All', employeeId = null, startDate, endDate } = filters;
  let q = supabase.from('employee_leave').select('*, employees!inner(*)');
  if (employeeId) q = q.eq('employee_id', employeeId);
  else if (dept !== 'All') q = q.eq('employees.department', dept);
  if (leaveType !== 'All') q = q.eq('leave_type', leaveType);
  if (startDate) q = q.gte('start_date', startDate);
  if (endDate) q = q.lte('end_date', endDate);
  const { data } = await q;
  return (data || []).map(r => ({ name: `${r.employees.first_name} ${r.employees.last_name}`, type: r.leave_type, status: r.status, start: r.start_date, end: r.end_date, stat_days: r.total_statutory_days_deducted, attachment_url: r.attachment_url }));
};

export const getEmployeeStatutoryPack = async (employeeId) => {
  const { data: emp } = await supabase.from('employees').select('*, roles(*)').eq('id', employeeId).single();
  const { data: leave } = await supabase.from('employee_leave').select('*').eq('employee_id', employeeId).order('start_date', { ascending: false });
  const { data: docs } = await supabase.from('employee_documents').select('*').eq('employee_id', employeeId);
  const { data: warnings } = await supabase.from('employee_warnings').select('*').eq('employee_id', employeeId);
  return { profile: emp, leave_ledger: leave || [], document_registry: docs || [], disciplinary_record: warnings || [], current_balances: { annual: calculateAnnualLeave(emp, leave || []).toFixed(2), sick: calculateSickLeave(emp, leave || []), family: calculateFamilyLeave(emp, leave || []) } };
};
