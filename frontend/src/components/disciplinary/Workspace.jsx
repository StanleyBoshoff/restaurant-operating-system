import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Gavel, Search, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import SummaryCard from '../common/SummaryCard';
import { DISCIPLINARY_TABS } from './tabs';
import { supabase } from '../../supabaseClient';
import TabEngine from './TabEngine';
import TabRecords from './TabRecords';

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
          <Route path="engine" element={<TabEngine />} />
          <Route path="records" element={<TabRecords />} />
        </Routes>
      </div>
    </div>
  );
}
