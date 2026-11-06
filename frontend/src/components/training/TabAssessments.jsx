import React from 'react';
import SummaryCard from '../common/SummaryCard';
import { ClipboardCheck } from 'lucide-react';

export default function TabAssessments() {
  return (
    <div className="space-y-6">
      <SummaryCard title="Performance Assessments" icon={ClipboardCheck}>
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-inner">
            <ClipboardCheck size={32} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">Practical Evaluations</h4>
          <p className="text-xs text-slate-400 max-w-xs italic text-center">
            This section will track physical performance reviews conducted by managers. Individual course quizzes are now found in the **Courses** tab.
          </p>
        </div>
      </SummaryCard>
    </div>
  );
}
