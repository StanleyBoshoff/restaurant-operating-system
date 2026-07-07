import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AddEmployeeForm({ onClose, onRefresh }) {

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        role: '',
        branch: '',
        sa_id_number: ''        
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- DATABASE WRITE TRIGGER ---
    async function handleSubmit(e) {
        e.preventDefault(); //Prevents the browser from reloading the page
        try {
            setIsSubmitting(true);

            const { error } = await supabase
            .from('employees')
            .insert([formData]);

            if (error) throw error;

            // Success: Tell the directory pass to reload its list and close the popup
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Failed to add employee:", error.message);
            alert("Error saving record: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        /* Dark backdrop - Dimming the rest of the layout */
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

            {/* Floating Popup Card Surface */}
            <div className="bg-white rounded-x1 shadow-x1 w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                {/* Form Title */}
                <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Add New Personnel Profile</h3>
                    <button onclick={onClose} classname="p-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                        <x className="w-4 h-4" />
                    </button>
                </div>

                {/* The Data Form Entry Pass */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">

                    <div>
                        <label className="Block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="Block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name / Surname</label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="Block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role / Job Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Waitron, Sous Chef, Bartender"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="Block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch Assignment</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Centurion Central"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="w-full border border-slate-200 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-yellow-600 bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="Block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">SA ID Number (Optional)</label>
                        <input
                          type="text"
                          maxLength="13"
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
                          className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-slate-800 transition colors disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5 text-yellow-600" />
                            <span>{isSubmitting ? "Saving..." : "Save Employee"}</span>
                          </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
