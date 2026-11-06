import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { CheckSquare, Calendar, User, Clock, CheckCircle, Search } from 'lucide-react';
import { getArchivedTasks } from '../../utils/taskService';

export default function TabCompleted() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getArchivedTasks();
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-emerald-400 shadow-lg">
               <CheckCircle size={16} />
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Archive</h4>
         </div>

         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
               type="text"
               placeholder="Search archive..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-slate-900 transition-all w-64 shadow-sm"
            />
         </div>
      </div>

      <SummaryCard title="Completed Tasks" icon={CheckSquare}>
        <div className="overflow-x-auto -mx-4 -mb-4 no-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="pl-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Operation / Task</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Completed Date</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Time</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Handled By</th>
                    <th className="pr-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Reference</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   <tr><td colSpan="5" className="py-20 text-center animate-pulse italic text-slate-400 text-xs">Loading archive...</td></tr>
                 ) : filteredTasks.length === 0 ? (
                   <tr><td colSpan="5" className="py-20 text-center italic text-slate-400 text-xs uppercase font-bold tracking-widest">No completed tasks found</td></tr>
                 ) : filteredTasks.map(task => (
                   <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="pl-6 py-5">
                         <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase leading-tight tracking-tight">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-bold text-slate-400 uppercase">{task.category}</span>
                               {task.checklists && (
                                 <>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">{task.checklists.name}</span>
                                 </>
                               )}
                            </div>
                         </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                         <span className="text-[10px] font-black text-slate-600 uppercase">
                            {task.completed_at ? new Date(task.completed_at).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
                         </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                         <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                            {task.completed_at ? new Date(task.completed_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '--'}
                         </span>
                      </td>
                      <td className="px-4 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-yellow-500 flex items-center justify-center font-black text-[10px] shadow-sm">
                               {task.employees ? `${task.employees.first_name[0]}${task.employees.last_name[0]}` : '??'}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{task.employees ? `${task.employees.first_name} ${task.employees.last_name}` : 'Unknown'}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{task.employees?.role || 'Staff Member'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="pr-6 py-5 text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">SUCCESSFUL</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Auto-Archived</span>
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
