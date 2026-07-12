import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function TabDetails({ employee, dbRoles = [] }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        role: employee?.role || '',
        branch: employee?.branch || '',
        sa_id_number: employee?.sa_id_number || ''
    });

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
                    sa_id_number: formData.sa_id_number
                })
                .eq('id', employee.id);

            if (error) throw error;
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update employee details:', error.message);
            alert('Error updating profile settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

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

                <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">SA ID Number</label>
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
                </div>
            </form>
        </div>
    );
}
