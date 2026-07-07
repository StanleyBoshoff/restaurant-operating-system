import React, { useState } from 'react';
//We fetch our standalone components
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import EmployeeDirectory from './components/EmployeeDirectory';

export default function App() {
  const [companyName, setCompanyname] = useState("Restaurise");
  const [currentModule, setCurrentModule] = useState('dashboard');


  const navigationItems = [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'employees', name: 'Employees (Mod 1)' },
      { id: 'documents', name: 'Documents (Mod 2)' },
      { id: 'compliance', name: 'Foreign Compliance (Mod 3)' },
      { id: 'setup', name: 'System Setup (Hidden)' },    
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar component */}
      <Sidebar 
      companyName={companyName} 
      navigationItems={navigationItems}
      currentModule={currentModule}
      setCurrentModule={setCurrentModule} />

      {/* Main content area */}
      <div className="flex-1 md:pl-64 p-6">
      <h1 className="text-xs uppercase font mono tracking-widest text-slate-400 mb-4">
        Master Operating Shell Frame
      </h1>

      {/* Dynamic Workspace Router */}
      {currentModule === 'dashboard' && <Dashboard companyName={companyName} />}

      {currentModule === 'employees' && <EmployeeDirectory />}

      {currentModule !== 'dashboard' && currentModule !== 'employees' && (
        <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-sm text-slate-400 text-xs">
          {currentModule} workspace module under structural setup.
        </div>
      )}
      </div>
    </div>
  );
}