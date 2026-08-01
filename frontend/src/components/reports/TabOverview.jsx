import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { BarChart3, TrendingUp, ShieldCheck, Users, Clock, Award, Gavel, AlertCircle } from 'lucide-react';
import { getComplianceScore, getOperationalSnapshot, getDisciplinaryTrends } from '../../utils/reportingService';

export default function TabOverview() {
  const [snapshot, setSnapshot] = useState({ totalEmployees: 0, onDutyNow: 0, pendingLeave: 0, expiringDocs: 0 });
  const [complianceScore, setComplianceScore] = useState(0);
  const [disciplinaryTrends, setDisciplinaryTrends] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getOperationalSnapshot();
      const score = await getComplianceScore();
      const trends = await getDisciplinaryTrends();
      setSnapshot(snap);
      setComplianceScore(score);
      setDisciplinaryTrends(trends);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 🚀 Top Intelligence Layer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workforce Compliance</p>
             <ShieldCheck size={16} className="text-yellow-500" />
           </div>
           <div>
             <h2 className="text-4xl font-black text-white">{complianceScore}%</h2>
             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Store Safety Rating</p>
           </div>
        </div>

        <SummaryCard title="Live Deployment" icon={Clock}>
           <div className="py-2">
             <h3 className="text-3xl font-black text-slate-900">{snapshot.onDutyNow}</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Clocked-in Now</p>
           </div>
        </SummaryCard>

        <SummaryCard title="Pending Actions" icon={TrendingUp}>
           <div className="py-2">
             <h3 className="text-3xl font-black text-yellow-600">{snapshot.pendingLeave}</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Leave Approvals</p>
           </div>
        </SummaryCard>

        <SummaryCard title="Risk Registry" icon={AlertCircle}>
           <div className="py-2">
             <h3 className="text-3xl font-black text-rose-600">{snapshot.expiringDocs}</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Expiring Permits</p>
           </div>
        </SummaryCard>
      </div>

      {/* 📊 Thematic Reporting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard title="Labour Efficiency" icon={BarChart3}>
           <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">BOH Productivity</span>
                <span className="font-bold text-slate-900">92%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 w-[92%]"></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">FOH Service Speed</span>
                <span className="font-bold text-slate-900">88%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 w-[88%]"></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Labour Cost Ratio</span>
                <span className="font-bold text-green-600">28.4%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[28%]"></div>
              </div>
           </div>
        </SummaryCard>

        <SummaryCard title="Disciplinary Summary" icon={Gavel}>
           <div className="grid grid-cols-2 gap-4 py-2">
             {Object.entries(disciplinaryTrends).map(([level, count]) => (
               <div key={level} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{level}</p>
                  <h4 className="text-xl font-black text-slate-900">{count}</h4>
               </div>
             ))}
             {Object.keys(disciplinaryTrends).length === 0 && (
               <p className="col-span-2 text-center py-6 text-[10px] text-slate-400 italic">No warnings issued in this period.</p>
             )}
           </div>
        </SummaryCard>
      </div>

      {/* Quick Launch Reports */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {['Attendance', 'Labour', 'Leave', 'Training'].map(report => (
           <button key={report} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-yellow-600 hover:shadow-md transition-all text-left group">
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-3 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-all">
                <BarChart3 size={16} />
              </div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{report} Report</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-1">Detailed Analytics</p>
           </button>
         ))}
      </div>
    </div>
  );
}
