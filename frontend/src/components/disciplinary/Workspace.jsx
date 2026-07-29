import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Gavel, Search, User, Calendar, ExternalLink } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { DISCIPLINARY_TABS } from './tabs';
import { supabase } from '../../supabaseClient';

function TabOverview() {
  const [stats, setStats] = React.useState({ total: 0, thisMonth: 0, byLevel: {} });

  React.useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('employee_warnings').select('warning_level, incident_date');
      if (data) {
        const now = new Date();
        const thisMonth = data.filter(w => new Date(warning.incident_date).getMonth() === now.getMonth()).length;
        setStats({ total: data.length, thisMonth, byLevel: {} });
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Warnings">
           <span className="text-3xl font-black text-slate-900">{stats.total}</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Life-to-date registry</p>
        </SummaryCard>
        <SummaryCard title="Active This Month">
           <span className="text-3xl font-black text-yellow-600">{stats.thisMonth}</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Current period logs</p>
        </SummaryCard>
        <SummaryCard title="High Severity">
           <span className="text-3xl font-black text-rose-600">0</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dismissal cases pending</p>
        </SummaryCard>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white">
        <h4 className="text-xl font-bold mb-2">Legal Compliance Overview</h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          The Disciplinary Module provides a centralized audit trail for all staff infractions. Every draft generated here is derived from the official Annexure B Disciplinary Code to protect the store from procedural unfairness claims at the CCMA.
        </p>
      </div>
    </div>
  );
}

function TabRecords() {
  const [records, setRecords] = React.useState([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    async function fetchAll() {
      const { data } = await supabase
        .from('employee_warnings')
        .select(`*, employees(first_name, last_name, role)`)
        .order('incident_date', { ascending: false });
      setRecords(data || []);
    }
    fetchAll();
  }, []);

  const filtered = records.filter(r =>
    `${r.employees?.first_name} ${r.employees?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    r.warning_level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Search by staff name or warning level..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm outline-none" />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warning Level</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued By</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-xs">{r.employees?.first_name} {r.employees?.last_name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-medium">{r.employees?.role}</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600 font-medium">{new Date(r.incident_date).toLocaleDateString()}</td>
                <td className="px-6 py-4"><span className="text-[10px] font-black text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 uppercase">{r.warning_level}</span></td>
                <td className="px-6 py-4 text-xs text-slate-500 font-bold">{r.issued_by}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-slate-900 transition-colors"><ExternalLink size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Workspace() {
  return (
    <div className="animate-in fade-in duration-500">
      <ModuleWorkspaceHeader
        title="Disciplinary Management"
        description="Central registry for infractions, warnings and legal compliance."
        icon={Gavel}
      />

      <ModuleTabNavigation
        tabs={DISCIPLINARY_TABS}
        baseUrl="/disciplinary"
      />

      <div className="min-h-[400px]">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="records" element={<TabRecords />} />
        </Routes>
      </div>
    </div>
  );
}
