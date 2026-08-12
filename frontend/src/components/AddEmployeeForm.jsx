import React, { useState, useEffect } from 'react';
import { X, Save, ChevronDown, ChevronRight, User, MapPin, ShieldAlert, Heart, CreditCard, Users } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AddEmployeeForm({ onClose, onRefresh, dbRoles, editingEmployee }) {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        preferred_name: '',
        role_id: '', // UUID from roles table
        reports_to_id: '', // UUID from employees table
        branch: '',
        employee_number: '',
        department: '',
        employment_type: '',
        employment_status: 'Active',
        nationality: 'South African',
        date_of_birth: '',
        phone_number: '',
        email: '',
        start_date: '',
        end_date: '',
        manager_name: '', // Kept for legacy display
        probation_status: 'Not Started',
        salary_wage: '',

        // Passport info (Conditional)
        passport_number: '',
        passport_expiry_date: '',

        // Marital & Family
        marital_status: '',
        spouse_name: '',
        spouse_nationality: '',
        spouse_passport_number: '',
        dependants: [],

        // Address
        address_street_no: '',
        address_street_name: '',
        address_area: '',
        address_code: '',

        // Emergency Contact 1
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_address: '',
        emergency_contact_number: '', // Cell
        emergency_contact_phone_work: '',
        emergency_contact_phone_home: '',

        // Emergency Contact 2
        emergency_contact_2_name: '',
        emergency_contact_2_relationship: '',
        emergency_contact_2_address: '',
        emergency_contact_2_phone_work: '',
        emergency_contact_2_phone_home: '',

        // Medical
        medical_aid_number: '',
        medical_aid_policy_number: '',
        blood_group: '',
        doctor_name: '',
        doctor_phone: '',
        medical_conditions: '',

        // Banking
        bank_account_holder: '',
        bank_name: '',
        bank_account_number: '',
        bank_branch_code: '',
        bank_account_type: '',
        tax_number: '',

        sa_id_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]); // For reports_to selection
    const [openSection, setOpenSection] = useState('primary');

    const isForeign = formData.nationality && formData.nationality.toLowerCase() !== 'south african';

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

    // Helper Component for Form Sections
    const CollapsibleSection = ({ title, id, icon: Icon, children }) => {
        const isOpen = openSection === id;
        return (
            <div
                className="border border-slate-200 rounded-xl overflow-hidden mb-3 shadow-sm transition-all duration-200"
                onFocusCapture={() => !isOpen && setOpenSection(id)}
            >
                <button
                    type="button"
                    onClick={() => setOpenSection(isOpen ? null : id)}
                    className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${isOpen ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={`w-4 h-4 ${isOpen ? 'text-yellow-500' : 'text-slate-400'}`} />}
                        <span className="font-bold text-[10px] uppercase tracking-widest">{title}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                    <div className="p-4 space-y-4 bg-white animate-in slide-in-from-top-2 duration-200">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // --- PRE-FILL IN EDIT MODE ---
    useEffect(() => {
        const fetchStaff = async () => {
            const { data } = await supabase
                .from('employees')
                .select('id, first_name, last_name, role_id, roles!inner(is_reporting_position)')
                .eq('roles.is_reporting_position', true);
            setEmployees(data || []);
        };
        fetchStaff();

        if (editingEmployee) {
            setFormData({
                first_name: editingEmployee.first_name || '',
                last_name: editingEmployee.last_name ||'',
                preferred_name: editingEmployee.preferred_name || '',
                role_id: editingEmployee.role_id || '',
                reports_to_id: editingEmployee.reports_to_id || '',
                branch: editingEmployee.branch || '',
                employee_number: editingEmployee.employee_number || '',
                department: editingEmployee.department || '',
                employment_type: editingEmployee.employment_type || '',
                employment_status: editingEmployee.employment_status || 'Active',
                nationality: editingEmployee.nationality || '',
                date_of_birth: editingEmployee.date_of_birth || '',
                phone_number: editingEmployee.phone_number || '',
                email: editingEmployee.email || '',
                start_date: editingEmployee.start_date || '',
                end_date: editingEmployee.end_date || '',
                manager_name: editingEmployee.manager_name || '',
                probation_status: editingEmployee.probation_status || 'Not Started',
                salary_wage: editingEmployee.salary_wage || '',

                passport_number: editingEmployee.passport_number || '',
                passport_expiry_date: editingEmployee.passport_expiry_date || '',

                marital_status: editingEmployee.marital_status || '',
                spouse_name: editingEmployee.spouse_name || '',
                spouse_nationality: editingEmployee.spouse_nationality || '',
                spouse_passport_number: editingEmployee.spouse_passport_number || '',
                dependants: editingEmployee.dependants || [],

                address_street_no: editingEmployee.address_street_no || '',
                address_street_name: editingEmployee.address_street_name || '',
                address_area: editingEmployee.address_area || '',
                address_code: editingEmployee.address_code || '',

                emergency_contact_name: editingEmployee.emergency_contact_name || '',
                emergency_contact_relationship: editingEmployee.emergency_contact_relationship || '',
                emergency_contact_address: editingEmployee.emergency_contact_address || '',
                emergency_contact_number: editingEmployee.emergency_contact_number || '',
                emergency_contact_phone_work: editingEmployee.emergency_contact_phone_work || '',
                emergency_contact_phone_home: editingEmployee.emergency_contact_phone_home || '',

                emergency_contact_2_name: editingEmployee.emergency_contact_2_name || '',
                emergency_contact_2_relationship: editingEmployee.emergency_contact_2_relationship || '',
                emergency_contact_2_address: editingEmployee.emergency_contact_2_address || '',
                emergency_contact_2_phone_work: editingEmployee.emergency_contact_2_phone_work || '',
                emergency_contact_2_phone_home: editingEmployee.emergency_contact_2_phone_home || '',

                medical_aid_number: editingEmployee.medical_aid_number || '',
                medical_aid_policy_number: editingEmployee.medical_aid_policy_number || '',
                blood_group: editingEmployee.blood_group || '',
                doctor_name: editingEmployee.doctor_name || '',
                doctor_phone: editingEmployee.doctor_phone || '',
                medical_conditions: editingEmployee.medical_conditions || '',

                bank_account_holder: editingEmployee.bank_account_holder || '',
                bank_name: editingEmployee.bank_name || '',
                bank_account_number: editingEmployee.bank_account_number || '',
                bank_branch_code: editingEmployee.bank_branch_code || '',
                bank_account_type: editingEmployee.bank_account_type || '',
                tax_number: editingEmployee.tax_number || '',

                sa_id_number: editingEmployee.sa_id_number || ''
            });
        }
    }, [editingEmployee]);


    // --- DATABASE WRITE TRIGGER ---
    async function handleSubmit(e) {
        e.preventDefault(); //Prevents the browser from reloading the page
        try {
            setIsSubmitting(true);

            // 🛠️ SANITIZE DATA: Convert empty strings to NULL for date and decimal fields
            // PostgreSQL will reject "" for DATE or DECIMAL types.
            const submissionData = { ...formData };

            const nullifyFields = [
                'start_date',
                'end_date',
                'date_of_birth',
                'passport_expiry_date',
                'leave_opening_balance_date',
                'employee_number',
                'email',
                'sa_id_number',
                'leave_opening_balance_annual',
                'role_id',
                'reports_to_id'
            ];

            nullifyFields.forEach(field => {
                if (submissionData[field] === '') {
                    submissionData[field] = null;
                }
            });

            if (editingEmployee) {
                const { error } = await supabase
                  .from('employees')
                  .update(submissionData)
                  .eq('id', editingEmployee.id);

                  if (error) throw error;
            } else {

                const { data: newEmployee, error } = await supabase
                    .from('employees')
                    .insert([submissionData])
                    .select()
                    .single();

                if (error) throw error;

                // 📩 TRIGGER ONBOARDING EMAIL
                if (submissionData.email) {
                    try {
                        const selectedRole = dbRoles.find(r => r.id === submissionData.role_id);
                        const authLevel = selectedRole?.authority_level || 1;

                        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                            submissionData.email,
                            { data: { authority_level: authLevel } }
                        );

                        if (inviteError) {
                            console.warn("Auth Invite failed (likely permission restricted):", inviteError.message);
                        }
                    } catch (e) {
                        console.error("Onboarding trigger error:", e);
                    }
                }
            }
            // Success: Tell the directory pass to reload its list and close the popup
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Failed to process database row transaction:", error.message);
            alert("Error saving record data updates: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        /* Dark backdrop - Dimming the rest of the layout */
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

            {/* Floating Popup Card Surface */}
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">

                {/* Form Title */}
                <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-slate-900 text-sm">
                        {editingEmployee ? "Modify Personnel Profile" : "Add New Personnel Profile"}
                        </h3>
                    <button onClick={onClose} className="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* The Data Form Entry Pass */}
                <form onSubmit={handleSubmit} className="p-4 space-y-1 overflow-y-auto">

                    <CollapsibleSection title="Primary Employment" id="primary" icon={User}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Name</label>
                                <input
                                    type="text"
                                    value={formData.preferred_name}
                                    onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employee #</label>
                                <input
                                    type="text"
                                    value={formData.employee_number}
                                    onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Position</label>
                            <select
                                required
                                value={formData.role_id}
                                onChange={(e) => {
                                    const selectedRole = dbRoles.find(r => r.id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        role_id: e.target.value,
                                        role: selectedRole?.role_name || '',
                                        department: selectedRole?.classification || ''
                                    });
                                }}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                            >
                                <option value="">-- Select Position --</option>
                                {dbRoles && dbRoles.map((roleObj) => (
                                    <option key={roleObj.id} value={roleObj.id}>
                                        {roleObj.role_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reporting To</label>
                                <select
                                    value={formData.reports_to_id}
                                    onChange={(e) => {
                                        const selected = employees.find(emp => emp.id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            reports_to_id: e.target.value,
                                            manager_name: selected ? `${selected.first_name} ${selected.last_name}` : ''
                                        });
                                    }}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                >
                                    <option value="">No Direct Manager</option>
                                    {employees.filter(e => e.id !== editingEmployee?.id).map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employment Type</label>
                                <select
                                    value={formData.employment_type}
                                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                >
                                    <option value="">Select type...</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                                <select
                                    value={formData.employment_status}
                                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Probation">Probation</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Personal & Address" id="personal" icon={MapPin}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nationality</label>
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SA ID Number</label>
                                <input
                                    type="text"
                                    value={formData.sa_id_number}
                                    onChange={(e) => setFormData({ ...formData, sa_id_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marital Status</label>
                                <select
                                    value={formData.marital_status}
                                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                >
                                    <option value="">Select...</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                        </div>

                        {/* CONDITIONAL PASSPORT SECTION */}
                        {isForeign && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 space-y-3">
                                <p className="text-[9px] font-bold text-yellow-700 uppercase">Foreign Employee Details</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Passport Number</label>
                                        <input
                                            type="text"
                                            value={formData.passport_number}
                                            onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                                            className="w-full border border-yellow-200 px-3 py-1.5 rounded-lg text-sm focus:border-yellow-600 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={formData.passport_expiry_date}
                                            onChange={(e) => setFormData({ ...formData, passport_expiry_date: e.target.value })}
                                            className="w-full border border-yellow-200 px-3 py-1.5 rounded-lg text-sm focus:border-yellow-600 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Street #</label>
                                <input
                                    type="text"
                                    value={formData.address_street_no}
                                    onChange={(e) => setFormData({ ...formData, address_street_no: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Street Name</label>
                                <input
                                    type="text"
                                    value={formData.address_street_name}
                                    onChange={(e) => setFormData({ ...formData, address_street_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Area / Suburb</label>
                                <input
                                    type="text"
                                    value={formData.address_area}
                                    onChange={(e) => setFormData({ ...formData, address_area: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Code</label>
                                <input
                                    type="text"
                                    value={formData.address_code}
                                    onChange={(e) => setFormData({ ...formData, address_code: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Spouse & Family" id="family" icon={Users}>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Spouse Full Name</label>
                            <input
                                type="text"
                                value={formData.spouse_name}
                                onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Spouse Nationality</label>
                                <input
                                    type="text"
                                    value={formData.spouse_nationality}
                                    onChange={(e) => setFormData({ ...formData, spouse_nationality: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Spouse Passport #</label>
                                <input
                                    type="text"
                                    value={formData.spouse_passport_number}
                                    onChange={(e) => setFormData({ ...formData, spouse_passport_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Dependants</label>
                                <button
                                    type="button"
                                    onClick={addDependant}
                                    className="text-[9px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.dependants.map((dep, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <input
                                                placeholder="Full Name"
                                                value={dep.name}
                                                onChange={(e) => updateDependant(idx, 'name', e.target.value)}
                                                className="w-full border border-slate-200 px-2 py-1 rounded text-xs"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <select
                                                value={dep.sex}
                                                onChange={(e) => updateDependant(idx, 'sex', e.target.value)}
                                                className="w-full border border-slate-200 px-2 py-1 rounded text-xs"
                                            >
                                                <option value="">Sex</option>
                                                <option value="M">M</option>
                                                <option value="F">F</option>
                                            </select>
                                        </div>
                                        <div className="w-12">
                                            <input
                                                placeholder="Age"
                                                value={dep.age}
                                                onChange={(e) => updateDependant(idx, 'age', e.target.value)}
                                                className="w-full border border-slate-200 px-2 py-1 rounded text-xs"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDependant(idx)}
                                            className="p-1 text-slate-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Emergency Contacts" id="emergency" icon={ShieldAlert}>
                        <div className="space-y-3">
                            <p className="text-[9px] font-bold text-slate-400 uppercase border-b pb-1">Primary Contact</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Relationship</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_relationship}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cell</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_number}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Work</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_phone_work}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone_work: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Home</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_phone_home}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone_home: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4">
                            <p className="text-[9px] font-bold text-slate-400 uppercase border-b pb-1">Alternative Contact</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_2_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_2_name: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Relationship</label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_2_relationship}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_2_relationship: e.target.value })}
                                        className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Medical Details" id="medical" icon={Heart}>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medical Aid #</label>
                                <input
                                    type="text"
                                    value={formData.medical_aid_number}
                                    onChange={(e) => setFormData({ ...formData, medical_aid_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Policy #</label>
                                <input
                                    type="text"
                                    value={formData.medical_aid_policy_number}
                                    onChange={(e) => setFormData({ ...formData, medical_aid_policy_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Blood Group</label>
                                <input
                                    type="text"
                                    value={formData.blood_group}
                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Doctor Name</label>
                                <input
                                    type="text"
                                    value={formData.doctor_name}
                                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Allergies / Conditions</label>
                            <textarea
                                rows={2}
                                value={formData.medical_conditions}
                                onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                            />
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Salary & Banking" id="banking" icon={CreditCard}>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Salary / Wage</label>
                            <input
                                type="text"
                                value={formData.salary_wage}
                                onChange={(e) => setFormData({ ...formData, salary_wage: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Holder</label>
                                <input
                                    type="text"
                                    value={formData.bank_account_holder}
                                    onChange={(e) => setFormData({ ...formData, bank_account_holder: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.bank_account_number}
                                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Type</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Savings"
                                    value={formData.bank_account_type}
                                    onChange={(e) => setFormData({ ...formData, bank_account_type: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Branch Code</label>
                                <input
                                    type="text"
                                    value={formData.bank_branch_code}
                                    onChange={(e) => setFormData({ ...formData, bank_branch_code: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tax Number</label>
                                <input
                                    type="text"
                                    value={formData.tax_number}
                                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                                    className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:border-slate-900 bg-slate-50"
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Action Button */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5 text-yellow-600" />
                            <span>{isSubmitting ? "Saving..." : editingEmployee ? "Update Changes" : "Save Employee"}</span>
                          </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
