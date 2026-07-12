import React, { useState } from "react";
import TabDetails from "./profile/TabDetails";
import TabDocuments from "./profile/TabDocuments";
import TabWarnings from "./profile/TabWarnings";

export default function EmployeeProfile({ employee, onClose, dbRoles}) {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'documents', label: 'Documents' },
        { id: 'warnings', label: 'Disciplinary Details' }
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">

            {/* Header section with closing trigger */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">
                        Profile: {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-xs text-slate-500">{employee.role} - {employee.branch}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                    Return to Directory
                </button>
            </div>

            {/* Sub-tab navigation menu layout */}
            <div className="flex space-x-2 border-b border-slate-100 pb-px">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-xs font-medium px-4 py-2 border-b-2 transition-all -mb-px ${
                            activeTab === tab.id
                            ? 'border-slate-900 text-slate-900 font-semibold'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Conditional workspace sub-panel insertion point */}
            <div className="pt-2">
                {activeTab === 'details' && <TabDetails employee={employee} dbRoles={dbRoles}/>}
                {activeTab === 'documents' && <TabDocuments employee={employee} />}
                {activeTab === 'warnings' && <TabWarnings employee={employee} />}
            </div>
        </div>
    ); 
}