import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../common/SummaryCard';
import { CheckSquare, Play, CheckCircle, Clock, AlertCircle, RefreshCw, UserPlus, Zap } from 'lucide-react';
import { getTasksToday, updateTaskStatus } from '../../utils/taskService';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { canDo } from '../../utils/permissionService';

export default function TabOpen() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasksToday();
      setTasks(data?.filter(t => t.status !== 'Completed') || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      // 1. Verify Authority
      const hasAuthority = canDo(currentUser, task.required_permission_id);
      if (!hasAuthority) return alert("You do not have the required authority for this operation.");

      // 2. Start Task & Assign to current user
      await updateTaskStatus(task.id, 'In Progress', { assigned_to_id: currentUser.id });

      // 3. Direct Navigation: If there's a linked checklist, open it instantly
      if (task.checklist_id) {
          navigate(`/checklists/run/${task.checklist_id}?taskId=${task.id}`);
      } else {
          fetchTasks();
      }
    } catch (err) {
      alert("Failed to start task: " + err.message);
    }
  };

  const handleResumeTask = (task) => {
      if (task.checklist_id) {
          navigate(`/checklists/run/${task.checklist_id}?taskId=${task.id}`);
      }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTaskStatus(taskId, 'Completed');
      fetchTasks();
    } catch (err) {
      alert("Failed to complete task: " + err.message);
    }
  };

  if (loading) return <div className="py-20 text-center italic text-slate-400">Syncing active floor tasks...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <div className="flex items-center justify-between px-2">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Workspace</h4>
         <button onClick={fetchTasks} className="p-2 hover:bg-slate-100 rounded-full transition-all active:rotate-180 duration-500"><RefreshCw size={14} className="text-slate-400"/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
             <CheckSquare size={48} className="mx-auto mb-4 text-slate-200" />
             <h3 className="text-lg font-black text-slate-900 uppercase">Shift clear</h3>
             <p className="text-xs text-slate-400 mt-2 italic font-medium">All assigned operations have been finalized.</p>
          </div>
        ) : (
          tasks.map(task => {
            const isAssignedToMe = task.assigned_to_id === currentUser?.id;

            return (
              <div key={task.id} className={`bg-white border-2 rounded-[2rem] p-6 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                task.status === 'In Progress' ? 'border-blue-500/30 bg-blue-50/5' :
                task.status === 'Overdue' ? 'border-rose-500/30 bg-rose-50/5' : 'border-slate-100'
              }`}>
                 <div className="space-y-4">
                    <div className="flex items-start justify-between">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                          task.status === 'In Progress' ? 'bg-blue-600 text-white' :
                          task.status === 'Overdue' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-emerald-400'
                       } shadow-xl group-hover:scale-110 transition-transform`}>
                          {task.category?.[0]?.toUpperCase() || 'T'}
                       </div>
                       <StatusBadge status={task.status} />
                    </div>

                    <div>
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight mb-1">{task.title}</h3>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                          <Clock size={12} />
                          Deadline: {task.deadline_time ? task.deadline_time.substring(0,5) : '--:--'}
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                    {task.status !== 'Pending' && (
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center font-black text-[9px] text-slate-400 border border-slate-100">
                                {task.employees ? task.employees.first_name[0] : '?'}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-700 leading-none mb-0.5">{task.employees ? task.employees.first_name : 'Unassigned'}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{task.employees?.role || 'Staff Slot'}</p>
                             </div>
                          </div>
                       </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                       {task.status === 'Pending' ? (
                          <button
                            onClick={() => handleStartTask(task)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                             <Play size={12} fill="currentColor"/> Begin Work
                          </button>
                       ) : task.status === 'In Progress' && task.checklist_id ? (
                          <button
                            onClick={() => handleResumeTask(task)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                             <Zap size={12} fill="currentColor"/> Resume Check
                          </button>
                       ) : (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                             <CheckCircle size={12} /> Sign-off Ready
                          </button>
                       )}
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
