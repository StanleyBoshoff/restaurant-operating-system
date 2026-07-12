import React from 'react';

export default function TabWarnings({ employee }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">Compliance & Warnings</h4>
            <p className="text-xs text-slate-500">
                Incident history logging tracking for {employee?.first_name || 'Employee'}.
            </p>
            <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-400">
                Clean record. No warnings found.
            </div>
        </div>
    );
}
