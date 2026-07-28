import React from 'react';

export default function StatusBadge({ status, type = 'default' }) {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'compliant':
      case 'approved':
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'due soon':
      case 'pending':
      case 'probation':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'expired':
      case 'missing':
      case 'overdue':
      case 'high':
      case 'critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'inactive':
      case 'not applicable':
      case 'not configured':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getColors()}`}>
      {status || 'Unknown'}
    </span>
  );
}
