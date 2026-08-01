import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ShieldAlert, Clock, MapPin, Users, FileText, Camera, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const LOCATIONS = ["Kitchen", "Dining Area", "Bar", "Parking Lot", "Back Office", "Store Room", "Front Entrance"];
const SEVERITIES = [
  { label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'High', color: 'bg-orange-100 text-orange-700' },
  { label: 'Critical', color: 'bg-rose-100 text-rose-700' }
];

export default function TabIncident() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-ZA', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    location: '',
    severity: 'Medium',
    description: '',
    involved: '',
    actionTaken: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
             <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Incident Reporting</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Safety & Security Protocol</p>
          </div>
        </div>
        <StatusBadge status="Formal Record" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Column: Metadata */}
        <div className="space-y-6">
          <SummaryCard title="Occurence Details" icon={Clock}>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Incident Date</label>
                 <input
                   type="date"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                   className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Incident Time</label>
                 <input
                   type="time"
                   value={formData.time}
                   onChange={e => setFormData({...formData, time: e.target.value})}
                   className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                 />
               </div>
             </div>

             <div className="space-y-1 mt-4">
                <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Location / Zone</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <select
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none appearance-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="">Select Location...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-1 mt-4">
                <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                   {SEVERITIES.map(s => (
                     <button
                       key={s.label}
                       type="button"
                       onClick={() => setFormData({...formData, severity: s.label})}
                       className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                         formData.severity === s.label
                         ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105'
                         : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                       }`}
                     >
                       {s.label}
                     </button>
                   ))}
                </div>
             </div>
          </SummaryCard>

          <SummaryCard title="Parties Involved" icon={Users}>
             <textarea
               rows={3}
               placeholder="Names of staff, guests, or witnesses..."
               value={formData.involved}
               onChange={e => setFormData({...formData, involved: e.target.value})}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
             />
             <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 italic">
                <Info size={12} />
                Include ID numbers if available for third parties.
             </div>
          </SummaryCard>
        </div>

        {/* Right Column: Narrative */}
        <div className="space-y-6">
          <SummaryCard title="Incident Description" icon={FileText}>
             <textarea
               rows={8}
               placeholder="Provide a factual, detailed account of the event..."
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
             />

             <div className="mt-4 flex gap-4">
                <button type="button" className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all group">
                   <Camera size={20} className="mb-1 group-hover:text-rose-500 transition-colors" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Attach Photos</span>
                </button>
                <div className="flex-1 flex flex-col justify-center">
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Evidence Summary</p>
                   <p className="text-[10px] text-slate-300 italic">No attachments present.</p>
                </div>
             </div>
          </SummaryCard>

          <SummaryCard title="Corrective Action" icon={AlertTriangle}>
             <textarea
               rows={3}
               placeholder="What immediate steps were taken? (e.g. Police called, first aid administered)..."
               value={formData.actionTaken}
               onChange={e => setFormData({...formData, actionTaken: e.target.value})}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
             />
          </SummaryCard>
        </div>

        {/* Action Button */}
        <div className="col-span-full">
           <button
             type="submit"
             className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-lg ${
               isSubmitted ? 'bg-green-600 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
             }`}
           >
             {isSubmitted ? (
               <>
                 <CheckCircle size={20} />
                 <span className="font-black uppercase tracking-[0.2em] text-sm">Incident Logged Successfully</span>
               </>
             ) : (
               <>
                 <Send size={20} />
                 <span className="font-black uppercase tracking-[0.2em] text-sm">Commit Record to Registry</span>
               </>
             )}
           </button>
           <p className="mt-4 text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
             Note: Submitted reports are immutable and stored in the secure cloud vault.
           </p>
        </div>
      </form>
    </div>
  );
}
