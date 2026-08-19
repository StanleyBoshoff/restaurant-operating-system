import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import SummaryCard from '../common/SummaryCard';
import { Timer, UserCheck, Save, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import ChecklistItemMobile from './ChecklistItemMobile';
import CommentModal from './CommentModal';
import { useAuth } from '../../context/AuthContext';
import { submitChecklist } from '../../utils/checklistService';

export default function ChecklistRunner() {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [submissionData, setSubmissionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [startedAt] = useState(new Date().toISOString());
  const [commentTargetId, setCommentTargetId] = useState(null);

  useEffect(() => {
    fetchChecklistDetails();

    const saved = localStorage.getItem(`ros_checklist_run_${checklistId}`);
    if (saved) setSubmissionData(JSON.parse(saved));
  }, [checklistId]);

  const fetchChecklistDetails = async () => {
    setLoading(true);
    try {
      const { data: cl } = await supabase.from('checklists').select('*').eq('id', checklistId).single();
      const { data: its } = await supabase.from('checklist_items').select('*').eq('checklist_id', checklistId).order('sort_order');

      setChecklist(cl);
      setItems(its || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId, value) => {
    const newData = { ...submissionData, [itemId]: value };
    setSubmissionData(newData);
    localStorage.setItem(`ros_checklist_run_${checklistId}`, JSON.stringify(newData));
  };

  const handleSave = async () => {
    if (!currentUser) return alert("Session expired. Please login again.");

    // Validation
    for (const item of items) {
       const val = submissionData[item.id];
       if (item.is_mandatory && !val?.status) return alert(`Mandatory Item Missing: ${item.task_description}`);
       if (val?.status === 'cross' && !val?.comment) return alert(`Comment Required for: ${item.task_description}`);
    }

    try {
      await submitChecklist(checklist.name, submissionData, currentUser.id, `${currentUser.first_name} ${currentUser.last_name}`, startedAt);

      // Update Task status if navigated from tasks
      const searchParams = new URLSearchParams(window.location.search);
      const taskId = searchParams.get('taskId');
      if (taskId) {
          await supabase.from('tasks').update({ status: 'Completed', completed_at: new Date().toISOString() }).eq('id', taskId);
      }

      localStorage.removeItem(`ros_checklist_run_${checklistId}`);
      alert("Protocol finalized and archived.");
      navigate('/tasks/open');
    } catch (err) {
      alert("Submission failed: " + err.message);
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse italic text-slate-400">Loading Protocol...</div>;
  if (!checklist) return <div className="py-20 text-center text-rose-500 font-black">PROTOCOL NOT FOUND</div>;

  const progress = items.length > 0 ? Math.round((Object.keys(submissionData).filter(id => submissionData[id]?.status).length / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">

      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-2">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft size={14} /> Back to Boards
         </button>
         <div className="text-right">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocol Runner</p>
            <p className="text-[10px] font-black text-slate-900 uppercase">{checklist.name}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <SummaryCard title="Current Session" icon={Timer}>
            <div className="flex items-end justify-between gap-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{progress}%</h2>
               <div className="flex-1 pb-1">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                     <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-lg" style={{ width: `${progress}%` }} />
                  </div>
               </div>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">
               {Object.keys(submissionData).filter(id => submissionData[id]?.status).length} of {items.length} Points Verified
            </p>
         </SummaryCard>

         <SummaryCard title="Finalization" icon={Save}>
            <button
                onClick={handleSave}
                disabled={progress < 10}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                    progress === 100
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white disabled:opacity-30'
                }`}
              >
                 <CheckCircle size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Submit & Finish</span>
              </button>
         </SummaryCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {items.map(item => (
            <ChecklistItemMobile
              key={item.id}
              item={item}
              value={submissionData[item.id]}
              onChange={(val) => handleItemChange(item.id, val)}
              onCommentClick={(id) => setCommentTargetId(id)}
            />
         ))}
      </div>

      <CommentModal
        isOpen={!!commentTargetId}
        onClose={() => setCommentTargetId(null)}
        title={items.find(i => i.id === commentTargetId)?.task_description}
        initialValue={submissionData[commentTargetId]?.comment}
        onSave={(text) => handleItemChange(commentTargetId, { ...submissionData[commentTargetId], comment: text })}
      />
    </div>
  );
}
