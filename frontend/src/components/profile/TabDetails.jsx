import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function TabDetails({ employee, dbRoles = [], onProfileUpdated }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        role: employee?.role || '',
        branch: employee?.branch || '',
        employee_number: employee?.employee_number || '',
        department: employee?.department || '',
        employment_type: employee?.employment_type || '',
        employment_status: employee?.employment_status || 'Active',
        nationality: employee?.nationality || '',
        phone_number: employee?.phone_number || '',
        email: employee?.email || '',
        start_date: employee?.start_date || '',
        end_date: employee?.end_date || '',
        manager_name: employee?.manager_name || '',
        probation_status: employee?.probation_status || 'Not Started',
        salary_wage: employee?.salary_wage || '',
        emergency_contact_name: employee?.emergency_contact_name || '',
        emergency_contact_number: employee?.emergency_contact_number || '',
        sa_id_number: employee?.sa_id_number || ''
    });

    useEffect(() => {
        setFormData({
            first_name: employee?.first_name || '',
            last_name: employee?.last_name || '',
            role: employee?.role || '',
            branch: employee?.branch || '',
            employee_number: employee?.employee_number || '',
            department: employee?.department || '',
            employment_type: employee?.employment_type || '',
            employment_status: employee?.employment_status || 'Active',
            nationality: employee?.nationality || '',
            phone_number: employee?.phone_number || '',
            email: employee?.email || '',
            start_date: employee?.start_date || '',
            end_date: employee?.end_date || '',
            manager_name: employee?.manager_name || '',
            probation_status: employee?.probation_status || 'Not Started',
            salary_wage: employee?.salary_wage || '',
            emergency_contact_name: employee?.emergency_contact_name || '',
            emergency_contact_number: employee?.emergency_contact_number || '',
            sa_id_number: employee?.sa_id_number || ''
        });
    }, [employee?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('employees')
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    branch: formData.branch,
                    employee_number: formData.employee_number,
                    department: formData.department,
                    employment_type: formData.employment_type,
                    employment_status: formData.employment_status,
                    nationality: formData.nationality,
                    phone_number: formData.phone_number,
                    email: formData.email,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    manager_name: formData.manager_name,
                    probation_status: formData.probation_status,
                    salary_wage: formData.salary_wage,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_number: formData.emergency_contact_number,
                    sa_id_number: formData.sa_id_number
                })
                .eq('id', employee.id);

            if (error) throw error;
            onProfileUpdated?.({ ...employee, ...formData, id: employee.id });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update employee details:', error.message);
            alert('Error updating profile settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const requiredOnboardingFields = [
        { key: 'employee_number', label: 'Employee number' },
        { key: 'department', label: 'Department' },
        { key: 'employment_type', label: 'Employment type' },
        { key: 'employment_status', label: 'Employment status' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'phone_number', label: 'Phone number' },
        { key: 'email', label: 'Email address' },
        { key: 'start_date', label: 'Start date' },
        { key: 'manager_name', label: 'Manager' },
        { key: 'probation_status', label: 'Probation status' },
        { key: 'sa_id_number', label: 'ID or passport number' }
    ];

    const missingOnboardingFields = requiredOnboardingFields.filter((field) => {
        const value = formData[field.key];
        return value === null || value === undefined || String(value).trim() === '';
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-900">Employment Details</h4>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                    >
                        Edit Details
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => {
                                setFormData({
                                    first_name: employee?.first_name || '',
                                    last_name: employee?.last_name || '',
                                    role: employee?.role || '',
                                    branch: employee?.branch || '',
                                    employee_number: employee?.employee_number || '',
                                    department: employee?.department || '',
                                    employment_type: employee?.employment_type || '',
                                    employment_status: employee?.employment_status || 'Active',
                                    nationality: employee?.nationality || '',
                                    phone_number: employee?.phone_number || '',
                                    email: employee?.email || '',
                                    start_date: employee?.start_date || '',
                                    end_date: employee?.end_date || '',
                                    manager_name: employee?.manager_name || '',
                                    probation_status: employee?.probation_status || 'Not Started',
                                    salary_wage: employee?.salary_wage || '',
                                    emergency_contact_name: employee?.emergency_contact_name || '',
                                    emergency_contact_number: employee?.emergency_contact_number || '',
                                    sa_id_number: employee?.sa_id_number || ''
                                });
                                setIsEditing(false);
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Onboarding compliance checklist</h5>
                    <span className="text-[11px] font-medium text-amber-700">{missingOnboardingFields.length} missing</span>
                </div>
                {missingOnboardingFields.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-700">All required onboarding details have been captured.</p>
                ) : (
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {missingOnboardingFields.map((field) => (
                            <li key={field.key} className="flex items-center gap-2">
                                <span className="text-amber-600">•</span>
                                <span>{field.label}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <form onSubmit={handleSaveChanges} className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <label className="text-xs text-slate-400 block mb-1">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Role Assignment</label>
                    {isEditing ? (
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={isSaving}
                            className="w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm bg-white border-slate-200 focus:outline-none focus:border-slate-400"
                        >
                            <option value="">Select Position...</option>
                            {dbRoles.map((roleOpt) => (
                                <option key={roleOpt.id} value={roleOpt.role_name}>
                                    {roleOpt.role_name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={formData.role}
                            disabled
                            className="w-full px-3 py-1.5 text-slate-800 font-medium bg-transparent border-transparent text-sm"
                        />
                    )}
                </div>

                <div>
                    <label className="text-xs text-slate-400 block mb-1">Branch Location</label>
                    <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Employee Number</label>
                        <input
                            type="text"
                            name="employee_number"
                            value={formData.employee_number}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Department</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Employment Type</label>
                        <select
                            name="employment_type"
                            value={formData.employment_type}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        >
                            <option value="">Select type...</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Casual">Casual</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Employment Status</label>
                        <select
                            name="employment_status"
                            value={formData.employment_status}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        >
                            <option value="Active">Active</option>
                            <option value="Probation">Probation</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Terminated">Terminated</option>
                        </select>
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Nationality</label>
                        <input
                            type="text"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Manager</label>
                        <input
                            type="text"
                            name="manager_name"
                            value={formData.manager_name}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Probation Status</label>
                        <select
                            name="probation_status"
                            value={formData.probation_status}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Probation">In Probation</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Salary / Wage</label>
                        <input
                            type="text"
                            name="salary_wage"
                            value={formData.salary_wage}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Emergency Contact</label>
                        <input
                            type="text"
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={handleInputChange}
                            disabled={!isEditing || isSaving}
                            className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                                isEditing 
                                    ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                    : 'bg-transparent border-transparent'
                            }`}
                        />
                    </div>
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Emergency Contact Number</label>
                    <input
                        type="text"
                        name="emergency_contact_number"
                        value={formData.emergency_contact_number}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                </div>

                <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">ID / Passport Number</label>
                    <input
                        type="text"
                        name="sa_id_number"
                        value={formData.sa_id_number}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className={`w-full px-3 py-1.5 text-slate-800 font-mono font-medium rounded-md border text-sm transition-all ${
                            isEditing 
                                ? 'bg-white border-slate-200 focus:outline-none focus:border-slate-400' 
                                : 'bg-transparent border-transparent'
                        }`}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                        A 13-digit number is treated as a South African ID. Any other value is treated as a passport/foreign identity reference.
                    </p>
                </div>
            </form>
        </div>
    );
}
