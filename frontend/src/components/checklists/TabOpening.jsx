import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList, CheckCircle2, Circle, AlertCircle, Save, UserCheck, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { getChecklistItems, submitChecklist } from '../../utils/checklistService';

export default function TabOpening() {
  const [items, setItems] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [signingManager, setSigningManager] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();

    // Recovery from local storage for in-progress work
    const saved = localStorage.getItem('ros_opening_checklist_draft');
    if (saved) {
      const { completed, manager } = JSON.parse(saved);
      setCompletedIds(new Set(completed));
      setSigningManager(manager);
    }
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getChecklistItems('Opening Duty');
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load checklist items:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id) => {
    const newSet = new Set(completedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedIds(newSet);
    setIsSaved(false);

    // Save draft locally
    localStorage.setItem('ros_opening_checklist_draft', JSON.stringify({
      completed: Array.from(newSet),
      manager: signingManager
    }));
  };

  const handleSave = async () => {
    if (!signingManager) return alert("Please enter manager name for sign-off.");

    const submissionData = items.map(item => ({
      id: item.id,
      task: item.task_description,
      completed: completedIds.has(item.id)
    }));

    try {
      await submitChecklist('Opening Duty', submissionData, signingManager);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Clear draft
      localStorage.removeItem('ros_opening_checklist_draft');
    } catch (err) {
      alert("Failed to submit checklist: " + err.message);
    }
  };

  const clearChecklist = () => {
    if (window.confirm("Are you sure you want to reset the opening checklist?")) {
      setCompletedIds(new Set());
      setSigningManager('');
      localStorage.removeItem('ros_opening_checklist');
    }
  };

  const categories = [...new Set(items.map(i => i.category || 'General'))];
  const progress = items.length > 0 ? Math.round((completedIds.size / items.length) * 100) : 0;

  if (loading) return (
    <div className="py-20 text-center italic text-slate-400 animate-pulse">
       Loading store protocols from secure vault...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Progress Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Opening Readiness" icon={ClipboardList}>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{progress}%</h2>
            <div className="flex-1 h-2 bg-slate-100 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-yellow-600 transition-all duration-700"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
            {completedIds.size} of {items.length} tasks completed
          </p>
        </SummaryCard>

        <SummaryCard title="Compliance Status" icon={AlertCircle}>
          <div className="flex items-center gap-3 py-2">
            {progress === 100 ? (
              <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                <CheckCircle2 size={20} />
                READY FOR SERVICE
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
                <AlertCircle size={20} />
                SETUP IN PROGRESS
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">
            All mandatory items must be checked.
          </p>
        </SummaryCard>

        <SummaryCard title="Digital Sign-off" icon={UserCheck}>
          <input
            type="text"
            placeholder="Manager Name..."
            value={signingManager}
            onChange={(e) => setSigningManager(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                isSaved ? 'bg-green-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Save size={12} />
              {isSaved ? 'Submission Saved' : 'Save Progress'}
            </button>
            <button
              onClick={clearChecklist}
              className="px-3 py-2 bg-white border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </SummaryCard>
      </div>

      {/* Checklist Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <SummaryCard
            key={cat}
            title={cat}
            icon={ClipboardList}
            badge={<StatusBadge status={completedIds.size === items.length ? 'Ready' : 'Pending'} />}
          >
            <div className="space-y-1">
              {items.filter(i => i.category === cat).map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-start gap-4 p-3 rounded-xl transition-all text-left ${
                    completedIds.has(task.id)
                    ? 'bg-slate-50 text-slate-400'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'
                  }`}
                >
                  <div className="mt-0.5">
                    {completedIds.has(task.id)
                      ? <CheckCircle2 size={18} className="text-yellow-600" />
                      : <Circle size={18} className="text-slate-200" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${completedIds.has(task.id) ? 'line-through decoration-slate-300' : ''}`}>
                      {task.task_description}
                    </p>
                    {task.is_mandatory && (
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Mandatory Compliance Item</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </SummaryCard>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest">Opening Protocol</h4>
            <p className="text-[10px] text-slate-400">All checklists must be finalized 15 minutes prior to store opening.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <StatusBadge status="CCMA COMPLIANT" />
           <StatusBadge status="AUDITABLE" />
        </div>
      </div>
    </div>
  );
}
