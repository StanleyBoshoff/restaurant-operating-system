import React from 'react';

export default function TabDocuments({ employee }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">Stored Documents</h4>
            <p className="text-xs text-slate-500">
                Document vault management for {employee?.first_name || 'Employee'}.
            </p>
            <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-400">
                No files uploaded yet.
            </div>
        </div>
    );
}
