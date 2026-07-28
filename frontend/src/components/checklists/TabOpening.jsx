import React from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardList } from 'lucide-react';

export default function TabOpening() {
  return (
    <div className="space-y-6">
      <SummaryCard title="Opening Duty Checklists" icon={ClipboardList}>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-inner">
            <ClipboardList size={32} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Opening Checklists Under Construction</h4>
          <p className="text-xs text-slate-400 max-w-xs italic">
            We are currently building the Opening Duty management interface. Daily setup tracking will be available here soon.
          </p>
        </div>
      </SummaryCard>
    </div>
  );
}
