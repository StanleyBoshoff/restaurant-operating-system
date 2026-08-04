import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { BarChart3, Clock, AlertTriangle, Timer, LogOut, CheckCircle2, Users, Calendar, TrendingUp, DollarSign, ChevronRight, FileText, ArrowLeft, Filter, User } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import {
  getDailyAttendanceLog, getMissingPunchesReport, getOvertimeTrackingReport,
  getTardinessAnalysisReport, getEarlyDepartureReport, getApprovalStatusReport,
  getTotalHoursSummary, getAbsenteeismReport, getShiftVarianceReport, getLaborCostVarianceReport
} from '../../utils/reportingService';

const REPORT_LIST = [
  { id: 'daily_logs', title: 'Daily Clock-In / Clock-Out Log', desc: 'Detailed chronological log of all raw clocking events.', icon: Clock, color: 'blue' },
  { id: 'missing_punches', title: 'Missing Punches / Exception Report', desc: 'Identify shifts with missing clock-outs or irregular durations.', icon: AlertTriangle, color: 'rose' },
  { id: 'overtime_tracking', title: 'Overtime Tracking Report', desc: 'Monitor employees exceeding standard shift hours.', icon: Timer, color: 'amber' },
  { id: 'tardiness_analysis', title: 'Tardiness and Late Arrival Analysis', desc: 'Compare actual vs scheduled start times.', icon: TrendingUp, color: 'orange' },
  { id: 'early_departure', title: 'Early Departure Log', desc: 'Identify shifts that ended before the scheduled time.', icon: LogOut, color: 'indigo' },
  { id: 'approval_status', title: 'Attendance Approval Status Report', desc: 'Review verification progress for payroll readiness.', icon: CheckCircle2, color: 'emerald' },
  { id: 'hours_summary', title: 'Total Hours Worked Summary', desc: 'Aggregated hours grouped by Department and Shift.', icon: Users, color: 'slate' },
  { id: 'absenteeism', title: 'Absenteeism and No-Show Report', desc: 'Cross-reference schedules vs actual attendance.', icon: Calendar, color: 'purple' },
  { id: 'shift_variance', title: 'Shift Variance Report', desc: 'Compare Scheduled vs Actual hours per employee.', icon: BarChart3, color: 'teal' },
  { id: 'labor_cost', title: 'Labor Cost and Budget Variance', desc: 'Actual labor costs vs department budget limits.', icon: DollarSign, color: 'yellow' }
];

export default function TabLabour() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const departments = ['All', 'FOH', 'BOH', 'Manager'];

  useEffect(() => {
    async function fetchEmployees() {
       const { data } = await supabase.from('employees').select('id, first_name, last_name, department').order('first_name');
       setEmployeesList(data || []);
    }
    fetchEmployees();
  }, []);

  const fetchReportData = async (reportId) => {
    setLoading(true);
    try {
      const empId = selectedEmployeeId === 'All' ? null : selectedEmployeeId;
      let result = [];
      switch(reportId) {
        case 'daily_logs': result = await getDailyAttendanceLog(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'missing_punches': result = await getMissingPunchesReport(selectedDept, empId); break;
        case 'overtime_tracking': result = await getOvertimeTrackingReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'tardiness_analysis': result = await getTardinessAnalysisReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'early_departure': result = await getEarlyDepartureReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'approval_status': result = await getApprovalStatusReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'hours_summary': result = await getTotalHoursSummary(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'absenteeism': result = await getAbsenteeismReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'shift_variance': result = await getShiftVarianceReport(dateRange.start, dateRange.end, selectedDept, empId); break;
        case 'labor_cost':
          const d = new Date(dateRange.start);
          result = await getLaborCostVarianceReport(d.getMonth() + 1, d.getFullYear(), selectedDept);
          break;
      }
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    fetchReportData(report.id);
  };

  if (selectedReport) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedReport(null); setData([]); }}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Reports Menu
          </button>

          <button
            onClick={() => fetchReportData(selectedReport.id)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            Refresh Report
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-2xl bg-${selectedReport.color}-50 flex items-center justify-center text-${selectedReport.color}-600`}>
              <selectedReport.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{selectedReport.title}</h3>
              <p className="text-xs text-slate-400 font-medium">{selectedReport.desc}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
               <div className="w-10 h-10 border-4 border-slate-200 border-t-yellow-600 rounded-full animate-spin"></div>
               <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Insight...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
               <FileText size={48} className="text-slate-200 mb-4" />
               <p className="text-sm font-bold text-slate-400">No data found for this report criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {Object.keys(data[0]).filter(k => k !== 'id' && typeof data[0][k] !== 'object').map(key => (
                      <th key={key} className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      {Object.keys(row).filter(k => k !== 'id' && typeof row[k] !== 'object').map(key => (
                        <td key={key} className="py-4 text-xs font-bold text-slate-700">{String(row[key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 🛠️ Advanced Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-3xs">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Labour Data Filters</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <select
                value={selectedEmployeeId}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none shadow-3xs"
              >
                <option value="All">All Employees</option>
                {employeesList.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>

            <div className="flex bg-white border border-slate-200 p-0.5 rounded-xl">
              {departments.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(d)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedDept === d ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Analysis Period</span>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-3xs">
              <Calendar size={12} className="text-yellow-600" />
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="text-[10px] font-black text-slate-700 outline-none"
              />
              <span className="text-slate-300 font-bold">/</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="text-[10px] font-black text-slate-700 outline-none"
              />
            </div>
          </div>
          <button className="mt-4 p-2 bg-slate-900 text-white rounded-xl shadow-md active:scale-95 transition-all">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_LIST.map((report) => (
          <button
            key={report.id}
            onClick={() => handleSelectReport(report)}
            className="text-left bg-white border border-slate-200 p-5 rounded-2xl hover:border-yellow-500 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full"
          >
            <div className={`w-10 h-10 rounded-xl bg-${report.color}-50 flex items-center justify-center text-${report.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
              <report.icon size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight group-hover:text-yellow-600">{report.title}</h4>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed flex-1">{report.desc}</p>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900">Generate Report</span>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-yellow-600 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
