import React from 'react';
import SummaryCard from '../common/SummaryCard';
import { Briefcase } from 'lucide-react';

export default function TabDepartments() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Departments</h3>
        <p className="text-slate-500 text-xs">Organize your workforce into functional departments.</p>
      </div>

      <SummaryCard title="Departments" icon={Briefcase}>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-inner">
            <Briefcase size={32} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Module Under Construction</h4>
          <p className="text-xs text-slate-400 max-w-xs italic">
            We are currently building the Department Management system. Organizational hierarchy features will be available here soon.
          </p>
        </div>
      </SummaryCard>
    </div>
  );
}
