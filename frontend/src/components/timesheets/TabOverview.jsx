import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Search, MoreVertical, FileText, Timer, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getMonthlyAttendanceSummary } from '../../utils/reportingService';
import StatusBadge from '../common/StatusBadge';

export default function TabOverview() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth, currentYear]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyAttendanceSummary(currentMonth, currentYear);
      setSummary(data || []);
    } catch (err) {
      console.error("Failed to fetch monthly attendance summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction) => {
    let nextMonth = currentMonth + direction;
    let nextYear = currentYear;
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }
    if (nextMonth < 1) { nextMonth = 12; nextYear--; }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const getMonthLabel = () => {
    return new Date(currentYear, currentMonth - 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  };

  const filteredData = summary.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayrollHours = filteredData.reduce((acc, emp) => acc + (parseFloat(emp.totalHours) || 0), 0);
  const totalOvertime = filteredData.reduce((acc, emp) => acc + (parseFloat(emp.totalOvertime) || 0), 0);
  const totalAutoExits = filteredData.reduce((acc, emp) => acc + (emp.autoExits || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Month Navigation Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-3xs active:scale-95"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>

          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-3xs min-w-[200px] justify-center">
            <Calendar size={14} className="text-yellow-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{getMonthLabel()}</span>
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-3xs active:scale-95"
          >
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500/20 shadow-3xs"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Download size={14} />
            Monthly Export
          </button>
        </div>
      </div>

      <SummaryCard
        title="Monthly Attendance Summary"
        icon={Users}
        badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filteredData.length} EMPLOYEES</span>}
      >
        <div className="overflow-x-auto -mx-4 -mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Regular Hrs</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Overtime</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total Shifts</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Auto-Exits</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center italic text-slate-400 animate-pulse">
                    Aggregating monthly workforce summary...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center italic text-slate-400">
                    No records found for this month.
                  </td>
                </tr>
              ) : (
                filteredData.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200 group-hover:bg-white group-hover:border-slate-300">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <span className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{emp.role}</td>
                    <td className="px-6 py-4 text-center font-black text-slate-700">{emp.totalHours}h</td>
                    <td className="px-6 py-4 text-center font-black text-rose-600">{emp.totalOvertime}h</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{emp.totalShifts}</td>
                    <td className="px-6 py-4 text-center">
                      {emp.autoExits > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100">
                          <AlertCircle size={10} />
                          {emp.autoExits}
                        </span>
                      ) : (
                        <span className="text-slate-300">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${emp.approvalRate === 100 ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                            style={{ width: `${emp.approvalRate}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{emp.approvalRate}% Verified</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SummaryCard>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-32 shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Store Monthly Hours</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black">{totalPayrollHours.toFixed(1)}</h2>
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Overtime</p>
          <h2 className="text-3xl font-black text-rose-600">{totalOvertime.toFixed(1)}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance Flags</p>
          <h2 className="text-3xl font-black text-amber-600">{totalAutoExits.toString().padStart(2, '0')}</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completion Score</p>
          <h2 className="text-3xl font-black text-emerald-600">88%</h2>
        </div>
      </div>
    </div>
  );
}
