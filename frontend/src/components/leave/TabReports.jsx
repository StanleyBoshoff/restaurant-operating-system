import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import {
  BarChart3, FileText, ClipboardList, Calendar, Users,
  Stethoscope, ShieldCheck, Heart, UserX, Wallet,
  ArrowRight, Filter, Search, Settings2, Shield, Scale, AlertTriangle, User
} from 'lucide-react';
import LeaveReportViewer from './LeaveReportViewer';
import CustomLeaveReportBuilder from './CustomLeaveReportBuilder';
import * as reporting from '../../utils/reportingService';
import { getSaHolidaysForYear } from '../../utils/saHolidayEngine';
import { supabase } from '../../supabaseClient';

const REPORT_CATALOG = [
  { id: 'custom', title: 'Custom Master Leave Builder', desc: 'Build a bespoke report with all available data points.', icon: Settings2, type: 'builder' },
  { id: 'shift_coverage', title: 'Shift Coverage & Rota Planner', desc: 'Availability vs. Leave status for current operations.', icon: ClipboardList, type: 'status' },
  { id: 'balances', title: 'Leave Balance & Accrual Ledger', desc: 'Live statutory balances for all active staff.', icon: Wallet, type: 'ledger' },
  { id: 'pending', title: 'Pending Leave Requests Log', desc: 'Full queue of requests awaiting authorization.', icon: Calendar, type: 'log' },
  { id: 'sick_history', title: 'Historical Sick Leave Records', desc: 'BCEA compliance log for illness and incapacity.', icon: Heart, type: 'log' },
  { id: 'med_certs', title: 'Medical Certificates & Fit Notes', desc: 'Registry of uploaded proof for audit purposes.', icon: Stethoscope, type: 'files' },
  { id: 'blackout', title: 'Public Holiday & Blackout Calendars', desc: 'Peak-season constraints and statutory holidays.', icon: ShieldCheck, type: 'static' },
  { id: 'family', title: 'Statutory Family & Parental Records', desc: 'Tracking of FR and Maternity/Paternity leave.', icon: Users, type: 'log' },
  { id: 'absenteeism', title: 'Unpaid Leave & Absenteeism Logs', desc: 'Monitoring of AWOL and non-statutory absence.', icon: UserX, type: 'log' },
  { id: 'toil', title: 'TOIL Overtime Balances', desc: 'Time Off in Lieu units earned vs. taken.', icon: BarChart3, type: 'units' },
  { id: 'liability', title: 'Leave Liability & Accrual Financials', desc: 'Rand-value exposure for accrued staff leave.', icon: FileText, type: 'financial' },
];

const LEGAL_CATALOG = [
  { id: 'awol', title: 'AWOL & Unauthorised Absence Audit', desc: 'Cross-reference timesheets vs leave to prove AWOL.', icon: Shield, type: 'legal' },
  { id: 'density', title: 'Operational Density (Refusal Proof)', desc: 'Proof of staff shortages to justify leave refusal.', icon: Scale, type: 'legal' },
  { id: 'sick_cycle', title: '3-Year Sick Leave Cycle Audit', desc: 'Full 36-month entitlement tracking for CCMA.', icon: Heart, type: 'statutory' },
  { id: 'med_validity', title: 'Medical Certificate Validity Log', desc: 'Registry of verified proof vs. non-registered notes.', icon: Stethoscope, type: 'compliance' },
  { id: 'holiday_lieu', title: 'Public Holiday Lieu Ledger', desc: 'Tracking of days-in-lieu earned for holidays worked.', icon: ShieldCheck, type: 'payroll' },
  { id: 'maternity', title: 'Maternity Service Record (UI-19)', desc: 'Official service history for UIF benefit claims.', icon: Users, type: 'government' },
];

