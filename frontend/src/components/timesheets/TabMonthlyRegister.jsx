import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import { CalendarDays, Save, User, ChevronLeft, ChevronRight, Calculator, Info, Lock, CheckCircle2, Clock, Monitor, Cloud, CloudOff, RefreshCw, Coffee, AlertTriangle } from 'lucide-react';
import { upsertMonthlyRegister, upsertSingleShift, getPayrollSettings, calculateDurationWithSettings, getPayrollCycleRange, getPayrollCycleDates } from '../../utils/timesheetService';
import { canDo } from '../../utils/permissionService';
import { useAuth } from '../../context/AuthContext';

/**
 * Fast-Entry Time Input Component
 */
function FastTimeInput({
  value,
  onChange,
  onBlur,
  readOnly,
  className = '',
  inputRef,
  nextRef,
  clockPosition = 'start',
  clockTitle = 'Select time'
}) {
  const [localVal, setLocalVal] = useState(value || '');
  const pickerRef = useRef(null);

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    let raw = e.target.value;

    // Auto-format digits: e.g. '1020' -> '10:20'
    const digitsOnly = raw.replace(/\D/g, '');
    let formatted = raw;

    if (digitsOnly.length === 4 && !raw.includes(':')) {
      formatted = `${digitsOnly.substring(0, 2)}:${digitsOnly.substring(2, 4)}`;
    }

    setLocalVal(formatted);
    onChange(formatted);

    // Auto-jump condition: valid 5-char 'HH:MM' time entered
    if (formatted.length === 5 && /^\d{2}:\d{2}$/.test(formatted)) {
      onBlur();
      if (nextRef && nextRef.current) {
        setTimeout(() => {
          nextRef.current.focus();
          if (nextRef.current.select) nextRef.current.select();
        }, 40);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onBlur();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
        if (nextRef.current.select) nextRef.current.select();
      }
    }
  };

  const handleClockClick = (e) => {
    e.stopPropagation();
    if (readOnly) return;
    if (pickerRef.current) {
      if (typeof pickerRef.current.showPicker === 'function') {
        try {
          pickerRef.current.showPicker();
          return;
        } catch (err) {
          console.warn('showPicker error:', err);
        }
      }
      pickerRef.current.focus();
    }
  };

  const handlePickerChange = (e) => {
    const val = e.target.value || '';
    setLocalVal(val);
    onChange(val);
    if (onBlur) {
      setTimeout(() => {
        onBlur();
      }, 40);
    }
  };

  const validTimeForPicker = /^\d{2}:\d{2}$/.test(localVal) ? localVal : '';

  const renderClockButton = () => (
    <button
      type="button"
      tabIndex={readOnly ? -1 : 0}
      disabled={readOnly}
      onClick={handleClockClick}
      title={clockTitle}
      aria-label={clockTitle}
      className={`p-1 rounded text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 focus:text-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all shrink-0 ${
        readOnly ? 'cursor-not-allowed opacity-20 pointer-events-none' : 'cursor-pointer active:scale-90'
      }`}
    >
      <Clock size={12} />
    </button>
  );

  return (
    <div
      className={`relative flex items-center border rounded-md px-1 py-0.5 transition-all ${
        !readOnly
          ? 'bg-slate-50 border-slate-200 hover:border-slate-300 focus-within:ring-1 focus-within:ring-yellow-500 focus-within:border-yellow-500 focus-within:bg-white'
          : 'bg-transparent border-transparent'
      } ${className}`}
    >
      {clockPosition === 'start' && renderClockButton()}

      <input
        ref={inputRef}
        type="text"
        placeholder="--:--"
        maxLength={5}
        value={localVal}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        readOnly={readOnly}
        className="w-full min-w-0 bg-transparent text-[11px] font-black text-center outline-none"
      />

      {clockPosition === 'end' && renderClockButton()}

      {/* Hidden native time input for mouse picker popup */}
      <input
        ref={pickerRef}
        type="time"
        tabIndex={-1}
        aria-hidden="true"
        value={validTimeForPicker}
        onChange={handlePickerChange}
        style={{
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          pointerEvents: 'none',
          bottom: 0,
          left: clockPosition === 'start' ? '4px' : 'auto',
          right: clockPosition === 'end' ? '4px' : 'auto'
        }}
      />
    </div>
  );
}

