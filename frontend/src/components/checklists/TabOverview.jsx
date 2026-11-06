import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList, Play, Sun, Moon, ChefHat, GlassWater, Brush, Plus, CheckCircle2, Clock, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { getAllChecklists, getRecentSubmissions } from '../../utils/checklistService';

export default function TabOverview() {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [cls, subs] = await Promise.all([
        getAllChecklists(),
        getRecentSubmissions(8)
      ]);
      setChecklists(cls || []);
      setSubmissions(subs || []);
    } catch (err) {
      console.error("Failed to load checksheets overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'opening': return Sun;
      case 'closing': return Moon;
      case 'kitchen': return ChefHat;
      case 'bar': return GlassWater;
      case 'cleaning': return Brush;
      default: return ClipboardList;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'opening': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'closing': return 'bg-indigo-500/10 text-indigo-600 border-indigo-200';
      case 'kitchen': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      case 'bar': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'cleaning': return 'bg-cyan-500/10 text-cyan-600 border-cyan-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center italic text-slate-400 animate-pulse">
        Syncing store operational checksheets...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* 🚀 QUICK LAUNCH BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/checklists/opening')}
          className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-left flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Sun size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Morning Duty</span>
            </div>
            <h3 className="text-lg font-black tracking-tight">Opening Duty</h3>
            <p className="text-[10px] opacity-80 font-medium mt-1">Start daily store & safety checks</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Play size={18} className="fill-white ml-0.5" />
          </div>
        </button>

        <button
          onClick={() => navigate('/checklists/closing')}
          className="p-5 bg-gradient-to-br from-indigo-600 to-slate-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-left flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <Moon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Evening Lockdown</span>
            </div>
            <h3 className="text-lg font-black tracking-tight">Closing Routine</h3>
            <p className="text-[10px] opacity-80 font-medium mt-1">Final cash drop & gas lockup</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Play size={18} className="fill-white ml-0.5" />
          </div>
        </button>

        <button
          onClick={() => navigate('/checklists/kitchen')}
          className="p-5 bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-left flex items-center justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
              <ChefHat size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Culinary Ops</span>
            </div>
            <h3 className="text-lg font-black tracking-tight">Kitchen Checksheet</h3>
            <p className="text-[10px] opacity-80 font-medium mt-1">Temp logs & food safety audit</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Play size={18} className="fill-white ml-0.5" />
          </div>
        </button>

        <button
          onClick={() => navigate('/checklists/custom')}
          className="p-5 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 text-left flex items-center justify-between group border border-slate-800 cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 text-yellow-500">
              <Plus size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Checksheet Designer</span>
            </div>
            <h3 className="text-lg font-black tracking-tight">Build Checksheet</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Create custom department checksheets</p>
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-yellow-500">
            <ChevronRight size={18} />
          </div>
        </button>
      </div>

      {/* 📋 MASTER CHECKSHEET LIBRARY */}
      <SummaryCard
        title="Store Checksheets"
        icon={ClipboardList}
        badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{checklists.length} ACTIVE CHECKSHEETS</span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {checklists.map(list => {
            const Icon = getCategoryIcon(list.category);
            const badgeClass = getCategoryColor(list.category);
            return (
              <div
                key={list.id}
                className="bg-white border-2 border-slate-100 rounded-2xl p-5 hover:border-yellow-500/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase flex items-center gap-1.5 ${badgeClass}`}>
                      <Icon size={12} />
                      {list.category || 'General'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                      {list.itemCount} Tasks
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 tracking-tight mb-1">{list.name}</h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                    {list.description || 'Standard store compliance checksheet.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (list.name === 'Opening Duty') navigate('/checklists/opening');
                      else if (list.name === 'Closing Routine') navigate('/checklists/closing');
                      else navigate(`/checklists/run/${list.id}`);
                    }}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Play size={12} className="fill-white" />
                    Launch {list.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SummaryCard>

      {/* 📜 RECENT COMPLIANCE AUDIT LOG */}
      <SummaryCard title="Recent Execution Sign-Offs" icon={ShieldCheck}>
        {submissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No completed checksheet sign-offs logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3.5">Checksheet Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Signed Off By</th>
                  <th className="px-6 py-3.5 text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="font-black text-slate-900">{sub.checklists?.name || 'Store Checksheet'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sub.checklists?.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 text-slate-600">
                      <User size={14} className="text-slate-400" />
                      {sub.submitted_by_name || 'Staff Member'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-[11px] font-medium">
                      {new Date(sub.completed_at).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SummaryCard>
    </div>
  );
}
