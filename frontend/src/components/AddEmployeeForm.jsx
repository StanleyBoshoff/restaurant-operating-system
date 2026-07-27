import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AddEmployeeForm({ onClose, onRefresh, dbRoles, editingEmployee }) {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: '',
        branch: '',
        employee_number: '',
        department: '',
        employment_type: '',
        employment_status: 'Active',
        nationality: '',
        phone_number: '',
        email: '',
        start_date: '',
        end_date: '',
        manager_name: '',
        probation_status: 'Not Started',
        salary_wage: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        sa_id_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- PRE-FILL IN EDIT MODE ---
    useEffect(() => {
        if (editingEmployee) {
            setFormData({
                first_name: editingEmployee.first_name || '',
                last_name: editingEmployee.last_name ||'',
                role: editingEmployee.role || '',
                branch: editingEmployee.branch || '',
                employee_number: editingEmployee.employee_number || '',
                department: editingEmployee.department || '',
                employment_type: editingEmployee.employment_type || '',
                employment_status: editingEmployee.employment_status || 'Active',
                nationality: editingEmployee.nationality || '',
                phone_number: editingEmployee.phone_number || '',
                email: editingEmployee.email || '',
                start_date: editingEmployee.start_date || '',
                end_date: editingEmployee.end_date || '',
                manager_name: editingEmployee.manager_name || '',
                probation_status: editingEmployee.probation_status || 'Not Started',
                salary_wage: editingEmployee.salary_wage || '',
                emergency_contact_name: editingEmployee.emergency_contact_name || '',
                emergency_contact_number: editingEmployee.emergency_contact_number || '',
                sa_id_number: editingEmployee.sa_id_number || ''
            });
        }
    }, [editingEmployee]);


    // --- DATABASE WRITE TRIGGER ---
    async function handleSubmit(e) {
        e.preventDefault(); //Prevents the browser from reloading the page
        try {
            setIsSubmitting(true);

            if (editingEmployee) {
                const { error } = await supabase
                  .from('employees')
                  .update(formData)
                  .eq('id', editingEmployee.id);

                  if (error) throw error;
            } else {

                const { error } = await supabase
                    .from('employees')
                    .insert([formData]);

                if (error) throw error;
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                {/* Form Title */}
                <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                        {editingEmployee ? "Modify Personnel Profile" : "Add New Personnel Profile"}
                        </h3>
                    <button onClick={onClose} className="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* The Data Form Entry Pass */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name / Surname</label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                                        {/*  INSERT THIS NEW SELECT BLOCK: */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role / Job Title</label>
                        <select 
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50 text-slate-800"
                        >
                          <option value="">-- Select Official Dynamic Position --</option>
                          
                          {/* Loop over our live database roles table array records! */}
                          {dbRoles && dbRoles.map((roleObj) => (
                            <option key={roleObj.role_name} value={roleObj.role_name}>
                              {roleObj.role_name} ({roleObj.classification})
                            </option>
                          ))}
                        </select>
                    </div>


                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch Assignment</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Centurion Central"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Number</label>
                            <input
                                type="text"
                                value={formData.employee_number}
                                onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employment Type</label>
                            <select
                                value={formData.employment_type}
                                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50 text-slate-800"
                            >
                                <option value="">Select type...</option>
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Casual">Casual</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Employment Status</label>
                            <select
                                value={formData.employment_status}
                                onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50 text-slate-800"
                            >
                                <option value="Active">Active</option>
                                <option value="Probation">Probation</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Terminated">Terminated</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nationality</label>
                            <input
                                type="text"
                                value={formData.nationality}
                                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Manager</label>
                            <input
                                type="text"
                                value={formData.manager_name}
                                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Probation Status</label>
                            <select
                                value={formData.probation_status}
                                onChange={(e) => setFormData({ ...formData, probation_status: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50 text-slate-800"
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Probation">In Probation</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Salary / Wage</label>
                            <input
                                type="text"
                                value={formData.salary_wage}
                                onChange={(e) => setFormData({ ...formData, salary_wage: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_name}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact Number</label>
                        <input
                            type="text"
                            value={formData.emergency_contact_number}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">ID / Passport Number</label>
                        <input
                            type="text"
                            placeholder="13-digit SA ID or passport number"
                            value={formData.sa_id_number}
                            onChange={(e) => setFormData({ ...formData, sa_id_number: e.target.value })}
                            className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

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
