import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../common/SummaryCard';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, Calendar, Filter, Play } from 'lucide-react';
import { getTasksToday, syncDailyTasks, updateTaskStatus } from '../../utils/taskService';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { canDo } from '../../utils/permissionService';

export default function TabOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
       await syncDailyTasks(); // 🚀 Ensure today's tasks are generated
       fetchTasks();
    };
    init();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasksToday();
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      // 1. Verify Authority: Use required_permission_id from task template
      const hasAuthority = canDo(user, task.required_permission_id);
      if (!hasAuthority) return alert("You do not have the required authority for this operation.");

      // 2. Start Task & Assign to current user
      await updateTaskStatus(task.id, 'In Progress', { assigned_to_id: user.id });

      // 3. Navigation
      if (task.checklist_id) {
          navigate(`/checklists/run/${task.checklist_id}?taskId=${task.id}`);
      } else {
          fetchTasks();
      }
    } catch (err) {
      alert("Failed to start task: " + err.message);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    overdue: tasks.filter(t => t.status === 'Overdue' || t.status === 'Escalated').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length
  };

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* 1. Progress Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-1 bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Daily Task Completion</p>
               <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
               <h2 className="text-5xl font-black tracking-tighter">{progress}%</h2>
               <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-widest">{stats.completed} of {stats.total} Tasks Handled</p>
            </div>
         </div>

         <div className="md:col-span-3 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex items-center gap-8 overflow-x-auto no-scrollbar">
            <div className="flex flex-col min-w-[100px]">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Open</span>
               <span className="text-3xl font-black text-slate-900">{stats.pending}</span>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="flex flex-col min-w-[100px]">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</span>
               <span className="text-3xl font-black text-blue-600">{stats.inProgress}</span>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="flex flex-col min-w-[100px]">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical</span>
               <span className="text-3xl font-black text-rose-600">{stats.overdue}</span>
            </div>
            <div className="w-px h-12 bg-slate-100" />
            <div className="flex-1 min-w-[200px]">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Status</p>
               <div className="flex items-center gap-3">
                  {progress > 80 ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                       <CheckCircle2 size={16} /> OPERATIONS ON TRACK
                    </div>
                  ) : stats.overdue > 0 ? (
                    <div className="flex items-center gap-2 text-rose-600 font-black text-xs animate-pulse">
                       <AlertTriangle size={16} /> ESCALATIONS DETECTED
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 font-black text-xs">
                       <Clock size={16} /> SHIFT SETUP IN PROGRESS
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* 2. Urgent / Accountability Alerts */}
      {stats.overdue > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
           <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <AlertTriangle size={24} />
           </div>
           <div>
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Manager Attention Required</h4>
              <p className="text-[11px] text-rose-700 font-medium leading-relaxed max-w-2xl mt-1">
                 {stats.overdue} operational tasks have exceeded their time threshold. Accountability alerts have been logged. Please review the "Critical" items in the task log below.
              </p>
           </div>
        </div>
      )}

      {/* 3. Daily Task Feed */}
      <SummaryCard
        title="Operations Log (Today)"
        icon={CheckSquare}
        badge={<span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase">Live Feed</span>}
      >
        <div className="overflow-x-auto -mx-4 -mb-4 no-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="pl-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operation / Task</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Deadline</th>
                    <th className="pr-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   <tr><td colSpan="5" className="py-20 text-center animate-pulse italic text-slate-400 text-xs">Syncing real-time tasks...</td></tr>
                 ) : tasks.length === 0 ? (
                   <tr><td colSpan="5" className="py-20 text-center italic text-slate-400 text-xs uppercase font-bold tracking-widest">No tasks assigned for this shift yet</td></tr>
                 ) : tasks.map(task => (
                   <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="pl-6 py-5">
                         <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase leading-tight tracking-tight">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-bold text-slate-400 uppercase">{task.category}</span>
                               {task.checklists && (
                                 <>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">Linked: {task.checklists.name}</span>
                                 </>
                               )}
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                         <div className="flex justify-center">
                            <StatusBadge status={task.status} />
                         </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                               {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'No Date'}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                               task.status === 'Overdue' || task.status === 'Escalated'
                               ? 'bg-rose-50 border-rose-100 text-rose-600'
                               : 'bg-slate-50 border-slate-100 text-slate-600'
                            }`}>
                               {task.deadline_time ? task.deadline_time.substring(0,5) : '--:--'}
                            </span>
                         </div>
                      </td>
                      <td className="pr-6 py-5 text-right">
                         <div className="flex flex-col items-end gap-2">
                            {task.status === 'Pending' ? (
                               <button
                                 onClick={() => handleStartTask(task)}
                                 className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-90 shadow-lg"
                               >
                                  <Play size={10} fill="currentColor" /> Start Task
                               </button>
                            ) : (
                               <>
                                  <span className="text-[10px] font-black text-slate-900 uppercase">
                                     {task.status === 'Completed' ? 'ARCHIVED' : 'INSPECTION'}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                     {task.completed_at ? new Date(task.completed_at).toLocaleTimeString('en-ZA', {hour:'2-digit', minute:'2-digit'}) : 'Pending Sign-off'}
                                  </span>
                               </>
                            )}
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </SummaryCard>
    </div>
  );
}
