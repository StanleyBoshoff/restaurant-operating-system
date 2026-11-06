import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList, CheckCircle2, AlertCircle, Save, UserCheck, Trash2, Timer, User, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { getChecklistItems, submitChecklist, getAssignedStaffForChecklist } from '../../utils/checklistService';
import ChecklistItemMobile from './ChecklistItemMobile';
import CommentModal from './CommentModal';
import NotificationModal from '../common/NotificationModal';
import { useAuth } from '../../context/AuthContext';

export default function TabOpening() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [submissionData, setSubmissionData] = useState({});
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startedAt] = useState(new Date().toISOString());

  const [commentTargetId, setCommentTargetId] = useState(null);

  // Custom Notification Modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  const notify = (title, message, type = 'warning', onConfirm = null) => {
    setModalConfig({ isOpen: true, type, title, message, onConfirm });
  };

  useEffect(() => {
    fetchItems();
    fetchAssignment();

    const saved = localStorage.getItem('ros_opening_checklist_v2_draft');
    if (saved) {
      setSubmissionData(JSON.parse(saved));
    }
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getChecklistItems('Opening Duty');
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignment = async () => {
     const staff = await getAssignedStaffForChecklist('can_perform_opening_checks');
     setAssignedStaff(staff);
  };

  const handleItemChange = (itemId, value) => {
    const newData = { ...submissionData, [itemId]: value };
    setSubmissionData(newData);
    setIsSaved(false);
    localStorage.setItem('ros_opening_checklist_v2_draft', JSON.stringify(newData));
  };

  const handleSave = async () => {
    if (!currentUser) return notify("Authentication Required", "You must be logged in to sign off.", 'warning');

    for (const item of items) {
       const val = submissionData[item.id];
       if (item.is_mandatory && !val?.status) {
          return notify("Mandatory Point Missing", `Please complete mandatory task: "${item.task_description}"`, 'warning');
       }
       if (val?.status === 'cross' && !val?.comment) {
          return notify("Comment Required", `Please explain the issue for: "${item.task_description}"`, 'warning');
       }
    }

    try {
      await submitChecklist('Opening Duty', submissionData, currentUser.id, `${currentUser.first_name} ${currentUser.last_name}`, startedAt);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      localStorage.removeItem('ros_opening_checklist_v2_draft');
      setSubmissionData({});
      notify("Opening Duty Checklist", "Opening Duty Checklist successfully committed and archived.", 'success');
    } catch (err) {
      notify("Submission Error", "Failed to archive submission: " + err.message, 'error');
    }
  };

  const clearChecklist = () => {
    notify(
      "Reset Checklist Progress?",
      "Are you sure you want to reset the Opening Duty Checklist and clear all progress?",
      'warning',
      () => {
        setSubmissionData({});
        localStorage.removeItem('ros_opening_checklist_v2_draft');
      }
    );
  };

  const progress = items.length > 0
    ? Math.round((Object.keys(submissionData).filter(id => submissionData[id]?.status).length / items.length) * 100)
    : 0;

  const categories = [...new Set(items.map(i => i.category || 'General'))];

  if (loading) return <div className="py-20 text-center italic text-slate-400 animate-pulse">Syncing Opening Duty Checklist...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">

      {/* 1. Assignment & Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Current Responsibility" icon={UserCheck}>
           <div className="flex items-center gap-4 py-1">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-emerald-400 shadow-xl border border-slate-800">
                 {assignedStaff ? `${assignedStaff.first_name[0]}${assignedStaff.last_name[0]}` : '??'}
              </div>
              <div>
                 <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    {assignedStaff ? `${assignedStaff.first_name} ${assignedStaff.last_name}` : 'Awaiting Manager...'}
                 </p>
                 <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assignee</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase">Lowest LVL Qualified</span>
                 </div>
              </div>
           </div>
           {assignedStaff?.id === currentUser?.id ? (
             <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">You are accountable for this shift</p>
             </div>
           ) : (
             <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Viewing in monitoring mode</p>
             </div>
           )}
        </SummaryCard>

        <SummaryCard title="Opening Progress" icon={Timer}>
           <div className="flex items-end justify-between gap-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{progress}%</h2>
              <div className="flex-1 pb-1">
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-100">
                    <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-lg" style={{ width: `${progress}%` }} />
                 </div>
              </div>
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">
              {Object.keys(submissionData).filter(id => submissionData[id]?.status).length} of {items.length} Points Verified
           </p>
        </SummaryCard>

        <SummaryCard title="Checksheet Sign-Off" icon={Save}>
           <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={progress < 50}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl cursor-pointer ${
                    progress === 100
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30'
                }`}
              >
                 <CheckCircle size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Submit Opening Checklist</span>
              </button>
              <button onClick={clearChecklist} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors cursor-pointer">
                 Reset Progress
              </button>
           </div>
        </SummaryCard>
      </div>

      {/* 2. Checklist Groups */}
      <div className="space-y-8">
        {categories.map(cat => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-4 px-2">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{cat}</h4>
               <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {items.filter(i => i.category === cat).map(item => (
                 <ChecklistItemMobile
                   key={item.id}
                   item={item}
                   value={submissionData[item.id]}
                   onChange={(val) => handleItemChange(item.id, val)}
                   onCommentClick={(id) => setCommentTargetId(id)}
                 />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Global Information Footer */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center text-white shadow-2xl border-4 border-slate-800 rotate-3">
               <ShieldAlert size={32} />
            </div>
            <div>
               <h4 className="text-lg font-black uppercase tracking-tight">Accountability Record Notice</h4>
               <p className="text-[10px] text-slate-400 font-medium max-w-md leading-relaxed mt-1 uppercase tracking-tighter">
                  This checksheet is an official store record. Misrepresentation of facts is subject to statutory disciplinary procedure.
               </p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive ID</p>
               <p className="text-[9px] font-bold text-slate-400 font-mono">OP-{new Date().getTime().toString(16).toUpperCase()}</p>
            </div>
            <div className="w-px h-10 bg-slate-800 mx-2" />
            <StatusBadge status="CCMA COMPLIANT" />
         </div>
      </div>

      <CommentModal
        isOpen={!!commentTargetId}
        onClose={() => setCommentTargetId(null)}
        title={items.find(i => i.id === commentTargetId)?.task_description}
        initialValue={submissionData[commentTargetId]?.comment}
        onSave={(text) => handleItemChange(commentTargetId, { ...submissionData[commentTargetId], comment: text })}
      />

      <NotificationModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
