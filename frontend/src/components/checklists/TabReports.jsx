import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { BarChart3, CheckCircle2, User, Calendar, FileText, X, Check, Search, ShieldCheck } from 'lucide-react';
import { getRecentSubmissions } from '../../utils/checklistService';

export default function TabReports() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getRecentSubmissions(50);
      setSubmissions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter(s =>
    (s.checklists?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.submitted_by_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Header Search & Stat */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search checksheet name or staff member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-yellow-500/50 shadow-3xs"
          />
        </div>

        <div className="px-5 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-md">
          <ShieldCheck size={18} className="text-yellow-500" />
          <span className="text-xs font-black uppercase tracking-widest">{submissions.length} Archived Submissions</span>
        </div>
      </div>

      <SummaryCard title="Auditable Execution Register" icon={BarChart3}>
        {loading ? (
          <div className="py-16 text-center italic text-slate-400 animate-pulse">Loading compliance history...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
            No audit submissions found matching search.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Checksheet</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Signed Off By</th>
                  <th className="px-6 py-4 text-center">Completed At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="font-black text-slate-900">{sub.checklists?.name || 'Checksheet'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sub.checklists?.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {sub.submitted_by_name || 'Staff Member'}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400 text-[11px] font-medium">
                      {new Date(sub.completed_at).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-600 transition-colors cursor-pointer shadow-xs"
                      >
                        Inspect Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SummaryCard>

      {/* Inspect Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspection Report</p>
                <h3 className="text-lg font-black text-slate-900">{selectedSub.checklists?.name}</h3>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-medium">Signed Off By:</span>
                <span className="font-black text-slate-900">{selectedSub.submitted_by_name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-500 font-medium">Completed At:</span>
                <span className="font-black text-slate-900">{new Date(selectedSub.completed_at).toLocaleString('en-ZA')}</span>
              </div>

              {selectedSub.submission_data && (
                <div className="pt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Task Responses</p>
                  {Object.entries(selectedSub.submission_data).map(([key, val]) => (
                    <div key={key} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between gap-2 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 truncate">{key}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${val?.status === 'tick' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {val?.status === 'tick' ? 'VERIFIED' : 'ISSUE FLAGGED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSub(null)}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
