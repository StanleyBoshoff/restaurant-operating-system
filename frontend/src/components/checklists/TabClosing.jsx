import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList, CheckCircle2, Circle, AlertCircle, Save, UserCheck, Trash2, Lock, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const CLOSING_DUTIES = [
  { id: 'close-1', category: 'General', task: 'All guests have safely vacated premises', mandatory: true },
  { id: 'close-2', category: 'General', task: 'Music and non-essential lighting switched off', mandatory: true },
  { id: 'close-3', category: 'Financial', task: 'Final Cash-Up completed and signed off', mandatory: true },
  { id: 'close-4', category: 'Kitchen', task: 'All gas valves closed and appliances off', mandatory: true },
  { id: 'close-5', category: 'Kitchen', task: 'Fridge/Freezer temperatures recorded', mandatory: true },
  { id: 'close-6', category: 'Kitchen', task: 'Waste disposal completed and area cleaned', mandatory: false },
  { id: 'close-7', category: 'Bar', task: 'Inventory secured and taps locked', mandatory: true },
  { id: 'close-8', category: 'Security', task: 'Alarm system armed and all doors double-locked', mandatory: true },
];

export default function TabClosing() {
  const [items, setItems] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [signingManager, setSigningManager] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ros_closing_checklist');
    if (saved) {
      const { completed, manager } = JSON.parse(saved);
      setCompletedIds(new Set(completed));
      setSigningManager(manager);
    }
    setItems(CLOSING_DUTIES);
  }, []);

  const toggleTask = (id) => {
    const newSet = new Set(completedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedIds(newSet);
    setIsSaved(false);
  };

  const handleSave = () => {
    const data = { completed: Array.from(completedIds), manager: signingManager, timestamp: new Date().toISOString() };
    localStorage.setItem('ros_closing_checklist', JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const progress = Math.round((completedIds.size / items.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Closing Compliance" icon={Lock}>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-rose-600">{progress}%</h2>
            <div className="flex-1 h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-rose-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Shutdown in progress</p>
        </SummaryCard>

        <SummaryCard title="Security Status" icon={ShieldCheck}>
           <div className="flex items-center gap-3 py-2">
            {progress === 100 ? (
              <div className="flex items-center gap-2 text-green-600 font-black text-sm uppercase tracking-tight">
                <ShieldCheck size={20} />
                Building Secure
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm uppercase tracking-tight">
                <AlertCircle size={20} />
                Hazards Present
              </div>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Final Sign-off" icon={UserCheck}>
          <input
            type="text"
            placeholder="Manager Name..."
            value={signingManager}
            onChange={(e) => setSigningManager(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
          />
          <button
            onClick={handleSave}
            className={`w-full mt-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${isSaved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            Commit Shutdown
          </button>
        </SummaryCard>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-2">
           <ClipboardList size={14} className="text-slate-400" />
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Master Shutdown Protocol</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-all text-left group"
            >
              <div className="mt-0.5">
                {completedIds.has(task.id) ? <CheckCircle2 size={18} className="text-rose-600" /> : <Circle size={18} className="text-slate-200" />}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${completedIds.has(task.id) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.task}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{task.category}</span>
                  {task.mandatory && <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Legal Requirement</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
