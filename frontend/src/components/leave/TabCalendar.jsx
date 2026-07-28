import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { Calendar as CalendarIcon, User, Users } from 'lucide-react';

export default function TabCalendar() {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('employee_leave')
          .select(`
            *,
            employees (
              first_name,
              last_name,
              role,
              department
            )
          `)
          .eq('status', 'Approved')
          .gte('end_date', today) // Show current and future leave
          .order('start_date', { ascending: true });

        if (error) throw error;
        setLeaveRecords(data || []);
      } catch (err) {
        console.error('Error fetching leave calendar:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendar();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 italic animate-pulse">Syncing team leave calendar...</div>;
  }

  const currentlyAway = leaveRecords.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return today >= r.start_date && today <= r.end_date;
  });

  const upcoming = leaveRecords.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.start_date > today;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Currently Away */}
        <SummaryCard
          title="Currently Away"
          icon={User}
          badge={<span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{currentlyAway.length} STAFF</span>}
        >
          <div className="space-y-3">
            {currentlyAway.length === 0 ? (
              <p className="py-8 text-center text-slate-400 italic text-[11px]">Everyone is on duty today.</p>
            ) : (
              currentlyAway.map(record => (
                <div key={record.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {record.employees?.first_name[0]}{record.employees?.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{record.employees?.first_name} {record.employees?.last_name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-medium">{record.employees?.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={record.leave_type} />
                    <p className="text-[9px] text-slate-400 font-bold mt-1">Until {new Date(record.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SummaryCard>

        {/* Upcoming Leave */}
        <SummaryCard
          title="Upcoming Schedule"
          icon={Users}
          badge={<span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{upcoming.length} PLANNED</span>}
        >
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-slate-400 italic text-[11px]">No upcoming leave requests scheduled.</p>
            ) : (
              upcoming.map(record => (
                <div key={record.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between gap-4 group hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-white transition-colors">
                      {record.employees?.first_name[0]}{record.employees?.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{record.employees?.first_name} {record.employees?.last_name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Starts {new Date(record.start_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-900 block">{record.total_statutory_days_deducted} Days</span>
                    <span className="text-[9px] text-slate-500 font-medium">{record.leave_type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SummaryCard>

      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="text-yellow-500" size={20} />
          <h4 className="font-bold text-sm">Operational Availability Insight</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          This calendar view is synchronized with the Management Command Center. Approved leave blocks are automatically factored into workforce deployment metrics to prevent scheduling conflicts.
        </p>
      </div>
    </div>
  );
}
