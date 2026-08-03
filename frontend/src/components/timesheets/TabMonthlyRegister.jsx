import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import { CalendarDays, Save, User, ChevronLeft, ChevronRight, Calculator, Info, Lock, CheckCircle2, Clock, Monitor, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { upsertMonthlyRegister, upsertSingleShift, getPayrollSettings, calculateDurationWithSettings } from '../../utils/timesheetService';
import { canDo } from '../../utils/permissionService';

export default function TabMonthlyRegister({ lockedEmployeeId = null }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(lockedEmployeeId || '');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCycleDate, setCurrentCycleDate] = useState(new Date());
  const [payrollSettings, setPayrollSettings] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'

  // registerData holds values keyed by date 'YYYY-MM-DD'
  const [registerData, setRegisterData] = useState({});
  const [leaveRecords, setLeaveRecords] = useState([]);

  // Mock current user (In a real app, this comes from context)
  const currentUser = { id: 'MOCK-USER-UUID', role_data: { authority_level: 10 } };

  const isSelf = currentUser.id === selectedEmployeeId;
  const isMasterTech = currentUser.role_data?.authority_level >= 10;

  // Permissions
  const canEditDraft = canDo(currentUser, 'can_edit_attendance_register') && (!isSelf || isMasterTech);
  const canEditCommitted = canDo(currentUser, 'can_edit_committed_timesheets') && (!isSelf || isMasterTech);
  const canEditTerminal = canDo(currentUser, 'can_edit_terminal_records') && (!isSelf || isMasterTech);

  useEffect(() => {
    if (!lockedEmployeeId) fetchEmployees();
    fetchSettings();
  }, [lockedEmployeeId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchRegisterAndLeave();
    }
  }, [selectedEmployeeId, currentCycleDate]);

  const fetchSettings = async () => {
    const settings = await getPayrollSettings();
    setPayrollSettings(settings);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, first_name, last_name, employee_number').order('first_name');
    setEmployees(data || []);
    if (data?.length > 0 && !selectedEmployeeId) setSelectedEmployeeId(data[0].id);
  };

  const cycleDates = useMemo(() => {
    const dates = [];
    let start = new Date(currentCycleDate.getFullYear(), currentCycleDate.getMonth(), 21);
    if (currentCycleDate.getDate() < 21) start.setMonth(start.getMonth() - 1);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(20);

    let curr = new Date(start);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [currentCycleDate]);

  const fetchRegisterAndLeave = async () => {
    setLoading(true);
    try {
      const startISO = cycleDates[0].toISOString().split('T')[0];
      const endISO = cycleDates[cycleDates.length - 1].toISOString().split('T')[0];

      const { data: timesheets } = await supabase
        .from('employee_timesheets')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .gte('clock_in', `${startISO}T00:00:00`)
        .lte('clock_in', `${endISO}T23:59:59`);

      const { data: leaves } = await supabase
        .from('employee_leave')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .eq('status', 'Approved')
        .lte('start_date', endISO)
        .gte('end_date', startISO);

      setLeaveRecords(leaves || []);

      const mapped = {};
      (timesheets || []).forEach(ts => {
        const dateKey = ts.clock_in.split('T')[0];
        mapped[dateKey] = {
          clockIn: ts.clock_in.split('T')[1].substring(0, 5),
          clockOut: ts.clock_out ? ts.clock_out.split('T')[1].substring(0, 5) : '',
          remarks: ts.notes || '',
          isCommitted: ts.is_committed,
          source: ts.record_source,
          dbRecord: ts
        };
      });

      (leaves || []).forEach(l => {
        let curr = new Date(l.start_date);
        const end = new Date(l.end_date);
        while (curr <= end) {
          const iso = curr.toISOString().split('T')[0];
          if (!mapped[iso]) mapped[iso] = {};
          mapped[iso].leaveType = l.leave_type;
          curr.setDate(curr.getDate() + 1);
        }
      });

      setRegisterData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (dateKey, field, value) => {
    const existing = registerData[dateKey];

    // Check Source Integrity
    const isTerminalRecord = existing?.source === 'Terminal';
    if (isTerminalRecord && !canEditTerminal) {
      alert("Terminal records can only be modified by HR / Master Technician.");
      return;
    }

    // Check Commitment State
    const canModify = existing?.isCommitted ? canEditCommitted : canEditDraft;
    if (!canModify) return;

    setRegisterData(prev => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || { clockIn: '', clockOut: '', remarks: '', isCommitted: false, source: 'Manual' }),
        [field]: value
      }
    }));
  };

  const handleBlur = async (dateKey) => {
    const data = registerData[dateKey];
    if (!data || !data.clockIn || !data.clockOut) return;

    setSyncStatus('syncing');
    try {
      await upsertSingleShift({
        employee_id: selectedEmployeeId,
        shift_date: dateKey,
        clock_in: `${dateKey}T${data.clockIn}:00Z`,
        clock_out: `${dateKey}T${data.clockOut}:00Z`,
        notes: data.remarks || '',
        status: 'Completed',
        is_committed: data.isCommitted || false,
        record_source: data.source || 'Manual'
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error("Autosave failed:", err);
      setSyncStatus('error');
    }
  };

  const calcDailyHours = (dateKey) => {
    const d = registerData[dateKey];
    if (!d || d.leaveType || !d.clockIn || !d.clockOut) return 0;

    return calculateDurationWithSettings(
      `2000-01-01T${d.clockIn}`,
      `2000-01-01T${d.clockOut}`,
      payrollSettings
    );
  };

  const handleSave = async (commit = false) => {
    setIsSaving(true);
    try {
      const records = Object.entries(registerData).map(([dateKey, vals]) => {
        if (!vals.clockIn || !vals.clockOut) return null;
        return {
          employee_id: selectedEmployeeId,
          shift_date: dateKey,
          clock_in: `${dateKey}T${vals.clockIn}:00Z`,
          clock_out: `${dateKey}T${vals.clockOut}:00Z`,
          notes: vals.remarks || '',
          status: 'Completed'
        };
      }).filter(Boolean);

      await upsertMonthlyRegister(records, commit);
      alert(commit ? "Register committed to payroll." : "Draft saved successfully.");
      fetchRegisterAndLeave(); // Refresh to get updated isCommitted state
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const rows = [];
  let weeklySubtotal = 0;
  cycleDates.forEach((date, index) => {
    const iso = date.toISOString().split('T')[0];
    const hours = parseFloat(calcDailyHours(iso));
    weeklySubtotal += hours;
    rows.push({ type: 'day', date, hours });
    if (date.getDay() === 0 || index === cycleDates.length - 1) {
      rows.push({ type: 'week_total', total: weeklySubtotal });
      weeklySubtotal = 0;
    }
  });

  const totalMonthlyHours = cycleDates.reduce((acc, date) => {
    const iso = date.toISOString().split('T')[0];
    return acc + parseFloat(calcDailyHours(iso));
  }, 0);

  const stats = useMemo(() => {
    const counts = { sick: 0, annual: 0, fr: 0 };
    Object.values(registerData).forEach(v => {
      if (v.leaveType === 'Sick Leave') counts.sick++;
      if (v.leaveType === 'Annual Leave') counts.annual++;
      if (v.leaveType === 'Family Responsibility') counts.fr++;
    });
    return counts;
  }, [registerData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Top Controller / Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest">Attendance Register</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Cycle: 21st to 20th</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!lockedEmployeeId && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500 min-w-[200px]"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
             <button onClick={() => setCurrentCycleDate(new Date(currentCycleDate.setMonth(currentCycleDate.getMonth() - 1)))} className="p-1.5 hover:bg-slate-700 rounded-lg transition-all"><ChevronLeft size={16}/></button>
             <span className="px-3 text-[10px] font-black uppercase">{cycleDates[0].toLocaleDateString('en-ZA', { month: 'short' })} / {cycleDates[cycleDates.length-1].toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })}</span>
             <button onClick={() => setCurrentCycleDate(new Date(currentCycleDate.setMonth(currentCycleDate.getMonth() + 1)))} className="p-1.5 hover:bg-slate-700 rounded-lg transition-all"><ChevronRight size={16}/></button>
          </div>

          {canEditDraft && (
            <div className="flex items-center gap-3">
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
                {syncStatus === 'synced' && <Cloud size={14} className="text-emerald-400" />}
                {syncStatus === 'syncing' && <RefreshCw size={14} className="text-yellow-400 animate-spin" />}
                {syncStatus === 'error' && <CloudOff size={14} className="text-rose-400" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                  {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Saving...' : 'Sync Error'}
                </span>
              </div>

              <button
                onClick={() => handleSave(true)}
                disabled={isSaving || !selectedEmployeeId || syncStatus === 'syncing'}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Commit Month
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Register Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-40 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Date & Day</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100">Start Time</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100">End Time</th>
                <th className="w-32 px-4 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center bg-slate-50/50">Shift Total</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 text-center">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center animate-pulse italic text-slate-400">Loading payroll streams...</td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  if (row.type === 'week_total') {
                    return (
                      <tr key={`week-${idx}`} className="bg-slate-900 text-white font-black uppercase text-[10px]">
                        <td colSpan={3} className="px-6 py-2 text-right tracking-[0.2em] text-slate-400 border-r border-slate-800 text-[9px]">Weekly Aggregate</td>
                        <td className="px-4 py-2 text-center bg-yellow-600 text-yellow-950">{row.total.toFixed(2)}h</td>
                        <td className="bg-slate-800/50"></td>
                      </tr>
                    );
                  }

                  const date = row.date;
                  const iso = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-ZA', { weekday: 'long' });
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const data = registerData[iso] || { clockIn: '', clockOut: '', remarks: '', isCommitted: false, source: 'Manual' };
                  const dailyTotal = row.hours;

                  const isTerminalRecord = data.source === 'Terminal';

                  // Row locking logic based on State, Source and Permissions
                  const isRowLocked =
                    (data.isCommitted && !canEditCommitted) ||
                    (isTerminalRecord && !canEditTerminal) ||
                    (!data.isCommitted && !isTerminalRecord && !canEditDraft);

                  return (
                    <tr key={iso} className={`hover:bg-slate-50 transition-colors ${isWeekend ? 'bg-slate-50/30' : ''} ${data.isCommitted ? 'bg-indigo-50/10' : ''}`}>
                      <td className="px-6 py-2.5 border-r border-slate-100 bg-white sticky left-0 z-10">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-[11px] font-black text-slate-900">{date.getDate()} {date.toLocaleDateString('en-ZA', { month: 'short' })}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{dayName}</p>
                           </div>
                           <div className="flex items-center gap-1">
                             {isTerminalRecord && <Monitor size={10} className="text-blue-500" title="Terminal Record" />}
                             {data.isCommitted && <Lock size={10} className="text-indigo-500" title="Committed" />}
                             {data.leaveType && (
                               <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[7px] font-black uppercase tracking-widest border border-rose-100">
                                 {data.leaveType.split(' ')[0]}
                               </span>
                             )}
                           </div>
                        </div>
                      </td>
                      {data.leaveType ? (
                        <td colSpan={2} className="px-6 py-2.5 text-center italic text-slate-300 font-bold uppercase text-[9px] tracking-widest border-r border-slate-100">
                           Approved statutory {data.leaveType}
                        </td>
                      ) : (
                        <>
                          <td className="px-2 py-2.5 border-r border-slate-100">
                            <input
                              type="time"
                              value={data.clockIn}
                              onChange={e => handleInputChange(iso, 'clockIn', e.target.value)}
                              onBlur={() => handleBlur(iso)}
                              readOnly={isRowLocked}
                              className={`w-full border rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-yellow-500 ${!isRowLocked ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent cursor-default'}`}
                            />
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-100">
                            <input
                              type="time"
                              value={data.clockOut}
                              onChange={e => handleInputChange(iso, 'clockOut', e.target.value)}
                              onBlur={() => handleBlur(iso)}
                              readOnly={isRowLocked}
                              className={`w-full border rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-yellow-500 ${!isRowLocked ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent cursor-default'}`}
                            />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-2.5 text-center bg-slate-50/30 border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${parseFloat(dailyTotal) > 0 ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-300'}`}>
                            {dailyTotal}h
                          </span>
                          {parseFloat(dailyTotal) >= (payrollSettings?.break_threshold_hrs || 5) && payrollSettings?.auto_deduct_lunch && (
                            <div className="group relative">
                              <Info size={10} className="text-slate-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 text-white text-[7px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 uppercase tracking-widest text-center">
                                {payrollSettings.lunch_duration_mins}min break auto-deducted
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                         <input
                           type="text"
                           placeholder="..."
                           value={data.remarks}
                           onChange={e => handleInputChange(iso, 'remarks', e.target.value)}
                           onBlur={() => handleBlur(iso)}
                           readOnly={isRowLocked}
                           className="w-full bg-transparent text-[10px] font-bold text-slate-500 outline-none placeholder:text-slate-200 text-center"
                         />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Aggregates */}
        <div className="bg-slate-900 p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-yellow-500">
                 <Calculator size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Monthly Summary</p>
                 <h2 className="text-3xl font-black">{totalMonthlyHours.toFixed(2)} <span className="text-sm text-slate-500 font-bold uppercase ml-2">Total Payroll Hours</span></h2>
              </div>
           </div>

           <div className="flex flex-wrap gap-4">
              <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Annual</p>
                 <p className="text-lg font-black text-blue-400">{stats.annual} <span className="text-[8px]">DAYS</span></p>
              </div>
              <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sick</p>
                 <p className="text-lg font-black text-rose-400">{stats.sick} <span className="text-[8px]">DAYS</span></p>
              </div>
              <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Family</p>
                 <p className="text-lg font-black text-emerald-400">{stats.fr} <span className="text-[8px]">DAYS</span></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