export default function TabMonthlyRegister({ lockedEmployeeId = null }) {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(lockedEmployeeId || '');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentCycleDate, setCurrentCycleDate] = useState(new Date());
  const [payrollSettings, setPayrollSettings] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Ref registry for auto-jumping focus
  const inputRefs = useRef({});

  const getRef = (key) => {
    if (!inputRefs.current[key]) {
      inputRefs.current[key] = React.createRef();
    }
    return inputRefs.current[key];
  };

  const [registerData, setRegisterData] = useState({});
  const registerDataRef = useRef({});

  useEffect(() => {
    registerDataRef.current = registerData;
  }, [registerData]);

  const [leaveRecords, setLeaveRecords] = useState([]);

  const isSelf = currentUser?.id === selectedEmployeeId;
  const isSystemAdmin = currentUser?.role_data?.authority_level >= 11;
  const isMasterTech = currentUser?.role_data?.authority_level >= 10;

  // Permissions
  const canEditDraft = (isSystemAdmin || isMasterTech) || (canDo(currentUser, 'can_edit_attendance_register') && !isSelf);
  const canEditCommitted = (isSystemAdmin || isMasterTech) || (canDo(currentUser, 'can_edit_committed_timesheets') && !isSelf);
  const canEditTerminal = (isSystemAdmin || isMasterTech) || (canDo(currentUser, 'can_edit_terminal_records') && !isSelf);

  useEffect(() => {
    if (!lockedEmployeeId) fetchEmployees();
    fetchSettings();
  }, [lockedEmployeeId]);

  const cycleStartDay = payrollSettings?.payroll_cycle_start_day ?? 21;

  const cycleInfo = useMemo(() => {
    return getPayrollCycleRange(currentCycleDate, cycleStartDay);
  }, [currentCycleDate, cycleStartDay]);

  const cycleDates = useMemo(() => {
    return getPayrollCycleDates(currentCycleDate, cycleStartDay);
  }, [currentCycleDate, cycleStartDay]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchRegisterAndLeave();
    }
  }, [selectedEmployeeId, currentCycleDate, cycleStartDay]);

  const fetchSettings = async () => {
    const settings = await getPayrollSettings();
    setPayrollSettings(settings);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, first_name, last_name, employee_number').order('first_name');
    setEmployees(data || []);
    if (data?.length > 0 && !selectedEmployeeId) setSelectedEmployeeId(data[0].id);
  };

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

      registerDataRef.current = mapped;
      setRegisterData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (dateKey, field, value) => {
    const existing = registerDataRef.current[dateKey] || registerData[dateKey];
    if (!isSystemAdmin && !isMasterTech) {
        if (existing?.source === 'Terminal' && !canEditTerminal) return;
        if (existing?.isCommitted ? !canEditCommitted : !canEditDraft) return;
    }
    const updated = {
      ...(existing || { clockIn: '', clockOut: '', remarks: '', isCommitted: false, source: 'Manual' }),
      [field]: value
    };
    registerDataRef.current = {
      ...registerDataRef.current,
      [dateKey]: updated
    };
    setRegisterData(prev => ({
      ...prev,
      [dateKey]: updated
    }));
  };

  const handleBlur = async (dateKey) => {
    const data = registerDataRef.current[dateKey] || registerData[dateKey];
    if (!data || !data.clockIn) return;
    setSyncStatus('syncing');
    try {
      await upsertSingleShift({
        employee_id: selectedEmployeeId,
        shift_date: dateKey,
        clock_in: `${dateKey}T${data.clockIn}:00Z`,
        clock_out: data.clockOut ? `${dateKey}T${data.clockOut}:00Z` : null,
        notes: data.remarks || '',
        status: data.clockOut ? 'Completed' : 'Active',
        is_committed: data.isCommitted || false,
        record_source: data.source || 'Manual'
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  const formatMins = (minutes) => {
    if (!minutes || minutes < 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getEffectiveBreakMins = (dateKey) => {
    const d = registerData[dateKey];
    if (!d || !d.clockIn || !d.clockOut) return 0;

    const start = `2000-01-01T${d.clockIn}`;
    let end = `2000-01-01T${d.clockOut}`;
    let startTime = new Date(start);
    let endTime = new Date(end);
    if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

    const durationMinutes = (endTime - startTime) / 60000;
    let actualBreakMins = 0;
    if (d.dbRecord?.break_start && d.dbRecord?.break_end) {
      actualBreakMins = (new Date(d.dbRecord.break_end) - new Date(d.dbRecord.break_start)) / 60000;
    }

    if (payrollSettings?.auto_deduct_lunch) {
      const thresholdMins = (payrollSettings.break_threshold_hrs || 5) * 60;
      if (durationMinutes >= thresholdMins) {
        return Math.max(actualBreakMins, payrollSettings.lunch_duration_mins || 60);
      }
    }
    return actualBreakMins;
  };

  const calcDailyHours = (dateKey) => {
    const d = registerData[dateKey];
    if (!d || d.leaveType || !d.clockIn || !d.clockOut) return "0.00";
    return calculateDurationWithSettings(
      `2000-01-01T${d.clockIn}`,
      `2000-01-01T${d.clockOut}`,
      payrollSettings,
      d.dbRecord?.break_start,
      d.dbRecord?.break_end
    );
  };

  const handleSave = async (commit = false) => {
    setIsSaving(true);
    try {
      const records = Object.entries(registerData).map(([dateKey, vals]) => {
        if (!vals.clockIn) return null;
        return {
          employee_id: selectedEmployeeId,
          shift_date: dateKey,
          clock_in: `${dateKey}T${vals.clockIn}:00Z`,
          clock_out: vals.clockOut ? `${dateKey}T${vals.clockOut}:00Z` : null,
          notes: vals.remarks || '',
          status: vals.clockOut ? 'Completed' : 'Active',
          record_source: vals.source || 'Manual'
        };
      }).filter(Boolean);
      await upsertMonthlyRegister(records, commit);
      alert(commit ? "Register committed." : "Draft saved.");
      fetchRegisterAndLeave();
    } catch (err) {
      alert(err.message);
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

  const totalMonthlyHours = cycleDates.reduce((acc, date) => acc + parseFloat(calcDailyHours(date.toISOString().split('T')[0])), 0);

  const stats = useMemo(() => {
    const counts = { sick: 0, annual: 0, fr: 0 };
    Object.values(registerData).forEach(v => {
      if (v.leaveType === 'Sick Leave') counts.sick++;
      if (v.leaveType === 'Annual Leave') counts.annual++;
      if (v.leaveType === 'Family Responsibility') counts.fr++;
    });
    return counts;
  }, [registerData]);

  const dayRows = rows.filter(r => r.type === 'day');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 w-full overflow-hidden">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 p-5 rounded-[2rem] text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-widest leading-none mb-1">Attendance Register</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Cycle: {cycleInfo.cycleLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!lockedEmployeeId && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500">
                {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
             <button onClick={() => setCurrentCycleDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, Math.min(prev.getDate(), 28)))} className="p-1 hover:bg-slate-700 rounded-lg transition-all"><ChevronLeft size={14}/></button>
             <span className="px-2 text-[9px] font-black uppercase">{cycleInfo.shortLabel}</span>
             <button onClick={() => setCurrentCycleDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, Math.min(prev.getDate(), 28)))} className="p-1 hover:bg-slate-700 rounded-lg transition-all"><ChevronRight size={14}/></button>
          </div>
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
                {syncStatus === 'synced' ? <Cloud size={12} className="text-emerald-400" /> : syncStatus === 'syncing' ? <RefreshCw size={12} className="text-yellow-400 animate-spin" /> : <CloudOff size={12} className="text-rose-400" />}
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{syncStatus}</span>
              </div>
              {(isMasterTech || isSystemAdmin || canEditDraft) && (
                <button onClick={() => handleSave(true)} disabled={isSaving || !selectedEmployeeId || syncStatus === 'syncing'} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 shadow-md transition-all active:scale-95 disabled:opacity-50">
                  <CheckCircle2 size={12} /> Commit
                </button>
              )}
          </div>
        </div>
      </div>

      {/* 🚀 COMPACT FULL-WIDTH TABLE (NO MIN-WIDTH, NO HORIZONTAL SCROLL) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <th className="w-[20%] px-3 py-3 border-r border-slate-100">Date & Day</th>
              <th className="w-[18%] px-2 py-3 border-r border-slate-100 text-center">Start Time</th>
              <th className="w-[18%] px-2 py-3 border-r border-slate-100 text-center">End Time</th>
              <th className="w-[13%] px-2 py-3 border-r border-slate-100 text-center">Break</th>
              <th className="w-[13%] px-2 py-3 border-r border-slate-100 text-center bg-slate-50/50 text-slate-900">Net Total</th>
              <th className="w-[18%] px-2 py-3 text-center">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && rows.map((row, idx) => {
                if (row.type === 'week_total') {
                  return (
                    <tr key={`week-${idx}`} className="bg-slate-900 text-white font-black uppercase text-[9px]">
                      <td colSpan={4} className="px-3 py-2 text-right tracking-widest text-slate-400 border-r border-slate-800">Weekly Aggregate</td>
                      <td className="px-2 py-2 text-center bg-yellow-600 text-yellow-950 font-black">{row.total.toFixed(2)}h</td>
                      <td className="bg-slate-800/30"></td>
                    </tr>
                  );
                }
                const iso = row.date.toISOString().split('T')[0];
                const data = registerData[iso] || { clockIn: '', clockOut: '', remarks: '', isCommitted: false, source: 'Manual' };
                const breakMins = getEffectiveBreakMins(iso);
                const isWeekend = row.date.getDay() === 0 || row.date.getDay() === 6;
                const isLocked = !isSystemAdmin && !isMasterTech && (data.isCommitted || (data.source === 'Terminal' && !canEditTerminal));

                const currentDayIdx = dayRows.findIndex(r => r.date.toISOString().split('T')[0] === iso);
                const nextDayRow = dayRows[currentDayIdx + 1];
                const nextIso = nextDayRow ? nextDayRow.date.toISOString().split('T')[0] : null;

                const startRef = getRef(`start-${iso}`);
                const endRef = getRef(`end-${iso}`);
                const nextStartRef = nextIso ? getRef(`start-${nextIso}`) : null;

                return (
                  <tr key={iso} className={`hover:bg-slate-50 transition-colors ${isWeekend ? 'bg-slate-50/20' : ''}`}>
                    <td className="px-3 py-2 border-r border-slate-100 bg-white">
                       <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{row.date.getDate()} {row.date.toLocaleDateString('en-ZA', { month: 'short' })}</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{row.date.toLocaleDateString('en-ZA', { weekday: 'short' })}</p>
                    </td>
                    {data.leaveType ? (
                      <td colSpan={2} className="px-2 py-2 text-center italic text-slate-400 font-bold uppercase text-[8px] tracking-wider border-r border-slate-100">
                        {data.leaveType}
                      </td>
                    ) : (
                      <>
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          <FastTimeInput
                            inputRef={startRef}
                            nextRef={endRef}
                            value={data.clockIn}
                            onChange={val => handleInputChange(iso, 'clockIn', val)}
                            onBlur={() => handleBlur(iso)}
                            readOnly={isLocked}
                            clockPosition="start"
                            clockTitle="Select Start Time"
                          />
                        </td>
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          <FastTimeInput
                            inputRef={endRef}
                            nextRef={nextStartRef}
                            value={data.clockOut}
                            onChange={val => handleInputChange(iso, 'clockOut', val)}
                            onBlur={() => handleBlur(iso)}
                            readOnly={isLocked}
                            clockPosition="end"
                            clockTitle="Select End Time"
                          />
                        </td>
                      </>
                    )}
                    <td className="px-1 py-1.5 text-center border-r border-slate-100">
                       <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold text-slate-400">
                          <Coffee size={9} />
                          {breakMins > 0 ? formatMins(breakMins) : '--'}
                       </div>
                    </td>
                    <td className="px-1.5 py-1.5 text-center bg-slate-50/30 border-r border-slate-100">
                      <div className="flex items-center justify-center gap-0.5">
                        <span className={`px-1.5 py-0.5 rounded font-black text-[10px] ${parseFloat(row.hours) > 0 ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-300'}`}>{row.hours}h</span>
                        {parseFloat(row.hours) > 0 && payrollSettings?.auto_deduct_lunch && <Info size={9} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="px-1.5 py-1.5 text-center">
                       <input type="text" placeholder="..." value={data.remarks} onChange={e => handleInputChange(iso, 'remarks', e.target.value)} onBlur={() => handleBlur(iso)} readOnly={isLocked} className="w-full bg-transparent text-[9px] font-bold text-slate-500 outline-none text-center" />
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>

        {/* Master Summary Footer */}
        <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-yellow-500 shrink-0"><Calculator size={20} /></div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Monthly Summary</p>
                 <h2 className="text-2xl font-black">{totalMonthlyHours.toFixed(2)} <span className="text-xs text-slate-400 font-bold uppercase ml-1">Payroll Hrs</span></h2>
              </div>
           </div>
           <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                 <p className="text-[7px] font-black text-slate-400 uppercase">Annual</p>
                 <p className="text-sm font-black text-blue-400">{stats.annual} <span className="text-[7px]">DAYS</span></p>
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                 <p className="text-[7px] font-black text-slate-400 uppercase">Sick</p>
                 <p className="text-sm font-black text-rose-400">{stats.sick} <span className="text-[7px]">DAYS</span></p>
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                 <p className="text-[7px] font-black text-slate-400 uppercase">Family</p>
                 <p className="text-sm font-black text-emerald-400">{stats.fr} <span className="text-[7px]">DAYS</span></p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
