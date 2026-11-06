import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { CheckSquare, CheckCircle2, Clock, Calendar, User, FileText, Search, X, ShieldCheck, ArrowUpRight, RefreshCw, Check, MessageSquare, Zap, AlertTriangle } from 'lucide-react';
import { getCompletedTasks } from '../../utils/taskService';
import { supabase } from '../../supabaseClient';
import StatusBadge from '../common/StatusBadge';

/**
 * Calculates whether a completed task was finished on time or overdue.
 */
const getTaskTimingDetails = (task) => {
  if (!task.completed_at) return { isOverdue: false, text: 'N/A' };

  const completedDate = new Date(task.completed_at);

  let dueDate = null;
  if (task.due_date) {
    dueDate = new Date(task.due_date);
    if (task.deadline_time) {
      const parts = task.deadline_time.split(':');
      dueDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    } else {
      dueDate.setHours(23, 59, 59, 999);
    }
  }

  const isOverdue = dueDate ? completedDate > dueDate : false;

  const dueFormatted = task.due_date
    ? `${task.due_date.split('T')[0]} ${task.deadline_time ? task.deadline_time.substring(0, 5) : ''}`
    : 'No Deadline';

  return {
    isOverdue,
    dueFormatted,
    completedFormatted: completedDate.toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' }),
    timeOnly: completedDate.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    dateOnly: completedDate.toLocaleDateString('en-ZA')
  };
};

