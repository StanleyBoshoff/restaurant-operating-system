import React, { useEffect, useState } from 'react';
//Fetch standalone components
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import EmployeeDirectory from './components/EmployeeDirectory';
import DocumentTracker from './components/DocumentTracker';

import {
  Users, FileText, Globe, ShieldAlert, BarChart3, Settings
} from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [companyName, setCompanyname] = useState("Restaurise");
  const [currentModule, setCurrentModule] = useState(() => {
    return localStorage.getItem('active_ros_module') || 'dashboard';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
      { id: 'employees', name: 'Employees (Mod 1)', icon: Users },
      { id: 'documents', name: 'Documents (Mod 2)', icon: FileText },
      { id: 'compliance', name: 'Foreign Compliance (Mod 3)', icon: Globe },
      { id: 'setup', name: 'System Setup (Hidden)', icon: Settings },    
  ];

  React.useEffect(() => {
    localStorage.setItem('active_ros_module', currentModule);
  }, [currentModule]);

    return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">

      {/* 1. Backdrop Overlay Mask — Only visible on mobile when the sidebar drawer is open */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* 2. Master Sidebar Station component */}
      <Sidebar 
        companyName={companyName} 
        navigationItems={navigationItems}
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* 3. Main Workspace Container Pass */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
        sidebarOpen ? 'md:pl-64 pl-0' : 'md:pl-16 pl-0'
      }`}>
        
        {/* 🍔 📱 NEW RESPONSIVE TOP HEADER BANNER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            {/* The Hamburger Button Trigger */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none border border-slate-200 bg-slate-50 shadow-2xs cursor-pointer"
            >
              {/* Simple 3-line structural HTML Hamburger symbol */}
              <div className="space-y-1 w-5 h-4 flex flex-col justify-center items-center">
                <span className="w-4 h-0.5 bg-slate-700 block rounded-xs"></span>
                <span className="w-4 h-0.5 bg-slate-700 block rounded-xs"></span>
                <span className="w-4 h-0.5 bg-slate-700 block rounded-xs"></span>
              </div>
            </button>
            
            <h2 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider">
              {currentModule === 'dashboard' ? "Command Center" : `${currentModule} Module`}
            </h2>
          </div>
          
          <div className="text-[11px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-wider">
            {companyName}
          </div>
        </header>

        {/* 4. Active Workspace Views Container Pass */}
        <main className="p-4 md:p-6 max-w-7xl w-full mx-auto flex-1">
          {currentModule === 'dashboard' && <Dashboard companyName={companyName} />}
          {currentModule === 'employees' && (<EmployeeDirectory />)}
          {currentModule === 'documents' && <DocumentTracker />}


          {currentModule !== 'dashboard' && currentModule !== 'employees' && (
            <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-xs text-slate-400 text-xs italic">
              {currentModule} workspace module under structural setup.
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
