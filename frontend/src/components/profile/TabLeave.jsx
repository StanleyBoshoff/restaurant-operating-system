import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getSaHolidaysForYear } from '../../utils/saHolidayEngine';
import {
  calculateAnnualLeave,
  calculateSickLeave,
  calculateFamilyLeave,
  projectAnnualBalance
} from '../../utils/leaveEngine';
import { requiresProof } from '../../utils/notificationService';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { Calendar, FileUp, Info, AlertCircle, TrendingUp } from 'lucide-react';

export default function TabLeave({ employee }) {
  const [leaveLog, setLeaveLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧳 Leave Booking States
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [calculatedTotals, setCalculatedTotals] = useState({ totalDays: 0, deductedDays: 0 });

  const fetchData = async () => {
    if (!employee?.id) return;
    try {
      setLoading(true);
      const { data: leave } = await supabase
        .from('employee_leave')
        .select('*')
        .eq('employee_id', employee.id)
        .order('start_date', { ascending: false });
      setLeaveLog(leave || []);
    } catch (err) {
      console.error('Failed to stream leave metrics:', err.message);
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

    const year = start.getFullYear();
    const holidaysForYear = getSaHolidaysForYear(year);
    const holidayDatesSet = new Set(holidaysForYear.map(h => h.date));

    let runningTotalDays = 0;
    let runningDeductedDays = 0;

    let currentDay = new Date(start);
    while (currentDay <= end) {
      runningTotalDays++;
      const currentDayISO = currentDay.toISOString().split('T')[0];
      if (!holidayDatesSet.has(currentDayISO)) {
        runningDeductedDays++;
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }

    setCalculatedTotals({ totalDays: runningTotalDays, deductedDays: runningDeductedDays });
  }, [startDate, endDate]);

  const handleBookLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveType) return alert('Please provide a complete date range.');

    const needsProof = requiresProof(leaveType, calculatedTotals.deductedDays);
    if (needsProof && !attachment) {
      return alert(`Mandatory Document Required: Please upload a ${leaveType === 'Sick Leave' ? 'medical certificate' : 'proof document'} for this request.`);
    }

    try {
      setIsSubmitting(true);

      let attachmentUrl = null;
      if (attachment) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${employee.id}/leave_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('employee-files')
          .upload(fileName, attachment);
        if (uploadError) throw uploadError;
        attachmentUrl = fileName;
      }

      const { error } = await supabase.from('employee_leave').insert([{
        employee_id: employee.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days_requested: calculatedTotals.totalDays,
        total_statutory_days_deducted: calculatedTotals.deductedDays,
        status: 'Pending',
        attachment_url: attachmentUrl
      }]);

      if (error) throw error;

      alert('Leave request submitted for HR approval.');
      setStartDate('');
      setEndDate('');
      setAttachment(null);
      fetchData();
    } catch (err) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const annualBalance = calculateAnnualLeave(employee, leaveLog);
  const sickBalance = calculateSickLeave(employee, leaveLog);
  const familyBalance = calculateFamilyLeave(employee, leaveLog);
  const projectedBalance = startDate ? projectAnnualBalance(employee, leaveLog, new Date(startDate)) : null;

  return (
    <div className="space-y-6 text-xs">
      
      {/* 📊 Balance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Annual Leave" badge={<StatusBadge status="Available" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-yellow-600">{annualBalance.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Days Available</span>
            {projectedBalance && projectedBalance !== annualBalance && (
              <div className="mt-2 flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 animate-pulse">
                <TrendingUp size={12} />
                <span>Projected {projectedBalance.toFixed(2)} on start date</span>
              </div>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Sick Leave" badge={<StatusBadge status={sickBalance > 0 ? "Good" : "Exhausted"} />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900">{sickBalance}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Cycle Balance</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Family Responsibility" badge={<StatusBadge status="Yearly" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900">{familyBalance}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Remaining for {new Date().getFullYear()}</span>
          </div>
        </SummaryCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📝 Booking Form */}
        <form onSubmit={handleBookLeave} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
            <Calendar className="text-yellow-600" size={18} />
            <h4 className="font-bold text-slate-900 text-sm">Request Leave Period</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-slate-400 block mb-1.5 font-bold uppercase tracking-widest text-[9px]">Leave Designation</label>
              <select 
                value={leaveType} 
                onChange={e => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-600/5 transition-all text-sm font-medium"
              >
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Family Responsibility">Family Responsibility</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-bold uppercase tracking-widest text-[9px]">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1.5 font-bold uppercase tracking-widest text-[9px]">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-sm font-medium" />
            </div>
          </div>

          {requiresProof(leaveType, calculatedTotals.deductedDays) && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <AlertCircle size={14} />
                <span>Supporting Proof Required</span>
              </div>
              <p className="text-[10px] text-rose-600 leading-tight">
                BCEA policy requires a medical certificate or formal proof for this leave type/duration.
              </p>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 cursor-pointer"
              />
            </div>
          )}

          {calculatedTotals.totalDays > 0 && (
            <div className="p-3 bg-slate-900 rounded-xl text-[11px] text-white space-y-1 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Calendar Days:</span>
                <span className="font-bold">{calculatedTotals.totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">BCEA Deductible Days:</span>
                <span className="font-bold text-yellow-500">{calculatedTotals.deductedDays}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Request...' : 'Submit Request for Approval'}
          </button>
        </form>

        {/* 📜 History Ledger */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <Info className="text-slate-400" size={18} />
              <h4 className="font-bold text-slate-900 text-sm">Leave History</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{leaveLog.length} Records</span>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-center text-slate-400 italic py-8 animate-pulse">Syncing allocations ledger...</p>
            ) : leaveLog.length === 0 ? (
              <div className="p-8 text-slate-400 border border-dashed rounded-xl text-center bg-slate-50/50">
                No leave requests found on this profile.
              </div>
            ) : (
              leaveLog.map(leaveItem => (
                <div key={leaveItem.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-4 bg-slate-50/30 hover:bg-white transition-all border-l-4 border-l-slate-200">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-slate-800 text-sm block truncate">{leaveItem.leave_type}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {new Date(leaveItem.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - {new Date(leaveItem.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 block">{leaveItem.total_statutory_days_deducted} Days</span>
                    <StatusBadge status={leaveItem.status} />
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