export default function TabCompleted() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Checklist Inspection State
  const [selectedTask, setSelectedTask] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistSubmission, setChecklistSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  const fetchArchivedTasks = async () => {
    setLoading(true);
    try {
      const data = await getCompletedTasks();
      setCompletedTasks(data || []);
    } catch (err) {
      console.error("Failed to fetch archived tasks:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Checklist Items and Submission details when a task is opened
  const handleOpenSummary = async (task) => {
    setSelectedTask(task);
    setChecklistItems([]);
    setChecklistSubmission(null);

    if (task.checklist_id) {
      setDetailLoading(true);
      try {
        // 1. Fetch Checklist Items
        const { data: items } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('checklist_id', task.checklist_id)
          .order('sort_order', { ascending: true });

        setChecklistItems(items || []);

        // 2. Fetch Latest/Matching Submission
        const { data: subs } = await supabase
          .from('checklist_submissions')
          .select('*')
          .eq('checklist_id', task.checklist_id)
          .order('completed_at', { ascending: false });

        if (subs && subs.length > 0) {
          setChecklistSubmission(subs[0]);
        }
      } catch (err) {
        console.error("Error loading checklist report details:", err.message);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const filteredTasks = completedTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employees?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employees?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
         <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Archived Task Boards</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Historical record of finalized operations, timing compliance, and audit summaries.</p>
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                 type="text"
                 placeholder="Search archive..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:border-slate-900 outline-none transition-all"
               />
            </div>
            <button onClick={fetchArchivedTasks} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all active:rotate-180 duration-500 text-slate-600">
               <RefreshCw size={14} />
            </button>
         </div>
      </div>

      {/* Archived Task List */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="pl-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operation / Title</th>
                     <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                     <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed By</th>
                     <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Due Date & Time</th>
                     <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Completed At</th>
                     <th className="pr-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="py-20 text-center italic text-slate-400 text-xs">Loading archived task history...</td></tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr><td colSpan="6" className="py-20 text-center italic text-slate-400 text-xs uppercase font-bold tracking-widest">No archived tasks found</td></tr>
                  ) : filteredTasks.map(task => {
                    const timing = getTaskTimingDetails(task);
                    const completedByStr = task.employees
                      ? `${task.employees.first_name} ${task.employees.last_name}`
                      : task.checklists?.checklist_submissions?.[0]?.submitted_by_name
                      ? task.checklists.checklist_submissions[0].submitted_by_name
                      : 'Staff Operator';
                    const completedByRole = task.employees?.role || 'Staff Operator';

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/75 transition-colors group cursor-pointer" onClick={() => handleOpenSummary(task)}>
                         <td className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-100 shrink-0">
                                  <CheckCircle2 size={18} />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{task.title}</p>
                                  <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{task.description || 'No description provided.'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-4 text-center">
                            <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                               {task.category || 'Standard'}
                            </span>
                         </td>
                         <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center font-black text-[9px] text-slate-600">
                                  {completedByStr[0]}
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{completedByStr}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{completedByRole}</p>
                               </div>
                            </div>
                         </td>

                         {/* DUE DATE & TIME */}
                         <td className="px-4 py-4 text-center">
                            <span className="text-[10px] font-bold text-slate-600">
                               {timing.dueFormatted}
                            </span>
                         </td>

                         {/* COMPLETED AT */}
                         <td className="px-4 py-4 text-center">
                            <span className={`text-[10px] font-black ${
                               timing.isOverdue ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                               {timing.completedFormatted}
                            </span>
                         </td>

                         <td className="pr-6 py-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenSummary(task); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm"
                            >
                               <FileText size={12} /> Summary <ArrowUpRight size={12} />
                            </button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* TASK REPORT SUMMARY MODAL */}
      {selectedTask && (() => {
         const timing = getTaskTimingDetails(selectedTask);
         const completedByStr = selectedTask.employees
           ? `${selectedTask.employees.first_name} ${selectedTask.employees.last_name}`
           : checklistSubmission?.submitted_by_name
           ? checklistSubmission.submitted_by_name
           : selectedTask.checklists?.checklist_submissions?.[0]?.submitted_by_name
           ? selectedTask.checklists.checklist_submissions[0].submitted_by_name
           : 'Staff Operator';
         const completedByRole = selectedTask.employees?.role || 'Staff Operator';

         return (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
               <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6 animate-in zoom-in-95 duration-300">

                  {/* Modal Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner bg-emerald-50 text-emerald-600 border-emerald-100">
                           <ShieldCheck size={28} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                 <Check size={10} strokeWidth={3} /> Archived & Verified
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{selectedTask.category}</span>
                           </div>
                           <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedTask.title}</h2>
                        </div>
                     </div>
                     <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Modal Body: Task Summary Details */}
                  <div className="space-y-6">

                     {/* Description */}
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Task Specification / Instructions</h4>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{selectedTask.description || 'No specific instructions logged for this task board.'}</p>
                     </div>

                     {/* Key Metrics Grid */}
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Completed / Executed By</span>
                           <p className="text-xs font-black text-slate-900 uppercase">{completedByStr}</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{completedByRole}</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date & Time</span>
                           <p className="text-xs font-black text-slate-900 uppercase">{selectedTask.due_date ? selectedTask.due_date.split('T')[0] : 'N/A'}</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Deadline: {selectedTask.deadline_time ? selectedTask.deadline_time.substring(0,5) : '--:--'}</p>
                        </div>

                        {/* Completion Timestamp Box */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Completion Timestamp</span>
                           <p className={`text-xs font-black uppercase ${timing.isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {timing.timeOnly}
                           </p>
                           <p className={`text-[9px] font-bold uppercase mt-0.5 ${timing.isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {timing.dateOnly}
                           </p>
                        </div>
                     </div>

                     {/* Checklist Items Inspection */}
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Inspection Log (Completed / Issues / Quantities)</h4>
                           {checklistSubmission && (
                              <span className="text-[9px] font-bold text-slate-500 uppercase">Submitted by: {checklistSubmission.submitted_by_name || completedByStr}</span>
                           )}
                        </div>

                        {detailLoading ? (
                           <div className="py-10 text-center italic text-slate-400 text-xs">Loading inspection verification data...</div>
                        ) : checklistItems.length === 0 ? (
                           <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs italic">
                              This task board was completed as a direct operational sign-off without a sub-checklist.
                           </div>
                        ) : (
                           <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                              {checklistItems.map((item, index) => {
                                 const submissionEntry = checklistSubmission?.submission_data?.[item.id] || {};
                                 const status = submissionEntry.status;
                                 const comment = submissionEntry.comment;
                                 const quantity = submissionEntry.quantity;
                                 const enabledOptions = item.enabled_options || ['tick', 'cross'];

                                 return (
                                    <div key={item.id} className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                                       status === 'tick' ? 'bg-emerald-50/60 border-emerald-200' :
                                       status === 'cross' ? 'bg-rose-50/60 border-rose-200' :
                                       status === 'action' ? 'bg-amber-50/60 border-amber-200' :
                                       'bg-slate-50 border-slate-200 opacity-75'
                                    }`}>
                                       <div className="flex items-start justify-between gap-4">
                                          <div className="flex items-start gap-3">
                                             <span className="text-xs font-black text-slate-400 w-5">{index + 1}.</span>
                                             <div>
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.task_description}</p>
                                                {item.is_mandatory && <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter">Mandatory Item</span>}
                                             </div>
                                          </div>

                                          <div>
                                             {status === 'tick' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm">
                                                   <Check size={12} strokeWidth={3} /> Completed
                                                </span>
                                             )}
                                             {status === 'cross' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm">
                                                   <X size={12} strokeWidth={3} /> Issue noted
                                                </span>
                                             )}
                                             {status === 'action' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm">
                                                   <Zap size={12} /> {enabledOptions.includes('prep') ? 'Prep' : enabledOptions.includes('fill') ? 'Fill' : 'Action'} (Qty: {quantity || 0})
                                                </span>
                                             )}
                                             {!status && (
                                                <span className="inline-flex items-center px-2.5 py-1 bg-slate-200 text-slate-600 rounded-xl text-[8px] font-black uppercase tracking-wider">
                                                   Not Verified
                                                </span>
                                             )}
                                          </div>
                                       </div>

                                       {comment && (
                                          <div className="ml-8 mt-1 p-3 bg-white/80 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-slate-700 shadow-3xs">
                                             <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                             <div>
                                                <span className="font-black text-[9px] text-blue-900 uppercase block tracking-wider">Staff Note / Comment:</span>
                                                <p className="font-medium">{comment}</p>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>

                     {/* Compliance / Audit Footer note */}
                     <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                        <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-900 font-medium leading-relaxed">
                           This task log is cryptographically recorded and store-proofed in compliance with CCMA statutory requirements and South African labor record retention policies.
                        </p>
                     </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                     <button
                       onClick={() => setSelectedTask(null)}
                       className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl tracking-wider shadow-lg transition-all"
                     >
                        Close Summary
                     </button>
                  </div>

               </div>
            </div>
         );
      })()}

    </div>
  );
}
