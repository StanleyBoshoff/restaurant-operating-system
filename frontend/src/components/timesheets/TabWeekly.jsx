import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Search, MoreVertical, FileText } from 'lucide-react';
import { getTimesheetsInRange, calculateDuration } from '../../utils/timesheetService';
import StatusBadge from '../common/StatusBadge';

export default function TabWeekly() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Set to Monday of the current week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  }, []);

  useEffect(() => {
    fetchWeeklyData();
  }, [currentWeekStart]);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const endOfWeek = new Date(currentWeekStart);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const data = await getTimesheetsInRange(
        currentWeekStart.toISOString(),
        endOfWeek.toISOString()
      );
      setTimesheets(data || []);
    } catch (err) {
      console.error("Failed to fetch weekly timesheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (direction) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + (direction * 7));
    setCurrentWeekStart(next);
  };

  const getWeekRangeLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const filteredData = timesheets.filter(ts =>
    `${ts.employees?.first_name} ${ts.employees?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Week Navigation Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeek(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-3xs active:scale-95"
          >
            <ChevronLeft size={16} className="text-slate-600" />
          </button>

          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-3xs min-w-[200px] justify-center">
            <Calendar size={14} className="text-yellow-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{getWeekRangeLabel()}</span>
          </div>

          <button
            onClick={() => changeWeek(1)}
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
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-3xs">
            <Filter size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <SummaryCard
        title="Weekly Attendance Matrix"
        icon={Calendar}
        badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filteredData.length} RECORDS</span>}
      >
        <div className="overflow-x-auto -mx-4 -mb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Break</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Duration</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center italic text-slate-400 animate-pulse">
                    Aggregating weekly workforce data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center italic text-slate-400">
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                filteredData.map(ts => {
                  const duration = calculateDuration(ts.clock_in, ts.clock_out, ts.break_end ? 30 : 0);
                  const shiftDate = new Date(ts.clock_in).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });

                  return (
                    <tr key={ts.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200 group-hover:bg-white group-hover:border-slate-300">
                            {ts.employees?.first_name[0]}{ts.employees?.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{ts.employees?.first_name} {ts.employees?.last_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{ts.employees?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600 uppercase tracking-tighter">{shiftDate}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {new Date(ts.clock_in).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {ts.clock_out ? new Date(ts.clock_out).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                      </td>
                      <td className="px-6 py-4">
                        {ts.break_start ? (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Recorded
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg font-black text-[11px] ${
                          parseFloat(duration) > 9 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {duration}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={ts.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SummaryCard>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-32 shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Payroll Hours</p>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-black">482.5</h2>
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overtime Units</p>
          <h2 className="text-3xl font-black text-rose-600">12.0</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Shifts</p>
          <h2 className="text-3xl font-black text-green-600">04</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Late Arrivals</p>
          <h2 className="text-3xl font-black text-amber-600">03</h2>
        </div>
      </div>
    </div>
  );
}
