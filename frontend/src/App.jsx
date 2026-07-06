import React, { useState } from 'react';
import { 
  Users, FileText, Globe, AlertCircle, Calendar, 
  CheckSquare, ShieldAlert, BarChart3, Menu, X, LogOut 
} from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentModule, setCurrentModule] = useState('dashboard');

  // Hardcoded for UI visualization phase
  const mockUser = { name: "Thabo Khumalo", role: "Restaurant Manager", branch: "Pretoria East" };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'employees', name: 'Employees (Mod 1)', icon: Users },
    { id: 'documents', name: 'Documents (Mod 2)', icon: FileText },
    { id: 'compliance', name: 'Foreign Compliance (Mod 3)', icon: Globe },
    { id: 'disciplinary', name: 'Disciplinary (Mod 4)', icon: ShieldAlert },
    { id: 'leave', name: 'Leave Management (Mod 5)', icon: Calendar },
    { id: 'tasks', name: 'Tasks & Checklists', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 selection:bg-orange-200">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`bg-slate-900 text-slate-200 w-64 fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-0'} transition-transform duration-200 ease-in-out flex flex-col justify-between border-r border-slate-800`}>
        <div>
          {/* App Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
            <span className="text-xl font-bold tracking-tight text-orange-500">RestoOS <span className="text-xs font-normal text-slate-400">v1</span></span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge Profile snippet */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <p className="text-sm font-semibold truncate text-slate-100">{mockUser.name}</p>
            <p className="text-xs text-orange-400 font-medium">{mockUser.role}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{mockUser.branch}</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentModule(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER CONTROLLER */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        
        {/* TOP NAVBAR BANNER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold capitalize text-gray-800">
              {currentModule === 'dashboard' ? "Management Command Center" : `${currentModule} Module`}
            </h1>
          </div>
          
          {/* Quick Indicator Badges */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-red-50 rounded-full border border-red-100 text-red-700 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3 Expiring Work Permits</span>
            </div>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Database Connected"></div>
          </div>
        </header>

        {/* WORKSPACE VIEWPACK COMPONENT CONTENT SCREEN */}
        <main className="p-4 md:p-6 max-w-7xl w-full mx-auto flex-1">
          {currentModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Feature Intro Widget */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">Welcome to your Restaurant Shell Architecture</h2>
                <p className="text-gray-600 mt-1 text-sm max-w-2xl">
                  This framework handles routing frames dynamically. The layout features real-time visual alerts and is fully optimized for custom mobile views or responsive desktop control panels.
                </p>
              </div>

              {/* Status Counters Grid Placement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Active Employees", count: "42", color: "border-l-blue-500" },
                  { label: "Pending Leave Forms", count: "5", color: "border-l-amber-500" },
                  { label: "Open Incidents", count: "1", color: "border-l-red-500" },
                  { label: "Checklists Complete", count: "88%", color: "border-l-emerald-500" }
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-white border border-gray-200 border-l-4 ${stat.color} p-4 rounded-xl shadow-sm`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentModule !== 'dashboard' && (
            <div className="bg-white border border-gray-200 p-12 rounded-2xl shadow-sm text-center">
              <p className="text-gray-400 text-sm">Workspace Screen Component Sandbox</p>
              <h3 className="text-lg font-semibold text-gray-700 mt-2 capitalize">{currentModule} Workspace Subsystem View</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
                This area will house the active step forms, multi-branch listings, data dashboards, or management layouts built during subsequent steps.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
