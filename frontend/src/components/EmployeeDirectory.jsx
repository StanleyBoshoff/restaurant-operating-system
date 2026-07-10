import { supabase } from '../supabaseClient';
import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import AddEmployeeForm from './AddEmployeeForm';

export default function EmployeeDirectory({ dbRoles }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    async function fetchEmployees() {
        try {
            setLoading(true);
            const { data, error } = await supabase
            .from('employees')
            .select('*');
            if (error) throw error;
            setEmployees(data || []);
        } catch (error) {
            console.error('Database connection error:', error.message);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div className="space-y-4">

            {/* 1.  STATION HEADER PORT CONTROL */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Employee Profiles Directory</h2>
                    <p className="text-slate-500 text-xs">Live administrative staff listings streamed directly from cloud data modules.</p>
                </div>

                {/* Active trigger button container to add staff members */}
                <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <UserPlus className="w-4 h-4 text-yellow-600" />
                    <span>New Employee</span>
                </button>
            </div>

            {/* 2.  LIVE DATA VIEW TABLE FRAMEWORK */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <th className="p-4">Full Name</th>
                            <th className="p-4">Role Assignment</th>
                            <th className="p-4">Branch Location</th>
                            <th className="p-4">SA ID Number</th>                        
                        </tr>
                    </thead>

                    <tbody className="devide-y devide-slate-100 text-sm">
                        
                        {loading ? (
                        <tr>
                            <td className="p-4 text-slate-500 animate-pulse italic" colSpan="4">
                                Connecting to cloud data modules...
                            </td>
                        </tr>
                        ) : employees.length === 0 ? (
                        <tr>
                            <td className="p-4 text-slate-500 text-center italic" colSpan="4">
                                No employee profiles found on the server.
                            </td>
                        </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-medium text-slate-900">
                                        {emp.first_name} {emp.last_name}
                                    </td>
                                    <td className="p-4 text-slate-600">{emp.role}</td>                                
                                    <td className="p-4 text-slate-600">{emp.branch}</td>
                                    <td className="p-4 font-mono text-slate-400 text-xs tracking-wider">
                                        {emp.sa_id_number || 'N/A'}
                                    </td>                                    
                                </tr>
                            ))
                        )}

                    </tbody>

                </table>
            </div>

            {/* FLOATING MODAL OVERLAY COMPONENT */}
            {showForm && (
                <AddEmployeeForm
                onClose={() => setShowForm(false)}
                onRefresh={fetchEmployees}
                dbRoles={dbRoles}
                />
            )}

        </div>
    );
}