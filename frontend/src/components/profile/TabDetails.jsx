import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Phone, MapPin, Briefcase, CreditCard, ShieldAlert, DollarSign, ChevronDown, ChevronRight, Heart, Users } from 'lucide-react';
import { canViewSensitiveField } from '../../utils/permissionService';

export default function TabDetails({ employee, dbRoles = [], onProfileUpdated }) {
    // In a real app, this comes from an Auth Context.
    // Mocking for Phase 3/4 testing.
    const currentUser = { role_data: { authority_level: 10 } };

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [openSection, setOpenSection] = useState('primary');

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
        date_of_birth: employee?.date_of_birth || '',
        phone_number: employee?.phone_number || '',
        email: employee?.email || '',

        // Passport info
        passport_number: employee?.passport_number || '',
        passport_expiry_date: employee?.passport_expiry_date || '',

        // Address Details
        address_street_no: employee?.address_street_no || '',
        address_street_name: employee?.address_street_name || '',
        address_area: employee?.address_area || '',
        address_code: employee?.address_code || '',
        address_line_1: employee?.address_line_1 || '',
        address_line_2: employee?.address_line_2 || '',
        city: employee?.city || '',
        postal_code: employee?.postal_code || '',

        // Employment Dates
        start_date: employee?.start_date || '',
        end_date: employee?.end_date || '',
        reports_to_id: employee?.reports_to_id || '',
        manager_name: employee?.manager_name || '',
        probation_status: employee?.probation_status || 'Not Started',
        salary_wage: employee?.salary_wage || '',

        // Marital & Family
        marital_status: employee?.marital_status || '',
        spouse_name: employee?.spouse_name || '',
        spouse_nationality: employee?.spouse_nationality || '',
        spouse_passport_number: employee?.spouse_passport_number || '',
        dependants: employee?.dependants || [],

        // Emergency Contact 1
        emergency_contact_name: employee?.emergency_contact_name || '',
        emergency_contact_relationship: employee?.emergency_contact_relationship || '',
        emergency_contact_address: employee?.emergency_contact_address || '',
        emergency_contact_number: employee?.emergency_contact_number || '',
        emergency_contact_phone_work: employee?.emergency_contact_phone_work || '',
        emergency_contact_phone_home: employee?.emergency_contact_phone_home || '',

        // Emergency Contact 2
        emergency_contact_2_name: employee?.emergency_contact_2_name || '',
        emergency_contact_2_relationship: employee?.emergency_contact_2_relationship || '',
        emergency_contact_2_address: employee?.emergency_contact_2_address || '',
        emergency_contact_2_phone_work: employee?.emergency_contact_2_phone_work || '',
        emergency_contact_2_phone_home: employee?.emergency_contact_2_phone_home || '',

        // Medical
        medical_aid_number: employee?.medical_aid_number || '',
        medical_aid_policy_number: employee?.medical_aid_policy_number || '',
        blood_group: employee?.blood_group || '',
        doctor_name: employee?.doctor_name || '',
        doctor_phone: employee?.doctor_phone || '',
        medical_conditions: employee?.medical_conditions || '',

        // Banking
        sa_id_number: employee?.sa_id_number || '',
        tax_number: employee?.tax_number || '',
        bank_account_holder: employee?.bank_account_holder || '',
        bank_name: employee?.bank_name || '',
        account_number: employee?.account_number || '',
        account_type: employee?.account_type || '',
        branch_code: employee?.branch_code || ''
    });

    const isForeign = formData.nationality && formData.nationality.toLowerCase() !== 'south african';
    const [managerList, setManagerList] = useState([]);

    useEffect(() => {
        async function fetchManagers() {
            const { data } = await supabase
                .from('employees')
                .select('id, first_name, last_name, role_id, roles!inner(is_reporting_position)')
                .eq('roles.is_reporting_position', true);
            setManagerList(data || []);
        }
        fetchManagers();
    }, []);

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
                date_of_birth: employee.date_of_birth || '',
                phone_number: employee.phone_number || '',
                email: employee.email || '',

                passport_number: employee.passport_number || '',
                passport_expiry_date: employee.passport_expiry_date || '',

                address_street_no: employee.address_street_no || '',
                address_street_name: employee.address_street_name || '',
                address_area: employee.address_area || '',
                address_code: employee.address_code || '',
                address_line_1: employee.address_line_1 || '',
                address_line_2: employee.address_line_2 || '',
                city: employee.city || '',
                postal_code: employee.postal_code || '',

                start_date: employee.start_date || '',
                end_date: employee.end_date || '',
                reports_to_id: employee.reports_to_id || '',
                manager_name: employee.manager_name || '',
                probation_status: employee.probation_status || 'Not Started',
                salary_wage: employee.salary_wage || '',

                marital_status: employee.marital_status || '',
                spouse_name: employee.spouse_name || '',
                spouse_nationality: employee.spouse_nationality || '',
                spouse_passport_number: employee.spouse_passport_number || '',
                dependants: employee.dependants || [],

                emergency_contact_name: employee.emergency_contact_name || '',
                emergency_contact_relationship: employee.emergency_contact_relationship || '',
                emergency_contact_address: employee.emergency_contact_address || '',
                emergency_contact_number: employee.emergency_contact_number || '',
                emergency_contact_phone_work: employee.emergency_contact_phone_work || '',
                emergency_contact_phone_home: employee.emergency_contact_phone_home || '',

                emergency_contact_2_name: employee.emergency_contact_2_name || '',
                emergency_contact_2_relationship: employee.emergency_contact_2_relationship || '',
                emergency_contact_2_address: employee.emergency_contact_2_address || '',
                emergency_contact_2_phone_work: employee.emergency_contact_2_phone_work || '',
                emergency_contact_2_phone_home: employee.emergency_contact_2_phone_home || '',

                medical_aid_number: employee.medical_aid_number || '',
                medical_aid_policy_number: employee.medical_aid_policy_number || '',
                blood_group: employee.blood_group || '',
                doctor_name: employee.doctor_name || '',
                doctor_phone: employee.doctor_phone || '',
                medical_conditions: employee.medical_conditions || '',

                sa_id_number: employee.sa_id_number || '',
                tax_number: employee.tax_number || '',
                bank_account_holder: employee.bank_account_holder || '',
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

    const addDependant = () => {
        setFormData({
            ...formData,
            dependants: [...formData.dependants, { name: '', sex: '', age: '' }]
        });
    };

    const updateDependant = (index, field, value) => {
        const updated = [...formData.dependants];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, dependants: updated });
    };

    const removeDependant = (index) => {
        setFormData({
            ...formData,
            dependants: formData.dependants.filter((_, i) => i !== index)
        });
    };

    const CollapsibleSection = ({ title, id, icon: Icon, children }) => {
        const isOpen = openSection === id;
        return (
            <div
                className="border border-slate-200 rounded-xl overflow-hidden mb-3 shadow-sm bg-white transition-all"
                onFocusCapture={() => !isOpen && setOpenSection(id)}
            >
                <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : id)}
                    className={`w-full px-5 py-3 flex items-center justify-between transition-colors ${isOpen ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                    <div className="flex items-center gap-3">
                        {Icon && <Icon size={16} className={isOpen ? 'text-yellow-500' : 'text-slate-400'} />}
                        <span className="font-bold text-[10px] uppercase tracking-widest">{title}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isOpen && (
                    <div className="p-6 bg-white border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        {children}
                    </div>
                )}
            </div>
        );
    };

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
                    {options
                        ? (options.find(opt => opt.value === formData[name])?.label || formData[name] || <span className="text-slate-300 italic font-normal text-xs">Not set</span>)
                        : (formData[name] || <span className="text-slate-300 italic font-normal text-xs">Not set</span>)
                    }
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

            <div className="space-y-1">
                <CollapsibleSection title="Primary Employment" id="primary" icon={Briefcase}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="Employee #" name="employee_number" />
                        <Field label="Role" name="role" options={[
                            { value: '', label: 'Select Position...' },
                            ...dbRoles.map(r => ({ value: r.role_name, label: r.role_name }))
                        ]} />
                        <Field label="Reporting To" name="reports_to_id" options={[
                            { value: '', label: 'No Direct Manager' },
                            ...managerList.filter(m => m.id !== employee.id).map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))
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
                        <Field label="Employment Status" name="employment_status" options={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Probation', label: 'Probation' },
                            { value: 'Inactive', label: 'Inactive' },
                            { value: 'Terminated', label: 'Terminated' }
                        ]} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Personal & Address" id="personal" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="First Name" name="first_name" />
                        <Field label="Last Name" name="last_name" />
                        <Field label="Preferred Name" name="preferred_name" />
                        <Field label="Nationality" name="nationality" />
                        <Field label="Date of Birth" name="date_of_birth" type="date" />
                        <Field label="Marital Status" name="marital_status" />
                        <Field label="SA ID Number" name="sa_id_number" />
                        <Field label="Phone Number" name="phone_number" />
                        <Field label="Email Address" name="email" type="email" />
                    </div>

                    {isForeign && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                            <h5 className="text-[9px] font-bold text-yellow-700 uppercase mb-3 tracking-widest">Foreign Employee Identification</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Passport Number" name="passport_number" />
                                <Field label="Passport Expiry Date" name="passport_expiry_date" type="date" />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Field label="Street #" name="address_street_no" />
                        <Field label="Street Name" name="address_street_name" />
                        <Field label="Area / Suburb" name="address_area" />
                        <Field label="Postal Code" name="address_code" />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Spouse & Family" id="family" icon={Users}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="Spouse Full Name" name="spouse_name" />
                        <Field label="Spouse Nationality" name="spouse_nationality" />
                        <Field label="Spouse Passport #" name="spouse_passport_number" />
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dependants</h5>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={addDependant}
                                    className="text-[9px] font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    + Add Dependant
                                </button>
                            )}
                        </div>

                        {formData.dependants.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No dependants listed.</p>
                        ) : (
                            <div className="space-y-3">
                                {formData.dependants.map((dep, idx) => (
                                    <div key={idx} className="flex gap-4 items-end bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex-1">
                                            {isEditing ? (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase">Name</label>
                                                    <input
                                                        value={dep.name}
                                                        onChange={(e) => updateDependant(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-sm font-semibold text-slate-900">{dep.name}</div>
                                            )}
                                        </div>
                                        <div className="w-20">
                                            {isEditing ? (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase">Sex</label>
                                                    <select
                                                        value={dep.sex}
                                                        onChange={(e) => updateDependant(idx, 'sex', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                                                    >
                                                        <option value="">Sex</option>
                                                        <option value="M">M</option>
                                                        <option value="F">F</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-600 font-medium">Sex: {dep.sex}</div>
                                            )}
                                        </div>
                                        <div className="w-16">
                                            {isEditing ? (
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase">Age</label>
                                                    <input
                                                        value={dep.age}
                                                        onChange={(e) => updateDependant(idx, 'age', e.target.value)}
                                                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-600 font-medium">Age: {dep.age}</div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => removeDependant(idx)}
                                                className="mb-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Emergency Contacts" id="emergency" icon={ShieldAlert}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-full font-bold text-[9px] text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Primary Contact</div>
                        <Field label="Contact Name" name="emergency_contact_name" />
                        <Field label="Relationship" name="emergency_contact_relationship" />
                        <Field label="Cell Phone" name="emergency_contact_number" />
                        <Field label="Work Phone" name="emergency_contact_phone_work" />
                        <Field label="Home Phone" name="emergency_contact_phone_home" />
                        <div className="col-span-full mt-4 font-bold text-[9px] text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Alternative Contact</div>
                        <Field label="Alternative Name" name="emergency_contact_2_name" />
                        <Field label="Relationship" name="emergency_contact_2_relationship" />
                        <Field label="Work Phone" name="emergency_contact_2_phone_work" />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Medical Details" id="medical" icon={Heart}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field label="Medical Aid #" name="medical_aid_number" />
                        <Field label="Policy #" name="medical_aid_policy_number" />
                        <Field label="Blood Group" name="blood_group" />
                        <Field label="Doctor Name" name="doctor_name" />
                        <Field label="Doctor Phone" name="doctor_phone" />
                        <div className="col-span-full">
                            <Field label="Allergies & Medical Conditions" name="medical_conditions" />
                        </div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Salary & Banking" id="banking" icon={CreditCard}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {canViewSensitiveField(currentUser, 'salary_wage') && (
                            <div className="col-span-full bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                                    <DollarSign size={20} />
                                </div>
                                <div className="flex-1">
                                    <Field label="Salary / Monthly Wage" name="salary_wage" />
                                </div>
                            </div>
                        )}
                        <Field label="Account Holder" name="bank_account_holder" />
                        <Field label="Bank Name" name="bank_name" />
                        <Field label="Account Number" name="account_number" />
                        <Field label="Branch Code" name="branch_code" />
                        <Field label="Account Type" name="account_type" />
                        <Field label="Tax Number" name="tax_number" />
                    </div>
                </CollapsibleSection>
            </div>
        </form>
    );
}
