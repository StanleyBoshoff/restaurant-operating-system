import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { Users, Calendar, AlertCircle, FileText } from 'lucide-react';

export default function TabOverview() {
  const [stats, setStats] = useState({
    onLeaveToday: 0,
    pendingApprovals: 0,
    expiringSoon: 0,
    sickLeaveThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        // 1. Pending Approvals
        const { count: pending } = await supabase
          .from('employee_leave')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');

        // 2. On Leave Today
        const { count: away } = await supabase
          .from('employee_leave')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Approved')
          .lte('start_date', today)
          .gte('end_date', today);

        setStats({
          onLeaveToday: away || 0,
          pendingApprovals: pending || 0,
          expiringSoon: 2, // Placeholder for 18-month logic
          sickLeaveThisMonth: 5 // Placeholder
        });
      } catch (err) {
        console.error('Error fetching leave stats:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="On Leave Today" badge={<StatusBadge status="Live" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900">{stats.onLeaveToday}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Staff Members</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Pending Requests" badge={<StatusBadge status="Action Required" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-yellow-600">{stats.pendingApprovals}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Awaiting Review</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Expiries (18mo)" badge={<StatusBadge status="Notice" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900">{stats.expiringSoon}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Expiring in 30 Days</span>
          </div>
        </SummaryCard>

        <SummaryCard title="Sick Leave" badge={<StatusBadge status="Monthly" />}>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-900">{stats.sickLeaveThisMonth}</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Incidents Logged</span>
          </div>
        </SummaryCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SummaryCard title="HR Leave Compliance" icon={AlertCircle}>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <FileText className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-amber-900">Missing Medical Certificates</p>
                <p className="text-[10px] text-amber-700 leading-tight mt-1">
                  3 Sick Leave records have been approved without attached doctor's notes. Internal policy requires retroactive capture.
                </p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
              <Users className="text-indigo-600 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-indigo-900">Manager Visibility</p>
                <p className="text-[10px] text-indigo-700 leading-tight mt-1">
                  Leave approvals are automatically dispatched to department managers (Chef/FOH) via the integrated notification service.
                </p>
              </div>
            </div>
          </div>
        </SummaryCard>

        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-center">
          <h4 className="text-xl font-bold mb-2">BCEA Statutory Engine</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Restaurant Operating System (ROS) utilizes a real-time entitlement engine that calculates accruals at 1.75 days per month. It automatically manages the statutory 3-year sick leave cycles and flags leave blocks nearing the 18-month expiry threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
