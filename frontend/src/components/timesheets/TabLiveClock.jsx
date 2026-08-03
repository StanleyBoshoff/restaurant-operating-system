import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Timer, User, Clock as ClockIcon, Coffee, LogOut, CheckCircle, Search } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { clockIn, clockOut, toggleBreak, getActiveTimesheet, getEmployeeTimesheetStats } from '../../utils/timesheetService';
import StatusBadge from '../common/StatusBadge';

export default function TabLiveClock() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [empStats, setEmpStats] = useState({ weeklyHours: '0.0', weeklyOvertime: '0.0', punctuality: 100 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnLeaveToday, setIsOnLeaveToday] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employees for selection
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('id, first_name, last_name, role, branch');
      setEmployees(data || []);
    };
    fetchEmployees();
  }, []);

  // When an employee is selected, check for active shifts & stats
  useEffect(() => {
    if (selectedEmployee) {
      loadActiveShift(selectedEmployee.id);
      loadEmployeeStats(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const loadActiveShift = async (employeeId) => {
    setLoading(true);
    try {
      // Check for active shift
      const shift = await getActiveTimesheet(employeeId);
      setActiveShift(shift);

      // Check for approved leave today
      const today = new Date().toISOString().split('T')[0];
      const { data: leave } = await supabase
        .from('employee_leave')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'Approved')
        .lte('start_date', today)
        .gte('end_date', today);

      setIsOnLeaveToday(leave && leave.length > 0);

    } catch (err) {
      console.error("Failed to load shift:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeStats = async (employeeId) => {
    try {
      const stats = await getEmployeeTimesheetStats(employeeId);
      setEmpStats(stats);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const shift = await clockIn(selectedEmployee.id, selectedEmployee.branch || 'Main Branch');
      setActiveShift(shift);
      loadEmployeeStats(selectedEmployee.id);
    } catch (err) {
      alert("Clock-in failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeShift) return;
    setLoading(true);
    try {
      await clockOut(activeShift.id);
      setActiveShift(null);
      loadEmployeeStats(selectedEmployee.id);
      alert("Shift completed successfully.");
    } catch (err) {
      alert("Clock-out failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    if (!activeShift) return;
    const isStarting = activeShift.status === 'Active';
    setLoading(true);
    try {
      const updated = await toggleBreak(activeShift.id, isStarting);
      setActiveShift(updated);
    } catch (err) {
      alert("Break update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* 1. Employee Selector */}
      <div className="lg:col-span-1 space-y-4">
        <SummaryCard title="Staff Login" icon={User}>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between group transition-all ${
                    selectedEmployee?.id === emp.id ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      selectedEmployee?.id === emp.id ? 'bg-yellow-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{emp.first_name} {emp.last_name}</p>
                      <p className="text-[10px] opacity-70">{emp.role}</p>
                    </div>
                  </div>
                  {selectedEmployee?.id === emp.id && <CheckCircle size={14} className="text-yellow-600" />}
                </button>
              ))}
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* 2. Clock Interface */}
      <div className="lg:col-span-2 space-y-6">
        <SummaryCard
          title="Terminal Display"
          icon={Timer}
          badge={<StatusBadge status={isOnLeaveToday ? 'On Approved Leave' : (activeShift?.status || 'Offline')} />}
        >
          {!selectedEmployee ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
              <User size={48} className="text-slate-200 mb-4" />
              <h4 className="text-sm font-bold text-slate-800">Please Select an Employee</h4>
              <p className="text-[10px] text-slate-400 max-w-xs">Select your name from the registry on the left to access the clocking terminal.</p>
            </div>
          ) : isOnLeaveToday ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mb-4 shadow-inner border border-rose-100">
                <Lock size={32} />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase">Clocking Restricted</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mt-2 font-medium">
                You are currently on approved statutory leave. Terminal access is disabled until your scheduled return date.
              </p>
            </div>
          ) : (
            <div className="py-8 space-y-8">
              {/* Live Digital Clock */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <ClockIcon size={12} className="text-yellow-500" />
                  Live Store Time
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums">
                  {currentTime.toLocaleTimeString('en-ZA', { hour12: false })}
                </h1>
                <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">
                  {currentTime.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!activeShift ? (
                  <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="col-span-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-lg group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ClockIcon size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-widest">Clock In</p>
                      <p className="text-[10px] text-slate-400 font-medium">Start your shift at {selectedEmployee.branch || 'Main Branch'}</p>
                    </div>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleBreak}
                      disabled={loading}
                      className={`h-20 border-2 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group disabled:opacity-50 ${
                        activeShift.status === 'On Break'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        activeShift.status === 'On Break' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Coffee size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest">
                          {activeShift.status === 'On Break' ? 'End Break' : 'Start Break'}
                        </p>
                        <p className="text-[10px] opacity-70 font-medium italic">Record rest duration</p>
                      </div>
                    </button>

                    <button
                      onClick={handleClockOut}
                      disabled={loading}
                      className="h-20 bg-rose-50 border-2 border-rose-100 hover:bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] group disabled:opacity-50"
                    >
                      <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                        <LogOut size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest">Clock Out</p>
                        <p className="text-[10px] opacity-70 font-medium italic">Complete your shift</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeShift && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-2 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Currently Active
              </div>
              <div className="flex items-center gap-4">
                <span>Shift Start: {new Date(activeShift.clock_in).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
                {activeShift.break_start && <span>Break: Recorded</span>}
              </div>
            </div>
          )}
        </SummaryCard>

        {/* Attendance Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard title="Shift Stats" icon={ClockIcon}>
            <div className="py-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Weekly Total</p>
              <h3 className="text-2xl font-black text-slate-900">{empStats.weeklyHours} hrs</h3>
              <p className="text-[9px] text-green-600 font-bold mt-1 tracking-wider">+{empStats.weeklyOvertime} Overtime</p>
            </div>
          </SummaryCard>

          <SummaryCard title="Compliance" icon={CheckCircle}>
            <div className="py-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Punctuality Score</p>
              <h3 className="text-2xl font-black text-slate-900">{empStats.punctuality}%</h3>
              <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-wider italic">Excludes approved leave</p>
            </div>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
}
