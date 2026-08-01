import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Gavel, Search, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import SummaryCard from '../common/SummaryCard';
import { DISCIPLINARY_TABS } from './tabs';
import { supabase } from '../../supabaseClient';

function TabOverview() {
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, highSeverity: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('employee_warnings').select('warning_level, incident_date');
      if (data) {
        const now = new Date();
        const thisMonth = data.filter(w => new Date(w.incident_date).getMonth() === now.getMonth()).length;
        const highSeverity = data.filter(w => w.warning_level.includes('Final') || w.warning_level.includes('Dismissal')).length;
        setStats({ total: data.length, thisMonth, highSeverity });
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Warnings Registry">
           <span className="text-3xl font-black text-slate-900">{stats.total}</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Life-to-date logs</p>
        </SummaryCard>
        <SummaryCard title="Active This Month">
           <span className="text-3xl font-black text-yellow-600">{stats.thisMonth}</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Current period</p>
        </SummaryCard>
        <SummaryCard title="High Severity Cases">
           <span className="text-3xl font-black text-rose-600">{stats.highSeverity}</span>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">FWW / Dismissal alerts</p>
        </SummaryCard>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-3 uppercase tracking-tight text-yellow-500">Legal Compliance Command</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
            This module centralizes all disciplinary documentation. By ensuring every warning follows the official Annexure B code and capturing a "blueprint" of every incident, we provide the restaurant with a bulletproof defense against procedural unfairness.
          </p>
        </div>
        <Gavel size={120} className="absolute -right-8 -bottom-8 text-white/5" />
      </div>
    </div>
  );
}

function TabRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAll() {
      const { data } = await supabase
        .from('employee_warnings')
        .select(`*, employees(first_name, last_name, role, department)`)
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
        <input
          type="text"
          placeholder="Search store-wide warnings by employee name or level..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm outline-none focus:border-yellow-600 transition-all"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sanction Level</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Issuer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-xs">{r.employees?.first_name} {r.employees?.last_name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">{r.employees?.department}</p>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600 font-bold">{new Date(r.incident_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                    r.warning_level.includes('Final') ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-yellow-700 bg-yellow-50 border-yellow-100'
                  }`}>
                    {r.warning_level}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-black">{r.issued_by}</td>
                <td className="px-6 py-4 text-right">
                  {r.file_url ? (
                    <div className="flex justify-end gap-2 text-emerald-600 font-bold text-[9px] uppercase">
                      <FileText size={14} /> Signed Copy
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 text-amber-500 font-bold text-[9px] uppercase">
                      <AlertCircle size={14} /> Pending Upload
                    </div>
                  )}
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
