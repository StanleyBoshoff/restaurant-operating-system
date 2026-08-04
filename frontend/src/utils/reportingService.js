import { supabase } from '../supabaseClient';
import { calculateDuration, getPayrollSettings } from './timesheetService';
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

export const getMonthlyAttendanceSummary = async (month, year) => {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data: employees } = await supabase.from('employees').select('id, first_name, last_name, role');
  const { data: shifts } = await supabase
    .from('employee_timesheets')
    .select('*')
    .gte('shift_date', startDate)
    .lte('shift_date', endDate);

  const summary = (employees || []).map(emp => {
    const empShifts = (shifts || []).filter(s => s.employee_id === emp.id);

    let totalHours = 0;
    let simpleOT = 0;
    let autoExits = 0;
    let approvedCount = 0;

    empShifts.forEach(s => {
      const dur = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
      totalHours += dur;
      if (dur > 9) simpleOT += (dur - 9);
      if (s.auto_clocked_out) autoExits += 1;
      if (s.is_approved) approvedCount += 1;
    });

    return {
      ...emp,
      totalHours: totalHours.toFixed(1),
      totalOvertime: simpleOT.toFixed(1),
      totalShifts: empShifts.length,
      autoExits,
      approvalRate: empShifts.length > 0 ? Math.round((approvedCount / empShifts.length) * 100) : 0
    };
  });

  return summary;
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
  if (employeeId && employeeId !== 'All') query = query.eq('id', employeeId);
  else if (dept !== 'All') query = query.eq('department', dept);
  const { data } = await query;
  return data || [];
};

/**
 * Common query helper for leave filtered by dept/id
 */
const getScopedLeave = async (dept, employeeId, extraFilter = {}) => {
  let query = supabase.from('employee_leave').select('*, employees!inner(*)');
  if (employeeId && employeeId !== 'All') query = query.eq('employee_id', employeeId);
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
  if (employeeId && employeeId !== 'All') query = query.eq('employee_id', employeeId);
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
  if (employeeId && employeeId !== 'All') q = q.eq('employee_id', employeeId);
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

// --- ⏰ TIME & ATTENDANCE SPECIALIZED REPORTS (INDIVIDUAL & DEPT CAPABLE) ---

/**
 * Common query helper for attendance filtered by dept/id
 */
const getScopedAttendance = (dept = 'All', employeeId = null) => {
  let query = supabase.from('employee_timesheets').select('*, employees!inner(*)');
  if (employeeId && employeeId !== 'All') query = query.eq('employee_id', employeeId);
  else if (dept !== 'All') query = query.eq('employees.department', dept);
  return query;
};

/**
 * Common query helper for schedules filtered by dept/id
 */
const getScopedSchedules = (dept = 'All', employeeId = null) => {
  let query = supabase.from('employee_schedules').select('*, employees!inner(*)');
  if (employeeId && employeeId !== 'All') query = query.eq('employee_id', employeeId);
  else if (dept !== 'All') query = query.eq('employees.department', dept);
  return query;
};

export const getDailyAttendanceLog = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data, error } = await getScopedAttendance(dept, employeeId)
    .gte('shift_date', startDate)
    .lte('shift_date', endDate)
    .order('clock_in', { ascending: true });
  if (error) throw error;
  return data;
};

export const getMissingPunchesReport = async (dept = 'All', employeeId = null) => {
  const { data, error } = await getScopedAttendance(dept, employeeId)
    .is('clock_out', null)
    .lt('clock_in', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());
  if (error) throw error;
  return data;
};

