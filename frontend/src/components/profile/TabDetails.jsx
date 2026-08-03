import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Phone, MapPin, Briefcase, CreditCard, ShieldAlert, DollarSign } from 'lucide-react';
import { canViewSensitiveField } from '../../utils/permissionService';

export default function TabDetails({ employee, dbRoles = [], onProfileUpdated }) {
    // In a real app, this comes from an Auth Context.
    // Mocking for Phase 3/4 testing.
    const currentUser = { role_data: { authority_level: 1 } };

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        preferred_name: employee?.preferred_name || '',
        role: employee?.role || '',
        branch: employee?.branch || '',
        employee_number: employee?.employee_number || '',
        department: employee?.department || '',
        employment_type: employee?.employment_type || '',
        employment_status: employee?.employment_status || 'Active',
        nationality: employee?.nationality || '',
        phone_number: employee?.phone_number || '',
        email: employee?.email || '',
        address_line_1: employee?.address_line_1 || '',
        address_line_2: employee?.address_line_2 || '',
        city: employee?.city || '',
        postal_code: employee?.postal_code || '',
        start_date: employee?.start_date || '',
        end_date: employee?.end_date || '',
        manager_name: employee?.manager_name || '',
        probation_status: employee?.probation_status || 'Not Started',
        salary_wage: employee?.salary_wage || '',
        emergency_contact_name: employee?.emergency_contact_name || '',
        emergency_contact_number: employee?.emergency_contact_number || '',
        sa_id_number: employee?.sa_id_number || '',
        tax_number: employee?.tax_number || '',
        bank_name: employee?.bank_name || '',
        account_number: employee?.account_number || '',
        account_type: employee?.account_type || '',
        branch_code: employee?.branch_code || ''
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                preferred_name: employee.preferred_name || '',
                role: employee.role || '',
                branch: employee.branch || '',
                employee_number: employee.employee_number || '',
                department: employee.department || '',
                employment_type: employee.employment_type || '',
                employment_status: employee.employment_status || 'Active',
                nationality: employee.nationality || '',
                phone_number: employee.phone_number || '',
                email: employee.email || '',
                address_line_1: employee.address_line_1 || '',
                address_line_2: employee.address_line_2 || '',
                city: employee.city || '',
                postal_code: employee.postal_code || '',
                start_date: employee.start_date || '',
                end_date: employee.end_date || '',
                manager_name: employee.manager_name || '',
                probation_status: employee.probation_status || 'Not Started',
                salary_wage: employee.salary_wage || '',
                emergency_contact_name: employee.emergency_contact_name || '',
                emergency_contact_number: employee.emergency_contact_number || '',
                sa_id_number: employee.sa_id_number || '',
                tax_number: employee.tax_number || '',
                bank_name: employee.bank_name || '',
                account_number: employee.account_number || '',
                account_type: employee.account_type || '',
                branch_code: employee.branch_code || ''
            });
        }
    }, [employee?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('employees')
                .update(formData)
                .eq('id', employee.id);

            if (error) throw error;
            onProfileUpdated?.({ ...employee, ...formData });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update employee details:', error.message);
            alert('Error updating profile settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4 mt-6 first:mt-0">
            <Icon size={14} className="text-slate-400" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        </div>
    );

    const Field = ({ label, name, type = 'text', options = null }) => (
        <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</label>
            {isEditing ? (
                options ? (
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                    >
                        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
                    />
                )
            ) : (
                <div className="text-sm font-semibold text-slate-900 min-h-[1.25rem]">
                    {formData[name] || <span className="text-slate-300 italic font-normal text-xs">Not set</span>}
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSaveChanges} className="space-y-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Edit Employee Profile</h3>
                    <p className="text-[10px] text-slate-500 italic">Manage sensitive personnel and employment data.</p>
                </div>
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                    >
                        Modify Details
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold transition-colors"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6">
                <SectionHeader icon={User} title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="First Name" name="first_name" />
                    <Field label="Last Name" name="last_name" />
                    <Field label="Preferred Name" name="preferred_name" />
                    <Field label="SA ID / Passport" name="sa_id_number" />
                    <Field label="Nationality" name="nationality" />
                    <Field label="Tax Number" name="tax_number" />
                    {canViewSensitiveField(currentUser, 'salary_wage') && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <DollarSign size={16} />
                            </div>
                            <div className="flex-1">
                                <Field label="Salary / Monthly Wage" name="salary_wage" />
                            </div>
                        </div>
                    )}
                </div>

                <SectionHeader icon={Phone} title="Contact & Address" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Phone Number" name="phone_number" />
                    <Field label="Email Address" name="email" type="email" />
                    <Field label="Address Line 1" name="address_line_1" />
                    <Field label="Address Line 2" name="address_line_2" />
                    <Field label="City" name="city" />
                    <Field label="Postal Code" name="postal_code" />
                </div>

                <SectionHeader icon={Briefcase} title="Employment Status" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Employee #" name="employee_number" />
                    <Field label="Role" name="role" options={[
                        { value: '', label: 'Select Position...' },
                        ...dbRoles.map(r => ({ value: r.role_name, label: r.role_name }))
                    ]} />
                    <Field label="Department" name="department" />
                    <Field label="Branch" name="branch" />
                    <Field label="Start Date" name="start_date" type="date" />
                    <Field label="Employment Type" name="employment_type" options={[
                        { value: '', label: 'Select...' },
                        { value: 'Full Time', label: 'Full Time' },
                        { value: 'Part Time', label: 'Part Time' },
                        { value: 'Casual', label: 'Casual' },
                        { value: 'Contract', label: 'Contract' }
                    ]} />
                </div>

                <SectionHeader icon={CreditCard} title="Banking Details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Bank Name" name="bank_name" />
                    <Field label="Account Number" name="account_number" />
                    <Field label="Account Type" name="account_type" />
                    <Field label="Branch Code" name="branch_code" />
                </div>

                <SectionHeader icon={ShieldAlert} title="Emergency Contact" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Contact Name" name="emergency_contact_name" />
                    <Field label="Contact Number" name="emergency_contact_number" />
                </div>
            </div>
        </form>
    );
}
