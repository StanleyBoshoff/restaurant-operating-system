import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getSaHolidaysForYear } from '../../utils/saHolidayEngine';

export default function TabLeave({ employee }) {
  const [hoursLog, setHoursLog] = useState([]);
  const [leaveLog, setLeaveLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📝 Hours Capture States
  const [hoursInput, setHoursInput] = useState('');
  const [weekEnding, setWeekEnding] = useState('');

  // 🧳 Leave Booking States
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedTotals, setCalculatedTotals] = useState({ totalDays: 0, deductedDays: 0 });

  // Aggregated calculations based on BCEA 1:17 rule layout
  const totalHoursWorked = hoursLog.reduce((acc, row) => acc + parseFloat(row.hours_worked), 0);
  const totalLeaveEarnedHours = hoursLog.reduce((acc, row) => acc + parseFloat(row.leave_hours_earned), 0);
  const totalLeaveTakenDays = leaveLog.reduce((acc, row) => acc + row.total_statutory_days_deducted, 0);
  const netLeaveDaysAvailable = (totalLeaveEarnedHours / 8) - totalLeaveTakenDays;

  const fetchData = async () => {
    if (!employee?.id) return;
    try {
      setLoading(true);
      const { data: hours } = await supabase.from('employee_hours').select('*').eq('employee_id', employee.id).order('week_ending', { ascending: false });
      const { data: leave } = await supabase.from('employee_leave').select('*').eq('employee_id', employee.id).order('start_date', { ascending: false });
      setHoursLog(hours || []);
      setLeaveLog(leave || []);
    } catch (err) {
      console.error('Failed to stream data metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [employee?.id]);

  // 🇿🇦 Real-Time Statutory Exclusion Calculator
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedTotals({ totalDays: 0, deductedDays: 0 });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setCalculatedTotals({ totalDays: 0, deductedDays: 0 });
      return;
    }

    // Pull calculated automated public holidays for the target calendar year
    const year = start.getFullYear();
    const holidaysForYear = getSaHolidaysForYear(year);
    const holidayDatesSet = new Set(holidaysForYear.map(h => h.date));

    let runningTotalDays = 0;
    let runningDeductedDays = 0;

    // Loop through the selected date range day-by-day
    let currentDay = new Date(start);
    while (currentDay <= end) {
      runningTotalDays++;
      const currentDayISO = currentDay.toISOString().split('T')[0];

      // If it is a public holiday, skip deducting it from the employee's balance
      if (holidayDatesSet.has(currentDayISO)) {
        // Intersecting statutory day found: skip deduction
      } else {
        runningDeductedDays++;
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalculatedTotals({ totalDays: runningTotalDays, deductedDays: runningDeductedDays });
  }, [startDate, endDate]);

  const handleLogHours = async (e) => {
    e.preventDefault();
    if (!hoursInput || !weekEnding) return alert('Please complete all tracking lines.');
    try {
      const { error } = await supabase.from('employee_hours').insert([{
        employee_id: employee.id,
        week_ending: weekEnding,
        hours_worked: parseFloat(hoursInput)
      }]);
      if (error) throw error;
      setHoursInput('');
      setWeekEnding('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBookLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveType) return alert('Please provide a complete date range.');
    if (new Date(endDate) < new Date(startDate)) return alert('End date cannot precede start date.');

    try {
      const { error } = await supabase.from('employee_leave').insert([{
        employee_id: employee.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days_requested: calculatedTotals.totalDays,
        total_statutory_days_deducted: calculatedTotals.deductedDays,
        status: 'Approved' // Auto-approving for direct management overrides
      }]);

      if (error) throw error;

      alert('Leave block successfully captured and synchronized with dashboard.');
      setStartDate('');
      setEndDate('');
      fetchData();
    } catch (err) {
      alert(`Booking failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* 📊 Metrics Summary Banner Dashboard View */}
      <div className="grid grid-cols-3 gap-4 bg-slate-900 text-white p-4 rounded-xl shadow-xs">
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Total Hours log</span>
          <span className="text-lg font-bold">{totalHoursWorked.toFixed(1)} Hrs</span>
        </div>
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Accrued Leave Earned</span>
          <span className="text-lg font-bold text-yellow-500">{totalLeaveEarnedHours.toFixed(1)} Paid Hrs</span>
        </div>
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Net Available Balance</span>
          <span className="text-lg font-bold text-emerald-400">{netLeaveDaysAvailable.toFixed(2)} Days</span>
        </div>
      </div>

      {/* 🛠️ Dual Operations Panel Split Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Hand Actions Stack Column Container */}
        <div className="space-y-6">
          
          {/* Action Module 1: Leave Booking Entry Form Formulator */}
          <form onSubmit={handleBookLeave} className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs">
            <h4 className="font-semibold text-slate-800 text-sm border-b pb-2">Log Leave Request</h4>
            
            <div>
              <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Leave Designation Category</label>
              <select 
                value={leaveType} 
                onChange={e => setLeaveType(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Family Responsibility">Family Responsibility</option>
                <option value="Maternity">Maternity</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none" />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none" />
              </div>
            </div>

            {/* Real-time automated calculations box display */}
            {calculatedTotals.totalDays > 0 && (
              <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1 animate-fade-in">
                <div className="flex justify-between">
                  <span>Total Calendar Span Days:</span>
                  <span className="font-bold">{calculatedTotals.totalDays} Days</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Statutory Deducted Days:</span>
                  <span className="font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded-sm">{calculatedTotals.deductedDays} Days</span>
                </div>
                {calculatedTotals.totalDays !== calculatedTotals.deductedDays && (
                  <p className="text-[10px] text-slate-500 italic mt-1 pt-1 border-t border-amber-200/50">
                    * Net deduction drops automatically due to intersecting statutory South African public holiday calendars.
                  </p>
                )}
              </div>
            )}

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-medium transition-colors cursor-pointer shadow-3xs">
              Authorize Leave Block
            </button>
          </form>

          {/* Action Module 2: Quick Hours Capture Tracker Panel Container */}
          <form onSubmit={handleLogHours} className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs">
            <h4 className="font-semibold text-slate-800 text-sm border-b pb-2">Quick Hours Capture</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Week Ending Date</label>
                <input type="date" value={weekEnding} onChange={e => setWeekEnding(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none" />
              </div>
              <div>

                <label className="text-slate-400 block mb-1 font-semibold uppercase tracking-wider">Actual Hours Worked</label>
                <input type="number" step="0.1" placeholder="e.g., 45" value={hoursInput} onChange={e => setHoursInput(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-medium transition-colors cursor-pointer shadow-3xs">
              Save Hours Capture Entry
            </button>
          </form>
        </div>

        {/* Right Hand Historical Records Lists Stream Tracking Columns */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs space-y-4">
          <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] border-b pb-2">Employee Leave Allocation Ledger</h4>
          
          <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-center text-slate-400 italic py-4 animate-pulse">Syncing secure allocations ledger...</p>
            ) : leaveLog.length === 0 ? (
              <p className="p-6 text-slate-400 border border-dashed rounded-lg text-center bg-slate-50/50">No leave allocations logged on this personnel track profile.</p>
            ) : (
              leaveLog.map(leaveItem => (
                <div key={leaveItem.id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between gap-4 bg-slate-50/30">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm block">{leaveItem.leave_type}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {new Date(leaveItem.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - {new Date(leaveItem.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">{leaveItem.total_statutory_days_deducted} Days</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider inline-block mt-0.5">{leaveItem.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
