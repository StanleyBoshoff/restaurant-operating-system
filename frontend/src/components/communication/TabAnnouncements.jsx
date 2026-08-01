import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Megaphone, Calendar, Users, Eye, Plus, Send, MoreVertical, Archive } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ANNOUNCEMENTS = [
  { id: 1, title: 'New Statutory Leave Policy Update', content: 'Please review the updated Annexure B regarding sick leave requirements for the upcoming peak season...', author: 'HR Manager', date: '2026-07-28', target: 'All Staff', reads: 42, total: 45, status: 'Active' },
  { id: 2, title: 'Store Maintenance: Gas Supply Interruption', content: 'Notice to BOH: Municipal maintenance will affect gas supply on Monday between 06h00 and 09h00. Prep schedules adjusted...', author: 'General Manager', date: '2026-07-30', target: 'Kitchen', reads: 12, total: 15, status: 'Active' },
  { id: 3, title: 'Annual Team Building: Save the Date', content: 'Our annual appreciation dinner will be held at The Vineyard on Sunday, 15th August. Invitations to follow...', author: 'Director', date: '2026-08-01', target: 'All Staff', reads: 5, total: 45, status: 'New' },
  { id: 4, title: 'Health & Safety Audit Results', content: 'Congratulations to the team for achieving a 98% safety rating in our recent external hygiene audit...', author: 'Safety Officer', date: '2026-07-15', target: 'All Staff', reads: 45, total: 45, status: 'Archived' },
];

export default function TabAnnouncements() {
  const [showDraft, setShowDraft] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Store Broadcast Feed</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Internal targeting & read-receipt tracking</p>
        </div>
        <button
          onClick={() => setShowDraft(!showDraft)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Create Broadcast
        </button>
      </div>

      {/* Broadcast List */}
      <div className="grid grid-cols-1 gap-6">
        {ANNOUNCEMENTS.map(ann => (
          <div key={ann.id} className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md ${ann.status === 'New' ? 'border-yellow-200 ring-2 ring-yellow-500/5' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ann.status === 'Archived' ? 'bg-slate-100 text-slate-400' : 'bg-yellow-50 text-yellow-600'}`}>
                   <Megaphone size={20} />
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{ann.title}</h3>
                      <StatusBadge status={ann.status} />
                   </div>
                   <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {ann.date}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {ann.target}</span>
                   </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg">
                <MoreVertical size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 pl-16">
              {ann.content}
            </p>

            <div className="pl-16 flex items-center justify-between border-t border-slate-50 pt-4">
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Broadcast by {ann.author}</span>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-1 text-[10px] font-black text-slate-900">
                        <Eye size={12} className="text-slate-400" />
                        {ann.reads}/{ann.total}
                     </div>
                     <div className="w-24 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-yellow-600"
                          style={{ width: `${(ann.reads / ann.total) * 100}%` }}
                        ></div>
                     </div>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                    View Receipts
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SummaryCard title="Broadcast Reach" icon={Eye}>
            <div className="py-2">
               <h4 className="text-2xl font-black text-slate-900">92%</h4>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Avg Read Receipt Rate</p>
            </div>
         </SummaryCard>

         <SummaryCard title="Active Notices" icon={Megaphone}>
            <div className="py-2">
               <h4 className="text-2xl font-black text-yellow-600">03</h4>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Targeted Broadcasts</p>
            </div>
         </SummaryCard>

         <SummaryCard title="Engagement" icon={Users}>
            <div className="py-2 text-rose-600">
               <h4 className="text-2xl font-black italic">BETA</h4>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Acknowledgement Tracking</p>
            </div>
         </SummaryCard>
      </div>
    </div>
  );
}
