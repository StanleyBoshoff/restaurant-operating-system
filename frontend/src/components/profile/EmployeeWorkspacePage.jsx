import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import EmployeeProfileHeader from './EmployeeProfileHeader';
import EmployeeTabNavigation from './EmployeeTabNavigation';
import { EMPLOYEE_TABS } from './EmployeeTabRegistry';

export default function EmployeeWorkspacePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [dbRoles, setDbRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchData() {
        try {
            setLoading(true);

            // Fetch employee
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('id', id)
                .single();

            if (empError) throw empError;
            setEmployee(empData);

            // Fetch roles for editing (Details tab needs this)
            const { data: rolesData, error: rolesError } = await supabase
                .from('roles')
                .select('*');

            if (rolesError) throw rolesError;
            setDbRoles(rolesData || []);

        } catch (err) {
            console.error('Error fetching employee workspace data:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleProfileUpdated = (updatedEmployee) => {
        setEmployee(updatedEmployee);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 text-sm font-medium">Loading workspace...</p>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Workspace Not Found</h2>
                <p className="text-slate-500 mb-6">We couldn't load the employee record you requested.</p>
                <button
                    onClick={() => navigate('/employees')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold"
                >
                    Return to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <EmployeeProfileHeader employee={employee} />

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <EmployeeTabNavigation baseUrl={`/employees/${id}`} />

                <div className="p-6">
                    <Routes>
                        {EMPLOYEE_TABS.map((tab) => (
                            <Route
                                key={tab.id}
                                path={tab.path}
                                element={
                                    <tab.component
                                        employee={employee}
                                        dbRoles={dbRoles}
                                        onProfileUpdated={handleProfileUpdated}
                                        onRefresh={fetchData}
                                    />
                                }
                            />
                        ))}
                    </Routes>
                </div>
            </div>
        </div>
    );
}
