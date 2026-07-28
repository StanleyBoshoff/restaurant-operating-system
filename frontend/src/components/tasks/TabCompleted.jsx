import React from 'react';
import SummaryCard from '../common/SummaryCard';
import { CheckSquare } from 'lucide-react';

export default function TabCompleted() {
  return (
    <div className="space-y-6">
      <SummaryCard title="Completed Tasks" icon={CheckSquare}>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-inner">
            <CheckSquare size={32} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Task History Under Construction</h4>
          <p className="text-xs text-slate-400 max-w-xs italic">
            We are currently building the Task History archive. Completed task logs will be available here soon.
          </p>
        </div>
      </SummaryCard>
    </div>
  );
}
