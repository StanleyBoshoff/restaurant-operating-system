import React from 'react';

export default function TabEmployeeDashboard({ employee, onRefresh }) {
    
    // 🔍 Air-Tight Evaluator Engine Block: Reads directly from employee prop contexts
    const missingOnboardingFields = [];

    // Ensure the employee object context exists before evaluating data properties
    if (employee) {
        if (!employee.employee_number) missingOnboardingFields.push({ key: 'employee_number', label: 'Employee number' });
        if (!employee.department) missingOnboardingFields.push({ key: 'department', label: 'Department' });
        if (!employee.employment_type) missingOnboardingFields.push({ key: 'employment_type', label: 'Employment type' });
        if (!employee.nationality) missingOnboardingFields.push({ key: 'nationality', label: 'Nationality' });
        if (!employee.phone_number) missingOnboardingFields.push({ key: 'phone_number', label: 'Phone number' });
        if (!employee.email) missingOnboardingFields.push({ key: 'email', label: 'Email address' });
        if (!employee.start_date) missingOnboardingFields.push({ key: 'start_date', label: 'Start date' });
        if (!employee.manager_name) missingOnboardingFields.push({ key: 'manager_name', label: 'Manager' });
    }

    return (
        <div className="space-y-6">
            
            {/* ⚠️ Dynamic Compliance Check Card Component */}
            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl shadow-3xs text-xs">
                <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Onboarding compliance checklist</h5>
                    <span className="text-[11px] font-medium text-amber-700">{missingOnboardingFields.length} missing</span>
                </div>
                {missingOnboardingFields.length === 0 ? (
                    <p className="mt-2 text-slate-700">All required onboarding details have been captured.</p>
                ) : (
                    <ul className="mt-2 space-y-1 text-slate-700">
                        {missingOnboardingFields.map((field) => (
                            <li key={field.key} className="flex items-center gap-2">
                                <span className="text-amber-600">•</span>
                                <span>{field.label}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 📊 Rest of your Employee Dashboard interface elements continue smoothly below... */}
            <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-400 italic">
                Employee metrics tracking and shift performance overview analytics coming soon.
            </div>

        </div>
    );
}