export const getTardinessAnalysisReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data: shifts } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  const { data: schedules } = await getScopedSchedules(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);

  return (shifts || []).map(s => {
    const sch = (schedules || []).find(sc => sc.employee_id === s.employee_id && sc.shift_date === s.shift_date);
    if (!sch) return null;
    const diff = (new Date(s.clock_in) - new Date(sch.scheduled_in)) / (1000 * 60);
    return {
      employee: `${s.employees.first_name} ${s.employees.last_name}`,
      date: s.shift_date,
      scheduled_in: new Date(sch.scheduled_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actual_in: new Date(s.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      delay_mins: Math.max(0, Math.round(diff))
    };
  }).filter(Boolean);
};

export const getLaborCostVarianceReport = async (month, year, dept = 'All') => {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  let budgetQuery = supabase.from('department_budgets').select('*').eq('month_year', startDate);
  if (dept !== 'All') budgetQuery = budgetQuery.eq('department', dept);
  const { data: budgets } = await budgetQuery;

  const { data: shifts } = await getScopedAttendance(dept).gte('shift_date', startDate).lte('shift_date', endDate);

  // Aggregate actuals by dept
  const actuals = (shifts || []).reduce((acc, s) => {
    const d = s.employees?.department || 'Unassigned';
    const dur = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
    const hourly = parseFloat((s.employees?.salary_wage || '0').replace(/[^0-9.]/g, '')) / 160; // Mock 160h month
    acc[d] = (acc[d] || 0) + (dur * hourly);
    return acc;
  }, {});

  return (budgets || []).map(b => ({
    department: b.department,
    budgeted: 'R' + b.budgeted_cost.toFixed(2),
    actual: 'R' + (actuals[b.department] || 0).toFixed(2),
    variance: 'R' + ((actuals[b.department] || 0) - b.budgeted_cost).toFixed(2)
  }));
};

export const getOvertimeTrackingReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  return (data || []).map(s => {
    const dur = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
    return dur > 9 ? {
      name: `${s.employees.first_name} ${s.employees.last_name}`,
      date: s.shift_date,
      total_hours: dur.toFixed(1),
      overtime: (dur - 9).toFixed(1)
    } : null;
  }).filter(Boolean);
};

export const getAbsenteeismReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data: schedules } = await getScopedSchedules(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  const { data: shifts } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);

  return (schedules || []).filter(sch =>
    !(shifts || []).some(s => s.employee_id === sch.employee_id && s.shift_date === sch.shift_date)
  ).map(sch => ({
    name: `${sch.employees.first_name} ${sch.employees.last_name}`,
    date: sch.shift_date,
    department: sch.department,
    status: 'No-Show'
  }));
};

export const getShiftVarianceReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data: schedules } = await getScopedSchedules(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  const { data: shifts } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);

  return (schedules || []).map(sch => {
    const act = (shifts || []).find(s => s.employee_id === sch.employee_id && s.shift_date === sch.shift_date);
    const schDur = (new Date(sch.scheduled_out) - new Date(sch.scheduled_in)) / (1000 * 60 * 60);
    const actDur = act ? parseFloat(calculateDuration(act.clock_in, act.clock_out || new Date().toISOString(), act.break_end ? 30 : 0)) : 0;
    return {
      name: `${sch.employees.first_name} ${sch.employees.last_name}`,
      date: sch.shift_date,
      scheduled: schDur.toFixed(1) + 'h',
      actual: actDur.toFixed(1) + 'h',
      variance: (actDur - schDur).toFixed(1) + 'h'
    };
  });
};

export const getEarlyDepartureReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data: shifts } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  const { data: schedules } = await getScopedSchedules(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);

  return (shifts || []).map(s => {
    const sch = (schedules || []).find(sc => sc.employee_id === s.employee_id && sc.shift_date === s.shift_date);
    if (!sch || !s.clock_out) return null;
    const diff = (new Date(sch.scheduled_out) - new Date(s.clock_out)) / (1000 * 60);
    return diff > 0 ? {
      name: `${s.employees.first_name} ${s.employees.last_name}`,
      date: s.shift_date,
      scheduled_out: new Date(sch.scheduled_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actual_out: new Date(s.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      early_mins: Math.round(diff) + 'm'
    } : null;
  }).filter(Boolean);
};

export const getApprovalStatusReport = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  return (data || []).map(s => ({
    name: `${s.employees.first_name} ${s.employees.last_name}`,
    date: s.shift_date,
    status: s.status,
    verified: s.is_approved ? 'YES' : 'NO'
  }));
};

export const getTotalHoursSummary = async (startDate, endDate, dept = 'All', employeeId = null) => {
  const { data, error } = await getScopedAttendance(dept, employeeId).gte('shift_date', startDate).lte('shift_date', endDate);
  if (error) throw error;

  const summary = (data || []).reduce((acc, s) => {
    const key = `${s.employees?.department || 'Unassigned'} - ${s.employees?.role || 'Staff'}`;
    if (!acc[key]) acc[key] = { department: s.employees?.department, role: s.employees?.role, totalHours: 0, shifts: 0 };
    acc[key].totalHours += parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
    acc[key].shifts += 1;
    return acc;
  }, {});

  return Object.values(summary).map(s => ({
    department: s.department,
    role: s.role,
    total_hours: s.totalHours.toFixed(1) + 'h',
    shift_count: s.shifts
  }));
};

