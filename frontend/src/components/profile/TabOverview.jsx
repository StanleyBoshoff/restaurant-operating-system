import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Briefcase, ShieldCheck, AlertCircle, Calendar,
  Clock, FileText, GraduationCap, MessageSquare, History,
  Plus, Edit, FileUp, ClipboardList, Zap
} from 'lucide-react';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { supabase } from '../../supabaseClient';
import { calculateCompliance } from '../../utils/complianceHelper';

export default function TabOverview({ employee, onRefresh }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    documents: { total: 0, expired: 0, dueSoon: 0, compliance: null },
    warnings: { active: 0, highestLevel: 'None' },
    leave: { available: 0, nextPeriod: null },
    activity: []
  });

  useEffect(() => {
    async function fetchSummaryData() {
      if (!employee?.id) return;
      try {
        setLoading(true);

        // Fetch document stats for compliance
        const { data: docs, error: docError } = await supabase
          .from('employee_documents')
          .select('expiry_date, document_type')
          .eq('employee_id', employee.id);

        if (docError) {
          console.error('Supabase error fetching employee_documents for overview:', docError);
        }

        const uploadedDocs = docs || [];
        const compliance = calculateCompliance(employee, uploadedDocs);

        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

        const docStats = uploadedDocs.reduce((acc, doc) => {
          acc.total++;
          if (doc.expiry_date) {
            const expiry = new Date(doc.expiry_date);
            if (expiry < now) acc.expired++;
            else if (expiry < thirtyDaysFromNow) acc.dueSoon++;
          }
          return acc;
        }, { total: 0, expired: 0, dueSoon: 0 });

        // Fetch warning stats
        const { data: warnings, error: warnError } = await supabase
          .from('employee_warnings')
          .select('warning_level')
          .eq('employee_id', employee.id);

        if (warnError) {
          console.error('Supabase error fetching employee_warnings for overview:', warnError);
        }

        const activeWarnings = warnings || [];

        setStats({
          documents: { ...docStats, compliance },
          warnings: {
            active: activeWarnings.length,
            highestLevel: activeWarnings.length > 0 ? 'Logged' : 'None'
          },
          leave: { available: 15, nextPeriod: null }, // Placeholder
          activity: [] // Placeholder
        });

      } catch (err) {
        console.error('Error fetching overview stats:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryData();
  }, [employee?.id]);

  const calculateTenure = (startDate) => {
    if (!startDate) return 'Not set';
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = (years * 12) + months;

    if (totalMonths < 12) return `${totalMonths} months`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y} yr ${m} mo`;
  };

  const getComplianceStatus = () => {
    return stats.documents.compliance?.status || 'Missing';
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Performance Score"
          badge={<StatusBadge status="Excellent" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">8.5/10</span>
            <span className="text-[10px] text-slate-500 font-medium">Monthly Rating</span>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Leave Balance"
          badge={<StatusBadge status="Annual" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">{stats.leave.available}</span>
            <span className="text-[10px] text-slate-500 font-medium">Days Available</span>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Active Warnings"
          badge={<StatusBadge status={stats.warnings.active > 0 ? 'Action Required' : 'None'} />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">{stats.warnings.active}</span>
            <span className="text-[10px] text-slate-500 font-medium">Warnings Logged</span>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Attendance Rate"
          badge={<StatusBadge status="Healthy" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">98%</span>
            <span className="text-[10px] text-slate-500 font-medium">Current Period</span>
          </div>
        </SummaryCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Employment & Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Employment Summary */}
          <SummaryCard
            title="Employment Summary"
            icon={Briefcase}
            footer={<Link to="details" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">View Full Profile →</Link>}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Type</label>
                <span className="text-xs font-semibold text-slate-700">{employee.employment_type || 'Not Configured'}</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Start Date</label>
                <span className="text-xs font-semibold text-slate-700">{employee.start_date || 'Not Set'}</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Tenure</label>
                <span className="text-xs font-semibold text-slate-700">{calculateTenure(employee.start_date)}</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Manager</label>
                <span className="text-xs font-semibold text-slate-700">{employee.manager_name || 'None Assigned'}</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Probation</label>
                <StatusBadge status="Completed" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block uppercase mb-1">Branch</label>
                <span className="text-xs font-semibold text-slate-700">{employee.branch}</span>
              </div>
            </div>
          </SummaryCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Training Widget */}
            <SummaryCard
              title="Performance & Training"
              icon={GraduationCap}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-semibold text-slate-700">Completion Rate</span>
                  <span className="text-xs font-bold text-slate-900">75%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 italic">2 modules remaining for current role compliance.</p>
                <Link to="performance-training" className="block text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">View Full Track →</Link>
              </div>
            </SummaryCard>

            {/* Attendance Widget */}
            <SummaryCard
              title="Time & Attendance"
              icon={Clock}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Late Arrivals</span>
                  <span className="font-bold text-amber-600">2</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">No Shows</span>
                  <span className="font-bold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Last Status</span>
                  <StatusBadge status="On Time" />
                </div>
                <Link to="time-attendance" className="block text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider pt-2">View Timesheets →</Link>
              </div>
            </SummaryCard>
          </div>

          {/* Activity Feed Placeholder */}
          <SummaryCard
            title="Recent Activity"
            icon={History}
          >
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5"></div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Profile updated by Admin</p>
                  <p className="text-[10px] text-slate-400">Yesterday at 14:30</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5"></div>
                <div>
                  <p className="text-xs font-medium text-slate-700">New document uploaded: Passport</p>
                  <p className="text-[10px] text-slate-400">2 days ago</p>
                </div>
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* Right Column: Quick Actions & Expiries */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-slate-900 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => navigate('details')} className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
                <Edit size={14} /> Edit Profile
              </button>
              <button onClick={() => navigate('documents')} className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
                <FileUp size={14} /> Upload Document
              </button>
              <button onClick={() => navigate('leave')} className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
                <Calendar size={14} /> Log Leave
              </button>
              <button onClick={() => navigate('warnings')} className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
                <AlertCircle size={14} /> Issue Warning
              </button>
              <button onClick={() => navigate('tasks-notes')} className="w-full flex items-center gap-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors">
                <Plus size={14} /> Add Note / Task
              </button>
            </div>
          </div>

          {/* Upcoming Expiries */}
          <SummaryCard
            title="Upcoming Expiries"
            icon={AlertCircle}
          >
            {stats.documents.dueSoon === 0 && stats.documents.expired === 0 ? (
              <p className="text-center py-4 text-[11px] text-slate-400 italic">No upcoming expiries detected.</p>
            ) : (
              <div className="space-y-3">
                {/* Placeholder items if we don't have full data */}
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Passport</span>
                    <StatusBadge status="Due Soon" />
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">Expires: 12 Aug 2026 (15 days)</div>
                </div>
              </div>
            )}
            <Link to="documents" className="block text-center mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">Manage Documents</Link>
          </SummaryCard>

          {/* Notes Card */}
          <SummaryCard
            title="Recent Notes & Tasks"
            icon={MessageSquare}
          >
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              "Employee has requested additional training on the new POS system for next month."
            </p>
            <Link to="tasks-notes" className="block text-center mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">View All Notes & Tasks</Link>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
}
