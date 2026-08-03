import { supabase } from '../supabaseClient';
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddEmployeeForm from './AddEmployeeForm';
import SummaryCard from './common/SummaryCard';
import StatusBadge from './common/StatusBadge';
import ModuleWorkspaceHeader from './common/ModuleWorkspaceHeader';

export default function EmployeeDirectory() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [dbRoles, setDbRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    async function fetchDbRoles() {
        try {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) throw error;
            console.log("Successfully loaded roles:", data);
            setDbRoles(data || []);
        } catch(error) {
            console.error("Failed to load roles:", error.message);
            alert("Database Error: Could not load roles list. Check your Supabase connection or RLS settings.");
        }
    }

    async function fetchEmployees() {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('employees').select('*');
            if (error) throw error;
            console.log("Successfully loaded employees:", data);
            setEmployees(data || []);
        } catch (error) {
            console.error('Database connection error:', error.message);
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchEmployees();
        fetchDbRoles();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <ModuleWorkspaceHeader
                title="Employee Directory"
                description="Manage and view all employee profiles and employment records."
                icon={Users}
                actions={
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <UserPlus size={16} />
                        Add New Employee
                    </button>
                }
            />

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-3xs placeholder:text-slate-300"
                    />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-3xs active:scale-95">
                    <Filter size={16} />
                    Advanced Filters
                </button>
            </div>

            <SummaryCard
                title="Personnel Database"
                icon={Users}
                badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filteredEmployees.length} TOTAL</span>}
            >
                <div className="overflow-x-auto -mx-4 -mb-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Assignment</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch Location</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Employment Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Reference ID</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-[13px]">
                            {loading ? (
                                <tr>
                                    <td className="px-6 py-12 text-slate-500 animate-pulse italic text-center" colSpan="5">
                                        Connecting to cloud data modules...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-12 text-slate-500 text-center italic" colSpan="5">
                                        No employee profiles found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => navigate(`/employees/${emp.id}`)}
                                        className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[11px] group-hover:bg-white group-hover:border-slate-300 transition-all shadow-3xs">
                                                    {emp.first_name[0]}{emp.last_name[0]}
                                                </div>
                                                <span className="font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">
                                                    {emp.first_name} {emp.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{emp.role || 'Unassigned'}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{emp.branch || 'Unassigned'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={emp.employment_status || 'Active'} />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-400 text-[11px] tracking-wider text-right font-medium">
                                            {emp.sa_id_number || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </SummaryCard>

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
