import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
//Fetch standalone components
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import EmployeeDirectory from './components/EmployeeDirectory';
import DocumentTracker from './components/DocumentTracker';
import EmployeeWorkspacePage from './components/profile/EmployeeWorkspacePage';

// Import New Overview Components
import TimesheetsWorkspace from './components/timesheets/Workspace';
import LeaveWorkspace from './components/leave/Workspace';
import TrainingWorkspace from './components/training/Workspace';
import TasksWorkspace from './components/tasks/Workspace';
import ChecklistsWorkspace from './components/checklists/Workspace';
import FormsWorkspace from './components/forms/Workspace';
import SafetyWorkspace from './components/safety/Workspace';
import DisciplinaryWorkspace from './components/disciplinary/Workspace';
import CommunicationWorkspace from './components/communication/Workspace';
import ReportsWorkspace from './components/reports/Workspace';
import SettingsWorkspace from './components/settings/Workspace';

import {
  Users, FileText, Globe, ShieldAlert, BarChart3, Settings,
  Clock, Calendar, GraduationCap, CheckSquare, ClipboardList, ShieldCheck, MessageSquare, Gavel
} from 'lucide-react';

function AppContent() {
  const [companyName] = useState("Restaurise");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();

  // Update sidebar state if window is resized to desktop/mobile breakpoints
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getActiveModule = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path.startsWith('/employees')) return 'employees';
    if (path.startsWith('/attendance')) return 'attendance';
    if (path.startsWith('/leave')) return 'leave';
    if (path.startsWith('/disciplinary')) return 'disciplinary';
    if (path.startsWith('/training')) return 'training';
    if (path.startsWith('/tasks')) return 'tasks';
    if (path.startsWith('/checklists')) return 'checklists';
    if (path.startsWith('/forms')) return 'forms';
    if (path.startsWith('/safety')) return 'safety';
    if (path.startsWith('/communication')) return 'communication';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentModule = getActiveModule();

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'employees', name: 'Employees', icon: Users, path: '/employees' },
    { id: 'attendance', name: 'Time & Attendance', icon: Clock, path: '/attendance' },
    { id: 'leave', name: 'Leave', icon: Calendar, path: '/leave' },
    { id: 'disciplinary', name: 'Disciplinary', icon: Gavel, path: '/disciplinary' },
    { id: 'training', name: 'Training', icon: GraduationCap, path: '/training' },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'checklists', name: 'Checklists', icon: ClipboardList, path: '/checklists' },
    { id: 'forms', name: 'Forms', icon: FileText, path: '/forms' },
    { id: 'safety', name: 'Health & Safety', icon: ShieldCheck, path: '/safety' },
    { id: 'communication', name: 'Communication', icon: MessageSquare, path: '/communication' },
    { id: 'reports', name: 'Reports', icon: BarChart3, path: '/reports' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <Sidebar
        companyName={companyName} 
        navigationItems={navigationItems}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:pl-48 pl-0' : 'md:pl-16 pl-0'
      }`}>
        
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm transition-all">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none border border-slate-200 bg-white shadow-3xs cursor-pointer transition-all active:scale-90"
            >
              <div className="space-y-1 w-5 h-4 flex flex-col justify-center items-center">
                <span className={`h-0.5 bg-slate-700 block rounded-full transition-all ${sidebarOpen ? 'w-5' : 'w-4'}`}></span>
                <span className={`h-0.5 bg-slate-700 block rounded-full transition-all ${sidebarOpen ? 'w-3' : 'w-5'}`}></span>
                <span className={`h-0.5 bg-slate-700 block rounded-full transition-all ${sidebarOpen ? 'w-5' : 'w-3'}`}></span>
              </div>
            </button>
            
            <div className="flex flex-col text-left">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                {currentModule === 'dashboard' ? "Management Workspace" : `${currentModule} Module`}
              </h2>
              <h1
                className="text-lg font-black text-yellow-600 leading-none tracking-wide"
                style={{
                    WebkitTextStroke: "0.3px #1e293b",
                    paintOrder: "stroke fill"
                }}
              >
                {currentModule === 'dashboard' ? "Command Center" : "Administrative Console"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{companyName}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Enterprise ROS</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center text-white font-black text-[10px] shadow-sm ring-1 ring-yellow-700/20">
              R
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-7xl w-full mx-auto flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard onNavigateToEmployee={(id) => navigate(`/employees/${id}`)} />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/employees/:id/*" element={<EmployeeWorkspacePage />} />
            <Route path="/attendance/*" element={<TimesheetsWorkspace />} />
            <Route path="/leave/*" element={<LeaveWorkspace />} />
            <Route path="/disciplinary/*" element={<DisciplinaryWorkspace />} />
            <Route path="/training/*" element={<TrainingWorkspace />} />
            <Route path="/tasks/*" element={<TasksWorkspace />} />
            <Route path="/checklists/*" element={<ChecklistsWorkspace />} />
            <Route path="/forms/*" element={<FormsWorkspace />} />
            <Route path="/safety/*" element={<SafetyWorkspace />} />
            <Route path="/communication/*" element={<CommunicationWorkspace />} />
            <Route path="/reports/*" element={<ReportsWorkspace />} />
            <Route path="/settings/*" element={<SettingsWorkspace />} />
            <Route path="*" element={
              <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-xs text-slate-400 text-xs italic">
                Workspace module under structural setup.
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
