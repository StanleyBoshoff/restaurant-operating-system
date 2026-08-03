import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { X, Filter, Calendar, Settings, Play, Download, CheckCircle, User } from 'lucide-react';
import * as reporting from '../../utils/reportingService';
import { supabase } from '../../supabaseClient';

export default function CustomLeaveReportBuilder({ onClose, onGenerate }) {
  const [filters, setFilters] = useState({
    dept: 'All',
    leaveType: 'All',
    employeeId: 'All',
    startDate: '',
    endDate: ''
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
       const { data } = await supabase.from('employees').select('id, first_name, last_name').order('first_name');
       setEmployeesList(data || []);
    }
    fetchEmployees();
  }, []);

  const departments = ['All', 'FOH', 'BOH', 'Manager', 'Admin'];
  const leaveTypes = ['All', 'Annual Leave', 'Sick Leave', 'Family Responsibility', 'Unpaid Leave', 'Maternity Leave', 'Paternity Leave'];

  const handleRun = async () => {
    setIsGenerating(true);
    try {
      const submissionFilters = {
        ...filters,
        employeeId: filters.employeeId === 'All' ? null : filters.employeeId
      };
      const data = await reporting.getCustomLeaveReport(submissionFilters);
      onGenerate("Custom Master Leave Report", data);
    } catch (err) {
      alert("Report generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Custom Report Builder</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Aggregate all statutory data streams</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400"><X size={20} /></button>
        </div>

        {/* Configuration Body */}
        <div className="p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Individual Employee Filter */}
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Scope: Specific Employee</label>
                 <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select
                      value={filters.employeeId}
                      onChange={e => setFilters({...filters, employeeId: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500/20"
                    >
                      <option value="All">All Employees (Apply Filters Below)</option>
                      {employeesList.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                 </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Department Filter</label>
                 <select
                   value={filters.dept}
                   onChange={e => setFilters({...filters, dept: e.target.value})}
                   disabled={filters.employeeId !== 'All'}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-50"
                 >
                   {departments.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>

              {/* Leave Type Filter */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Leave Designation</label>
                 <select
                   value={filters.leaveType}
                   onChange={e => setFilters({...filters, leaveType: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500/20"
                 >
                   {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Period Start</label>
                 <input
                   type="date"
                   value={filters.startDate}
                   onChange={e => setFilters({...filters, startDate: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Period End</label>
                 <input
                   type="date"
                   value={filters.endDate}
                   onChange={e => setFilters({...filters, endDate: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                 />
              </div>
           </div>

           <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                 <Calendar size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Master Dataset Integration</h4>
                <p className="text-[11px] text-yellow-700 leading-relaxed font-medium mt-1">
                  This report will generate a comprehensive view including **Accrued Balances**, **Financial Liability (Rand)**, and **Statutory Deductions** for every record found in the selected scope.
                </p>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
           <button
             onClick={onClose}
             className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
           >
             Cancel
           </button>
           <button
             onClick={handleRun}
             disabled={isGenerating}
             className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
           >
             {isGenerating ? (
               <span className="animate-pulse">Aggregating Streams...</span>
             ) : (
               <>
                 <Play size={16} fill="currentColor" />
                 Generate Master Report
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