// --- 💵 PAYROLL EXPORT ENGINE ---

export const getPayrollExportData = async (startDate, endDate) => {
  // 1. Fetch Master Data & Settings
  const settings = await getPayrollSettings();
  const year = new Date(startDate).getFullYear();
  const holidays = getSaHolidaysForYear(year).map(h => h.date);

  const { data: employees } = await supabase.from('employees').select('*');
  const { data: shifts } = await supabase.from('employee_timesheets').select('*').gte('shift_date', startDate).lte('shift_date', endDate);
  const { data: leave } = await supabase.from('employee_leave').select('*').gte('start_date', startDate).lte('end_date', endDate);
  const { data: adjustments } = await supabase.from('employee_payroll_adjustments').select('*').gte('adjustment_date', startDate).lte('adjustment_date', endDate);

  return (employees || []).map(emp => {
    const empShifts = (shifts || []).filter(s => s.employee_id === emp.id);
    const empLeave = (leave || []).filter(l => l.employee_id === emp.id);
    const empAdj = (adjustments || []).filter(a => a.employee_id === emp.id);

    // Calculate Hours
    let standardPool = 0; // Mon-Sat non-holiday
    let premiumPool15 = 0; // Sunday (if enabled)
    let premiumPool20 = 0; // Holiday (if enabled)
    let nightHrs = 0;

    empShifts.forEach(s => {
      const dur = parseFloat(calculateDuration(s.clock_in, s.clock_out || new Date().toISOString(), s.break_end ? 30 : 0));
      const dateStr = s.shift_date;
      const isSunday = new Date(s.clock_in).getDay() === 0;
      const isHoliday = holidays.includes(dateStr);

      if (isHoliday && settings.enable_holiday_premium) {
        premiumPool20 += dur;
      } else if (isSunday && settings.enable_sunday_premium) {
        premiumPool15 += dur;
      } else {
        standardPool += dur;
      }

      // Night Shift (10pm - 6am) remains chronological check
      const start = new Date(s.clock_in);
      if (start.getHours() >= 22 || start.getHours() < 6) nightHrs += dur;
    });

    // Overtime Logic (Monthly Threshold)
    let regularHrs = standardPool;
    let thresholdOT = 0;

    if (settings.enable_monthly_overtime && standardPool > settings.monthly_overtime_threshold_hrs) {
      regularHrs = settings.monthly_overtime_threshold_hrs;
      thresholdOT = standardPool - settings.monthly_overtime_threshold_hrs;
    }

    // Final Rates
    const totalOT15 = thresholdOT + premiumPool15;
    const totalOT20 = premiumPool20;

    // Adjustments
    const getAdj = (type) => empAdj.filter(a => a.adjustment_type === type).reduce((acc, a) => acc + parseFloat(a.amount), 0);

    return {
      employee_number: emp.employee_number,
      name: `${emp.first_name} ${emp.last_name}`,
      regular_hours: regularHrs.toFixed(1),
      overtime_15: totalOT15.toFixed(1),
      overtime_20: totalOT20.toFixed(1),
      night_differential: nightHrs.toFixed(1),
      paid_leave_hrs: empLeave.filter(l => l.status === 'Approved' && l.leave_type !== 'Unpaid Leave').length * 8,
      unpaid_leave_hrs: empLeave.filter(l => l.leave_type === 'Unpaid Leave').length * 8,
      tips_cc: getAdj('CC Tip'),
      tronc: getAdj('Tronc'),
      allowances: getAdj('Travel') + getAdj('Uniform') + getAdj('Meal'),
      bank_changed: emp.bank_details_updated_at && emp.bank_details_updated_at >= startDate ? 'YES' : 'NO',
      new_hire: emp.start_date >= startDate ? 'YES' : 'NO',
      terminated: emp.end_date && emp.end_date <= endDate ? emp.end_date : 'NO'
    };
  });
};
