import React, { useState, useRef, useEffect } from 'react';
import { User, MapPin, Briefcase, ChevronLeft, Zap, Edit, FileUp, Calendar, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeProfileHeader({ employee }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!employee) return null;

    const quickActions = [
        { label: 'Edit Profile', icon: Edit, path: 'details', color: 'text-blue-600' },
        { label: 'Upload Document', icon: FileUp, path: 'documents', color: 'text-emerald-600' },
        { label: 'Issue Warning', icon: AlertCircle, path: 'warnings', color: 'text-rose-600' },
        { label: 'Log Leave', icon: Calendar, path: 'leave', color: 'text-amber-600' },
        { label: 'Timesheets', icon: Clock, path: 'time-attendance', color: 'text-indigo-600' },
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
            <div className="h-24 bg-slate-900 border-b border-slate-800 relative rounded-t-2xl">
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

                    <div className="flex items-center gap-2 relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                        >
                            <Zap size={14} fill="currentColor" />
                            <span>Quick Action</span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <div className="p-2 bg-slate-50 border-b border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Personnel Actions</span>
                                </div>
                                <div className="p-1">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.label}
                                            onClick={() => {
                                                navigate(action.path);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                                        >
                                            <div className={`w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center ${action.color} shadow-3xs group-hover:scale-110 transition-transform`}>
                                                <action.icon size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
