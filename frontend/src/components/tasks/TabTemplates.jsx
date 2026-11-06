import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList, Plus, Save, Clock, ShieldCheck, Trash2, Edit2, Link, Zap, X, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAYS_CONFIG = [
  { id: 'mon', label: 'M', name: 'Monday' },
  { id: 'tue', label: 'T', name: 'Tuesday' },
  { id: 'wed', label: 'W', name: 'Wednesday' },
  { id: 'thu', label: 'T', name: 'Thursday' },
  { id: 'fri', label: 'F', name: 'Friday' },
  { id: 'sat', label: 'S', name: 'Saturday' },
  { id: 'sun', label: 'S', name: 'Sunday' }
];

export default function TabTemplates() {
  const [templates, setTemplates] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Kitchen',
    required_permission_id: 'can_perform_opening_checks',
    checklist_id: '',
    deadline_time: '08:30',
    frequency: 'Daily', // 'Daily', 'Weekly', 'Monthly'
    recurring_days: ALL_DAYS, // Standard: All days ticked by default
    day_of_month: 1,
    is_recurring: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch recurring tasks (templates)
      const { data: tRes, error: tErr } = await supabase
        .from('tasks')
        .select('*, checklists(name)')
        .eq('is_recurring', true);

      if (tErr) console.warn("Task fetch error:", tErr.message);

      // 2. Fetch available checklists
      const { data: cRes } = await supabase
        .from('checklists')
        .select('id, name');

      setTemplates(tRes || []);
      setChecklists(cRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
          ...formData,
          checklist_id: formData.checklist_id || null,
          deadline_time: formData.deadline_time.length === 5 ? `${formData.deadline_time}:00` : formData.deadline_time
      };

      const { error } = await supabase.from('tasks').insert([dataToSave]);
      if (error) throw error;

      alert("Operation Template Created successfully.");
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'Kitchen',
        required_permission_id: 'can_perform_opening_checks',
        checklist_id: '',
        deadline_time: '08:30',
        frequency: 'Daily',
        recurring_days: ALL_DAYS,
        day_of_month: 1,
        is_recurring: true
      });
      fetchData();
    } catch (err) {
      alert("Error creating template: " + err.message);
    }
  };

  const toggleDay = (dayId) => {
    const current = formData.recurring_days || ALL_DAYS;
    let updated;
    if (current.includes(dayId)) {
      updated = current.filter(d => d !== dayId);
    } else {
      updated = [...current, dayId];
    }
    setFormData({ ...formData, recurring_days: updated });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this operation template?")) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  };

  if (loading) return <div className="py-20 text-center italic text-slate-400 animate-pulse text-xs uppercase font-black tracking-widest">Synchronizing template library...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-yellow-500 shadow-lg">
               <Zap size={16} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Templates</h4>
         </div>
         <button
           onClick={() => setShowForm(!showForm)}
           className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl active:scale-95"
         >
           {showForm ? <X size={14}/> : <Plus size={14} />}
           {showForm ? 'Close Designer' : 'New Operation'}
         </button>
      </div>

      {showForm && (
        <SummaryCard title="Design New Operation & Schedule" icon={ClipboardList}>
           <form onSubmit={handleSave} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Operation Title</label>
                       <input
                         type="text" required placeholder="e.g. FOH Opening Routine"
                         value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black focus:border-slate-900 outline-none transition-all shadow-sm"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Work Description</label>
                       <textarea
                         placeholder="Explain what needs to be achieved during this operation..."
                         value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium h-24 focus:border-slate-900 outline-none transition-all shadow-sm"
                       />
                    </div>

                    {/* FREQUENCY & SCHEDULE SELECTOR */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                       <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Schedule Frequency</label>
                          <div className="grid grid-cols-3 gap-2">
                             {['Daily', 'Weekly', 'Monthly'].map(f => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, frequency: f })}
                                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                     formData.frequency === f
                                     ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                     : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                   {f}
                                </button>
                             ))}
                          </div>
                       </div>

                       {/* Day of Week Selector for Daily / Weekly */}
                       {(formData.frequency === 'Daily' || formData.frequency === 'Weekly') && (
                          <div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Active Schedule Days:</span>
                             <div className="flex items-center gap-1.5">
                                {DAYS_CONFIG.map(day => {
                                   const isSelected = (formData.recurring_days || ALL_DAYS).includes(day.id);
                                   return (
                                      <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-8 h-8 rounded-xl text-[9px] font-black uppercase transition-all ${
                                           isSelected
                                           ? 'bg-emerald-600 text-white shadow-xs'
                                           : 'bg-white text-slate-300 border border-slate-200 hover:border-slate-300'
                                        }`}
                                        title={day.name}
                                      >
                                         {day.label}
                                      </button>
                                   );
                                })}
                             </div>
                             <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Default: All 7 days selected to avoid missing scheduled checks.</p>
                          </div>
                       )}

                       {/* Day of Month Selector for Monthly */}
                       {formData.frequency === 'Monthly' && (
                          <div>
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Day of Month</label>
                             <select
                               value={formData.day_of_month}
                               onChange={e => setFormData({ ...formData, day_of_month: parseInt(e.target.value, 10) })}
                               className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black"
                             >
                                <option value={1}>1st of every month</option>
                                <option value={15}>15th of every month</option>
                                <option value={28}>28th of every month</option>
                             </select>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Required Authority</label>
                       <select
                         required value={formData.required_permission_id}
                         onChange={e => setFormData({...formData, required_permission_id: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black focus:border-slate-900 outline-none transition-all shadow-sm cursor-pointer"
                       >
                          <option value="can_perform_opening_checks">Opening Manager Authority</option>
                          <option value="can_perform_closing_checks">Closing Manager Authority</option>
                          <option value="can_perform_food_safety_checks">Food Safety Authority</option>
                          <option value="can_manage_disciplinary">HR / Disciplinary Authority</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Linked Checklist</label>
                       <select
                         value={formData.checklist_id}
                         onChange={e => setFormData({...formData, checklist_id: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black focus:border-slate-900 outline-none transition-all shadow-sm cursor-pointer"
                       >
                          <option value="">-- No Checklist Linked --</option>
                          {checklists.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                       <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-tight ml-1 italic">Go to 'Protocol Designer' to create checklists first.</p>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Daily Deadline Time</label>
                       <input
                         type="time" required
                         value={formData.deadline_time} onChange={e => setFormData({...formData, deadline_time: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black focus:border-slate-900 outline-none transition-all shadow-sm"
                       />
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                 <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center gap-3">
                    <Save size={18} /> Publish to Operations
                 </button>
              </div>
           </form>
        </SummaryCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {templates.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
               <ClipboardList size={48} className="mx-auto mb-4 text-slate-100" />
               <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No operation templates found in the vault</p>
            </div>
         ) : templates.map(tmp => (
           <div key={tmp.id} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all group flex flex-col justify-between hover:border-slate-200">
              <div>
                 <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl border border-slate-800 group-hover:scale-110 transition-transform">
                       <ShieldCheck size={28} />
                    </div>
                    <button
                       onClick={() => handleDelete(tmp.id)}
                       className="p-3 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-75"
                    >
                       <Trash2 size={18}/>
                    </button>
                 </div>
                 <h4 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2 leading-tight">{tmp.title}</h4>
                 <p className="text-[11px] text-slate-400 font-medium line-clamp-3 mb-6 leading-relaxed">{tmp.description}</p>
              </div>

              <div className="space-y-4">
                 <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase flex items-center gap-1.5 shadow-lg shadow-slate-900/10">
                       <Clock size={12} className="text-yellow-500" /> {tmp.deadline_time ? tmp.deadline_time.substring(0,5) : '--:--'}
                    </span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[9px] font-black rounded-xl uppercase flex items-center gap-1.5 border border-slate-200">
                       <CalendarIcon size={12} /> {tmp.frequency || 'Daily'}
                    </span>
                    {tmp.checklists && (
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-xl uppercase flex items-center gap-1.5 border border-blue-100">
                         <Link size={12} /> {tmp.checklists.name}
                      </span>
                    )}
                 </div>
                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Authority:</p>
                    <span className="text-[9px] font-black text-emerald-600 uppercase">
                       {tmp.required_permission_id ? tmp.required_permission_id.replace('can_perform_', '').replace('_checks', '').replace(/_/g, ' ') : 'General'}
                    </span>
                 </div>
              </div>
           </div>
         ))}
      </div>

    </div>
  );
}
