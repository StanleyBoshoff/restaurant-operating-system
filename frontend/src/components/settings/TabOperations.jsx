import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Settings2, Save, Clock, Bell, Info, ShieldAlert, Timer } from 'lucide-react';
import { getOperationalSettings, updateOperationalSettings } from '../../utils/operationalService';

export default function TabOperations() {
  const [settings, setSettings] = useState({
    opening_shift_start: '07:00:00',
    closing_shift_start: '12:00:00',
    arrival_threshold_mins: 15,
    task_threshold_mins: 30
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getOperationalSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load operational settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOperationalSettings(settings);
      alert("Operations Engine updated successfully.");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center italic text-slate-400">Synchronizing operational engine...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-20">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Operations Engine</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Configure shift triggers, arrival thresholds and escalation rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Syncing...' : 'Save Rules'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Shift Synchronization */}
        <SummaryCard title="Shift Anchor Points" icon={Clock}>
           <div className="space-y-6 py-4">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Opening Shift (Shift 1) Start</label>
                 <input
                   type="time"
                   value={settings.opening_shift_start}
                   onChange={e => setSettings({...settings, opening_shift_start: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black"
                 />
                 <p className="text-[9px] text-slate-400 mt-2">Morning checklists will be anchored to this time.</p>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Closing Shift (Shift 2) Start</label>
                 <input
                   type="time"
                   value={settings.closing_shift_start}
                   onChange={e => setSettings({...settings, closing_shift_start: e.target.value})}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black"
                 />
                 <p className="text-[9px] text-slate-400 mt-2">Evening responsibility transfers to the next manager at this point.</p>
              </div>
           </div>
        </SummaryCard>

        {/* Arrival Thresholds */}
        <SummaryCard title="Accountability Thresholds" icon={ShieldAlert}>
           <div className="space-y-6 py-4">
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manager Arrival Grace Period</label>
                 <div className="flex items-center gap-3">
                    <input
                      type="range" min="5" max="60" step="5"
                      value={settings.arrival_threshold_mins}
                      onChange={e => setSettings({...settings, arrival_threshold_mins: parseInt(e.target.value)})}
                      className="flex-1 accent-yellow-600"
                    />
                    <span className="w-12 text-center text-xs font-black text-slate-900">{settings.arrival_threshold_mins}m</span>
                 </div>
                 <p className="text-[9px] text-slate-400 mt-2 italic">Alerts fire if no authorized manager clocks in by Shift Start + this period.</p>
              </div>

              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Checklist Completion Deadline</label>
                 <div className="flex items-center gap-3">
                    <input
                      type="range" min="15" max="120" step="15"
                      value={settings.task_threshold_mins}
                      onChange={e => setSettings({...settings, task_threshold_mins: parseInt(e.target.value)})}
                      className="flex-1 accent-yellow-600"
                    />
                    <span className="w-12 text-center text-xs font-black text-slate-900">{settings.task_threshold_mins}m</span>
                 </div>
                 <p className="text-[9px] text-slate-400 mt-2 italic">Standard tasks must be started within this window of their anchor time.</p>
              </div>
           </div>
        </SummaryCard>

      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
         <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <Info size={20} />
         </div>
         <div>
            <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Escalation Logic Notice</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              The system uses these thresholds to automatically route responsibilities. If a Shift 2 manager is missing, the Opening Manager remains accountable for all critical Afternoon checks until the handover is verified.
            </p>
         </div>
      </div>
    </div>
  );
}
