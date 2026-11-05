import React, { useState, useEffect, useMemo } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Wallet, Save, Info, AlertTriangle, Coffee, Calendar, Globe, Clock, Timer, CalendarDays } from 'lucide-react';
import { getPayrollSettings, updatePayrollSettings, getPayrollCycleRange } from '../../utils/timesheetService';

export default function TabPayroll() {
  const [settings, setSettings] = useState({
    auto_deduct_lunch: true,
    lunch_duration_mins: 60,
    break_threshold_hrs: 5,
    sunday_multiplier: 1.5,
    holiday_multiplier: 2.0,
    auto_clock_out_hrs: 12,
    shift_end_cutoff_time: '23:59:59',
    monthly_overtime_threshold_hrs: 195.0,
    enable_monthly_overtime: true,
    enable_sunday_premium: true,
    enable_holiday_premium: true,
    payroll_cycle_start_day: 21
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getPayrollSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePayrollSettings(settings);
      alert("Payroll configurations updated successfully.");
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const cyclePreview = useMemo(() => {
    return getPayrollCycleRange(new Date(), settings.payroll_cycle_start_day ?? 21);
  }, [settings.payroll_cycle_start_day]);

  if (loading) return <div className="py-20 text-center italic text-slate-400">Loading payroll engine...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-10">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight text-white">Payroll Engine Configuration</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Configure global BCEA calculation rules for the store.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-500 shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Syncing...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Payroll Calendar Cycle */}
        <div className="col-span-1 md:col-span-2">
          <SummaryCard title="Payroll Calendar Cycle" icon={CalendarDays}>
            <div className="space-y-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-xs font-bold text-slate-700">Monthly Cycle Start Date</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Select the day of the month when your store's payroll cycle starts. Attendance registers, timesheets, and payroll reports automatically run according to this cycle.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Cycle Start:</span>
                  <select
                    value={settings.payroll_cycle_start_day ?? 21}
                    onChange={e => setSettings({ ...settings, payroll_cycle_start_day: parseInt(e.target.value) })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-yellow-500/20"
                  >
                    <option value={21}>21st of the month (Default • 21st to 20th)</option>
                    <option value={1}>1st of the month (Calendar Month • 1st to End)</option>
                    <option value={15}>15th of the month (15th to 14th)</option>
                    <option value={16}>16th of the month (16th to 15th)</option>
                    <option value={20}>20th of the month (20th to 19th)</option>
                    <option value={25}>25th of the month (25th to 24th)</option>
                    <option value={26}>26th of the month (26th to 25th)</option>
                    <optgroup label="Other Days">
                      {Array.from({ length: 28 }, (_, i) => i + 1)
                        .filter(d => ![1, 15, 16, 20, 21, 25, 26].includes(d))
                        .map(d => (
                          <option key={d} value={d}>
                            Day {d} of the month
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-1">Quick Presets:</span>
                {[
                  { day: 21, label: '21st to 20th (Default)' },
                  { day: 25, label: '25th to 24th' },
                  { day: 26, label: '26th to 25th' },
                  { day: 1, label: '1st to Month-End' },
                  { day: 15, label: '15th to 14th' }
                ].map(p => (
                  <button
                    key={p.day}
                    type="button"
                    onClick={() => setSettings({ ...settings, payroll_cycle_start_day: p.day })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      (settings.payroll_cycle_start_day ?? 21) === p.day
                        ? 'bg-yellow-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-gradient-to-r from-yellow-50/70 to-amber-50/70 border border-yellow-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-yellow-800 uppercase tracking-widest">Active Pay Cycle Preview</p>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">{cyclePreview.detailedLabel}</h4>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                      Cycle: {cyclePreview.cycleLabel} • {cyclePreview.spansMultipleMonths ? 'Runs across 2 different months' : 'Runs within a single calendar month'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 bg-white border border-yellow-300 rounded-lg text-[10px] font-black text-yellow-900 uppercase tracking-wider shadow-2xs">
                    {cyclePreview.shortLabel}
                  </span>
                </div>
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* Break Rules */}
        <SummaryCard title="Meal Interval (The 5-Hour Rule)" icon={Coffee}>
          <div className="space-y-6 py-4">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-700">Automated Break Deduction</p>
                   <p className="text-[10px] text-slate-400">Subtract break time from shift total automatically.</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, auto_deduct_lunch: !settings.auto_deduct_lunch})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.auto_deduct_lunch ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.auto_deduct_lunch ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>

             <div className={`space-y-4 transition-all ${settings.auto_deduct_lunch ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Break Duration (Minutes)</label>
                   <select
                     value={settings.lunch_duration_mins}
                     onChange={e => setSettings({...settings, lunch_duration_mins: parseInt(e.target.value)})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                   >
                     <option value={30}>30 Minutes (Reduced Interval)</option>
                     <option value={45}>45 Minutes</option>
                     <option value={60}>60 Minutes (BCEA Standard)</option>
                   </select>
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Break Threshold (Working Hours)</label>
                   <div className="flex items-center gap-3">
                      <input
                        type="range" min="1" max="12" step="1"
                        value={settings.break_threshold_hrs}
                        onChange={e => setSettings({...settings, break_threshold_hrs: parseInt(e.target.value)})}
                        className="flex-1 accent-yellow-600"
                      />
                      <span className="w-12 text-center text-xs font-black text-slate-900">{settings.break_threshold_hrs}h</span>
                   </div>
                   <p className="text-[9px] text-slate-400 mt-2 italic">Break will only be deducted if the shift exceeds this duration.</p>
                </div>
             </div>
          </div>
        </SummaryCard>

        {/* Rate Multipliers */}
        <SummaryCard title="Statutory Rate Multipliers" icon={Calendar}>
           <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sunday Rate</label>
                    <div className="relative">
                       <input
                         type="number" step="0.1" min="1"
                         value={settings.sunday_multiplier}
                         onChange={e => setSettings({...settings, sunday_multiplier: parseFloat(e.target.value)})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">multiplier</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Public Holiday</label>
                    <div className="relative">
                       <input
                         type="number" step="0.1" min="1"
                         value={settings.holiday_multiplier}
                         onChange={e => setSettings({...settings, holiday_multiplier: parseFloat(e.target.value)})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">multiplier</span>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                 <Globe className="text-blue-600 shrink-0" size={16} />
                 <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                    The system automatically detects South African Public Holidays using the built-in statutory engine and applies the multiplier to the daily hour total.
                 </p>
              </div>
           </div>
        </SummaryCard>

        {/* Overtime & Premium Logic */}
        <SummaryCard title="Overtime & Premium Logic" icon={Timer}>
           <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold text-slate-700">Monthly Overtime Calculation</p>
                   <p className="text-[10px] text-slate-400">Trigger overtime after total monthly standard hours.</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, enable_monthly_overtime: !settings.enable_monthly_overtime})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.enable_monthly_overtime ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enable_monthly_overtime ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>

             <div className={`space-y-4 transition-all ${settings.enable_monthly_overtime ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Monthly Threshold (Hours)</label>
                <div className="flex items-center gap-3">
                   <input
                     type="number" step="0.5"
                     value={settings.monthly_overtime_threshold_hrs}
                     onChange={e => setSettings({...settings, monthly_overtime_threshold_hrs: parseFloat(e.target.value)})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                   />
                   <span className="text-[10px] font-bold text-slate-400">HRS</span>
                </div>
             </div>

             <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Enable Sunday 1.5x</p>
                      <p className="text-[10px] text-slate-400">Apply standard OT rate to all Sunday work.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enable_sunday_premium}
                      onChange={e => setSettings({...settings, enable_sunday_premium: e.target.checked})}
                      className="w-4 h-4 text-yellow-600 rounded border-slate-300 focus:ring-yellow-500"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Enable Holiday 2.0x</p>
                      <p className="text-[10px] text-slate-400">Apply premium OT rate to all Public Holidays.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enable_holiday_premium}
                      onChange={e => setSettings({...settings, enable_holiday_premium: e.target.checked})}
                      className="w-4 h-4 text-yellow-600 rounded border-slate-300 focus:ring-yellow-500"
                    />
                </div>
             </div>
           </div>
        </SummaryCard>

        {/* Auto Clock-Out Controls */}
        <SummaryCard title="Shift Finalization (Auto Clock-Out)" icon={Clock}>
           <div className="space-y-6 py-4">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Max Shift Duration (Hours)</label>
                 <div className="flex items-center gap-3">
                    <input
                      type="range" min="4" max="24" step="1"
                      value={settings.auto_clock_out_hrs}
                      onChange={e => setSettings({...settings, auto_clock_out_hrs: parseInt(e.target.value)})}
                      className="flex-1 accent-yellow-600"
                    />
                    <span className="w-12 text-center text-xs font-black text-slate-900">{settings.auto_clock_out_hrs}h</span>
                 </div>
                 <p className="text-[9px] text-slate-400 mt-2 italic">Active shifts will be automatically closed after this time if no manual clock-out occurs.</p>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cycle Cut-off Time (Midnight Protocol)</label>
                 <input
                   type="time"
                   value={settings.shift_end_cutoff_time}
                   onChange={e => setSettings({...settings, shift_end_cutoff_time: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black"
                 />
                 <p className="text-[9px] text-slate-400 mt-2 italic">Used as a fallback for automatic shift completion.</p>
              </div>
           </div>
        </SummaryCard>

      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
         <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <AlertTriangle size={20} />
         </div>
         <div>
            <h4 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest mb-1">Global Recalculation Notice</h4>
            <p className="text-[11px] text-yellow-700 leading-relaxed font-medium">
              Updating these settings will impact how hours are displayed across all **uncommitted** attendance registers. Committed (Finalized) cycles will not be retroactively modified to ensure audit trail integrity.
            </p>
         </div>
      </div>
    </div>
  );
}
