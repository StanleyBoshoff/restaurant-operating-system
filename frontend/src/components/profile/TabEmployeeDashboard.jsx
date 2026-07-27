import React from 'react';

export default function TabEmployeeDashboard({ employee, onClose }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
                Dashboard for {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-slate-600">This is the employee-specific dashboard view.</p>
            <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
                Close Dashboard
            </button>
        </div>
    );
}
