import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Timer, Users, Activity, Clock, Coffee, RefreshCw, CheckCircle, PieChart, Briefcase, TrendingUp, Search, Download, Wifi, WifiOff, LogOut, Power } from 'lucide-react';
import { calculateDuration, calculateDurationWithSettings, clockOut } from '../../utils/timesheetService';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function TabOverview() {
  const { user: currentUser } = useAuth();
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [debugCount, setDebugCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [now, setNow] = useState(new Date());
  const [lastSync, setLastSync] = useState(new Date());
  const [rtStatus, setRtStatus] = useState('CONNECTING'); // CONNECTING, SUBSCRIBED, ERROR

  const [payrollSettings, setPayrollSettings] = useState(null);

  const isAdmin = currentUser?.role_data?.authority_level >= 10;

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('company_payroll_settings').select('*').single();
      setPayrollSettings(data);
    };
    fetchSettings();
  }, []);

  // Update 'now' every minute to keep live hours accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. Fetch Today's Full Attendance List
  const fetchDailyAttendance = useCallback(async () => {
    setLiveLoading(true);
    try {
      const localToday = new Date().toLocaleDateString('sv-SE');

      const { data: shifts, error: sErr } = await supabase
        .from('employee_timesheets')
        .select('*')
        .or(`status.neq.Completed,shift_date.eq.${localToday},clock_out.gte.${localToday}T00:00:00Z`);

      if (sErr) throw sErr;

      if (!shifts || shifts.length === 0) {
        setDailyAttendance([]);
        setDebugCount(0);
        return;
      }

      const empIds = [...new Set(shifts.map(s => s.employee_id))];
      const { data: emps, error: eErr } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, department')
        .in('id', empIds);

      if (eErr) throw eErr;

      const formatted = shifts.map(s => {
        const emp = emps?.find(e => e.id === s.employee_id);
        return {
          ...s,
          emp_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Staff',
          emp_role: emp?.role || 'Staff',
          emp_dept: emp?.department || 'Unassigned',
          emp_initials: emp ? `${emp.first_name[0]}${emp.last_name[0]}` : '??'
        };
      });

      const statusWeight = { 'Active': 0, 'On Break': 1, 'Completed': 2 };
      formatted.sort((a, b) => {
        if (statusWeight[a.status] !== statusWeight[b.status]) {
          return statusWeight[a.status] - statusWeight[b.status];
        }
        return new Date(b.clock_in) - new Date(a.clock_in);
      });

      setDailyAttendance(formatted);
      setDebugCount(formatted.length);
      setLastSync(new Date());
    } catch (err) {
      console.error("Daily attendance fetch error:", err.message);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // 2. Hardened Real-time Subscription
  useEffect(() => {
    fetchDailyAttendance();

    const channel = supabase
      .channel('attendance-master-monitor-v2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employee_timesheets' },
        (payload) => {
          console.log("⚡ [LIVE] Change Detected:", payload.eventType);
          fetchDailyAttendance();
        }
      )
      .subscribe((status) => {
        console.log("🔗 Real-time Status:", status);
        setRtStatus(status);
        if (status === 'TIMED_OUT' || status === 'CLOSED') {
           setTimeout(() => fetchDailyAttendance(), 2000);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDailyAttendance]);

  const handleManualClockOut = async (shift) => {
    if (!window.confirm(`Are you sure you want to clock out ${shift.emp_name} manually?`)) return;

    try {
      setLiveLoading(true);
      await clockOut(shift.id);
      await fetchDailyAttendance();
    } catch (err) {
      alert("Manual clock out failed: " + err.message);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleClockOutAll = async () => {
    const activeOnes = dailyAttendance.filter(s => s.status !== 'Completed');
    if (activeOnes.length === 0) {
      alert("No active shifts to clock out.");
      return;
    }

    if (!window.confirm(`Force clock out all ${activeOnes.length} currently active staff members?`)) return;

    try {
      setLiveLoading(true);
      // Perform sequential clock outs to ensure all are processed
      for (const shift of activeOnes) {
        await clockOut(shift.id);
      }
      await fetchDailyAttendance();
      alert("All active staff have been clocked out.");
    } catch (err) {
      alert("Batch clock out failed: " + err.message);
    } finally {
      setLiveLoading(false);
    }
  };

  const filteredData = dailyAttendance.filter(shift =>
    shift.emp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shift.emp_dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const liveStats = useMemo(() => {
    const stats = { totalHours: 0, activeCount: 0, onBreakCount: 0, completedCount: 0, byDept: {} };
    dailyAttendance.forEach(s => {
      const breakToDeduct = (s.break_start && s.break_end) ? (new Date(s.break_end) - new Date(s.break_start)) / 60000 : 0;
      const dur = parseFloat(calculateDurationWithSettings(s.clock_in, s.clock_out || now.toISOString(), payrollSettings, s.break_start, s.break_end));
      stats.totalHours += dur;
      if (s.status === 'Active') stats.activeCount++;
      else if (s.status === 'On Break') stats.onBreakCount++;
      else if (s.status === 'Completed') stats.completedCount++;
      const dept = s.emp_dept || 'Other';
      if (!stats.byDept[dept]) stats.byDept[dept] = 0;
      stats.byDept[dept] += dur;
    });
    return stats;
  }, [dailyAttendance, now, payrollSettings]);

  const formatMins = (minutes) => {
    if (!minutes || minutes < 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* 🟢 LIVE SNAPSHOT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-xl flex flex-col justify-between min-h-[160px]">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Shift Hours</p>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                 <Activity size={16} className="animate-pulse" />
              </div>
           </div>
           <div>
              <h2 className="text-5xl font-black tracking-tighter">{liveStats.totalHours.toFixed(1)}</h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{liveStats.activeCount} ON FLOOR</span>
                 </div>
                 <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter">{liveStats.onBreakCount} BREAK</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <Briefcase size={14} className="text-slate-400" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Departmental Performance (Daily Live)</p>
              </div>
              <div className="flex items-center gap-2">
                 {rtStatus === 'SUBSCRIBED' ? (
                   <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg border border-emerald-100 uppercase animate-in fade-in">
                      <Wifi size={10} /> Real-time Link: Connected
                   </span>
                 ) : (
                   <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black rounded-lg border border-slate-100 uppercase italic">
                      <WifiOff size={10} /> Real-time Link: {rtStatus}...
                   </span>
                 )}
              </div>
           </div>
           <div className="flex flex-wrap gap-x-12 gap-y-6">
              {Object.entries(liveStats.byDept).map(([dept, hours]) => (
                <div key={dept} className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{dept}</span>
                   <span className="text-2xl font-black text-slate-900 leading-none">
                      {hours.toFixed(1)}<span className="text-[10px] ml-1 text-slate-400 font-bold uppercase">hrs</span>
                   </span>
                </div>
              ))}
              {Object.keys(liveStats.byDept).length === 0 && (
                <div className="flex items-center gap-2 opacity-30 italic py-2">
                   <Users size={16} />
                   <p className="text-xs font-bold uppercase tracking-widest">Awaiting workforce clock-in data...</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* 🔍 SEARCH & LOG HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input
             type="text"
             placeholder="Search staff, role or department..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-yellow-500/50 outline-none transition-all shadow-3xs"
           />
        </div>
        <div className="flex items-center gap-3">
           {isAdmin && (
             <button onClick={handleClockOutAll} className="bg-rose-600 px-4 py-3 rounded-2xl border border-rose-700 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-lg">
                <Power size={14} />
                Clock Out All
             </button>
           )}
           <button onClick={fetchDailyAttendance} className="bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all active:scale-95 shadow-md">
              <RefreshCw size={12} className={liveLoading ? "animate-spin" : ""} />
              Force Refresh
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-200 transition-all active:scale-95 border border-slate-200">
              <Download size={14} />
              Export Log
           </button>
        </div>
      </div>

      {/* 🔵 DAILY ATTENDANCE LOG */}
      <SummaryCard
        title={
          <div className="flex items-center gap-3">
             <Clock className="text-yellow-600" size={18} />
             <span className="font-black text-slate-900 tracking-tight">Daily Performance Log</span>
             <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-800">
                <Activity size={10} className={dailyAttendance.some(s => s.status !== 'Completed') ? "text-emerald-500 animate-pulse" : ""} />
                Live Sync: {debugCount}
             </div>
          </div>
        }
      >
        {dailyAttendance.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/20">
            <Timer size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="text-base text-slate-400 font-black uppercase tracking-widest">No shift records for today</p>
            <p className="text-[10px] text-slate-300 uppercase mt-2 font-bold tracking-[0.3em]">System heart monitoring active</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6 no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-y border-slate-100 backdrop-blur-sm">
                  <th className="pl-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Session Period</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Break</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Net Hours</th>
                  <th className="pr-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map(shift => {
                  const isLive = shift.status !== 'Completed';
                  let breakDisplay = '--';
                  let breakColor = 'text-slate-300';
                  if (shift.status === 'On Break' && shift.break_start) {
                    const breakMins = (now - new Date(shift.break_start)) / 60000;
                    breakDisplay = `Active: ${formatMins(breakMins)}`;
                    breakColor = 'text-amber-600 font-black animate-pulse';
                  } else if (shift.break_start && shift.break_end) {
                    const totalBreakMins = (new Date(shift.break_end) - new Date(shift.break_start)) / 60000;
                    breakDisplay = `Took ${formatMins(totalBreakMins)}`;
                    breakColor = 'text-slate-500 font-bold';
                  }
                  const duration = calculateDurationWithSettings(shift.clock_in, shift.clock_out || now.toISOString(), payrollSettings, shift.break_start, shift.break_end);
                  return (
                    <tr key={shift.id} className={`hover:bg-slate-50/50 transition-colors group ${shift.status === 'Completed' ? 'bg-slate-50/20' : ''}`}>
                      <td className="pl-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[12px] ${
                            shift.status === 'On Break' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                            shift.status === 'Completed' ? 'bg-white text-slate-400 border border-slate-100' :
                            'bg-slate-900 text-emerald-400 shadow-xl shadow-slate-900/10 border border-slate-800'
                          } uppercase transition-transform group-hover:scale-110`}>
                            {shift.emp_initials}
                          </div>
                          <div>
                            <p className={`text-xs font-black leading-tight uppercase tracking-tight ${shift.status === 'Completed' ? 'text-slate-400' : 'text-slate-900'}`}>{shift.emp_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{shift.emp_role}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded-full">{shift.emp_dept}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <div className="flex justify-center">
                           {shift.status === 'Active' && <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 shadow-3xs"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />ON DUTY</span>}
                           {shift.status === 'On Break' && <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100 shadow-3xs"><Coffee size={12} />BREAKING</span>}
                           {shift.status === 'Completed' && <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-400 text-[10px] font-black border border-slate-100 shadow-3xs"><CheckCircle size={12} />FINISHED</span>}
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-700 uppercase">
                               <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-3xs">{new Date(shift.clock_in).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                               <span className="text-slate-300 font-normal">→</span>
                               <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-3xs">{shift.clock_out ? new Date(shift.clock_out).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : 'NOW'}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                         <div className={`text-[10px] flex items-center justify-center gap-2 ${breakColor}`}>
                            {shift.status === 'On Break' && <RefreshCw size={12} className="animate-spin" />}
                            {breakDisplay}
                         </div>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-lg font-black tracking-tighter ${isLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {duration} <span className="text-[10px] font-bold text-slate-300 uppercase ml-0.5">hrs</span>
                          </span>
                          {isLive && <span className="text-[8px] font-black text-emerald-500/70 uppercase tracking-widest animate-pulse">Running Feed</span>}
                        </div>
                      </td>
                      <td className="pr-8 py-6 text-right">
                         {isLive && isAdmin && (
                           <button
                             onClick={() => handleManualClockOut(shift)}
                             className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100"
                             title="Force Clock Out"
                           >
                             <LogOut size={16} />
                           </button>
                         )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SummaryCard>

      <div className="flex items-center justify-between px-2 opacity-50">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Last Table Refresh: {lastSync.toLocaleTimeString('en-ZA')}
         </p>
         <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Replica Identity: FULL</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encryption: AES-256</span>
         </div>
      </div>
    </div>
  );
}