export default function TabReports() {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [employeesList, setEmployeesList] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const departments = ['All', 'FOH', 'BOH', 'Manager'];

  React.useEffect(() => {
    async function fetchEmployees() {
       const { data } = await supabase.from('employees').select('id, first_name, last_name, department').order('first_name');
       setEmployeesList(data || []);
    }
    fetchEmployees();
  }, []);

  const runReport = async (report) => {
    if (report.id === 'custom') {
      setShowBuilder(true);
      return;
    }
    setLoading(true);
    try {
      const empId = selectedEmployeeId === 'All' ? null : selectedEmployeeId;
      let data = [];
      switch(report.id) {
        case 'shift_coverage': data = await reporting.getShiftCoverageReport(new Date().toISOString(), new Date().toISOString(), selectedDept, empId); break;
        case 'balances': data = await reporting.getLeaveBalancesReport(selectedDept, empId); break;
        case 'pending': data = await reporting.getPendingLeaveRequests(selectedDept, empId); break;
        case 'sick_history': data = await reporting.getSickLeaveHistory(selectedDept, empId); break;
        case 'med_certs': data = await reporting.getMedicalCertificatesReport(selectedDept, empId); break;
        case 'family': data = await reporting.getFamilyLeaveReport(selectedDept, empId); break;
        case 'absenteeism': data = await reporting.getAbsenteeismLog(selectedDept, empId); break;
        case 'toil': data = await reporting.getTOILBalances(selectedDept, empId); break;
        case 'liability': data = await reporting.getLeaveLiability(selectedDept, empId); break;
        case 'awol': data = await reporting.getAWOLAudit(selectedDept, empId); break;
        case 'density': data = await reporting.getOperationalDensity(); break;
        case 'sick_cycle': data = await reporting.getSickLeaveCycleAudit(selectedDept, empId); break;
        case 'med_validity': data = await reporting.getMedicalValidityLog(selectedDept, empId); break;
        case 'holiday_lieu': data = await reporting.getPublicHolidayLieuLedger(); break;
        case 'maternity': data = await reporting.getMaternityServiceRecord(selectedDept, empId); break;
        case 'blackout':
          const year = new Date().getFullYear();
          const holidays = getSaHolidaysForYear(year);
          data = holidays.map(h => ({ Holiday: h.name, Date: h.date, Status: 'Store Wide Blackout' }));
          break;
        default: data = []; break;
      }
      setReportData(data);
      setActiveReport(report);
    } catch (err) {
      alert("Failed to generate report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustom = (title, data) => {
    setReportData(data);
    setActiveReport({ title });
    setShowBuilder(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Report Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Auditable Statutory Reports</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Select a template to generate real-time data</p>
        </div>

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

          <div className="flex bg-slate-100 p-1 rounded-xl">
             {departments.map(d => (
               <button
                 key={d}
                 onClick={() => setSelectedDept(d)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                   selectedDept === d ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {d}
               </button>
             ))}
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-3xs">
            <Filter size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_CATALOG.map(report => (
          <button
            key={report.id}
            onClick={() => runReport(report)}
            disabled={loading}
            className="bg-white border border-slate-200 p-6 rounded-3xl text-left hover:border-yellow-500 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-48 active:scale-95 disabled:opacity-50"
          >
            <div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors">
                 <report.icon size={24} />
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-yellow-600 transition-colors">{report.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">{report.desc}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{report.type} Template</span>
               <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-yellow-600 group-hover:text-white transition-all">
                  <ArrowRight size={14} />
               </div>
            </div>
          </button>
        ))}
      </div>

      {/* Legal Defense Section */}
      <div className="pt-10 space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
              <Shield size={20} />
           </div>
           <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Legal Defense & CCMA Bundle</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">High-stakes statutory evidence for labor disputes</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEGAL_CATALOG.map(report => (
            <button
              key={report.id}
              onClick={() => runReport(report)}
              disabled={loading}
              className="bg-white border border-slate-200 p-6 rounded-3xl text-left hover:border-rose-500 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between h-48 active:scale-95 disabled:opacity-50"
            >
              <div>
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                   <report.icon size={24} />
                </div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-rose-600 transition-colors">{report.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">{report.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">{report.type} Template</span>
                 <div className="p-1.5 bg-rose-50 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <ArrowRight size={14} />
                 </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Report Viewer Overlay */}
      {activeReport && (
        <LeaveReportViewer
          title={activeReport.title}
          type={activeReport.id}
          data={reportData}
          onClose={() => setActiveReport(null)}
        />
      )}

      {showBuilder && (
        <CustomLeaveReportBuilder
          onClose={() => setShowBuilder(false)}
          onGenerate={handleGenerateCustom}
        />
      )}

      {/* Help Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
            <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-yellow-500">Compliance Assurance</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-medium">
              All leave reports are calculated using the built-in BCEA statutory engine. Data exported from this terminal is formatted for submission to the CCMA, Department of Labour, and external auditors.
            </p>
         </div>
         <div className="shrink-0 relative z-10">
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              Request Custom Filter
            </button>
         </div>
         <BarChart3 size={140} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </div>
    </div>
  );
}
