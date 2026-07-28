import React from 'react';
import { User, MapPin, Briefcase, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeProfileHeader({ employee }) {
    const navigate = useNavigate();

    if (!employee) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="h-24 bg-slate-900 border-b border-slate-800 relative">
                <button
                    onClick={() => navigate('/employees')}
                    className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium backdrop-blur-sm"
                >
                    <ChevronLeft size={16} />
                    Back to Directory
                </button>
            </div>

            <div className="px-6 pb-6 relative">
                <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-10">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md">
                        <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center text-yellow-600">
                            <User size={40} />
                        </div>
                    </div>

                    <div className="flex-1 pb-1">
                        <div className="flex items-center gap-3">
                            <h1
                                className="text-4xl font-black text-yellow-600 tracking-wide"
                                style={{
                                    WebkitTextStroke: "0.4px #1e293b",
                                    paintOrder: "stroke fill"
                                }}
                            >
                                {employee.first_name} {employee.last_name}
                            </h1>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                #{employee.employee_number || 'TEMP'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Briefcase size={14} className="text-slate-400" />
                                <span>{employee.role || 'Unassigned Role'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <MapPin size={14} className="text-slate-400" />
                                <span>{employee.branch || 'Unassigned Location'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <span className={`w-2 h-2 rounded-full ${employee.employment_status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                <span className="font-medium">{employee.employment_status || 'Active'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-bold rounded-lg transition-colors shadow-sm">
                            Quick Action
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
