import React, { useState } from 'react';
//We fetch our standalone components
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar'

export default function App() {
  const [companyName, setCompanyname] = useState("Restaurise");

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar component */}
      <Sidebar companyName={companyName} />

      {/* Main content area */}
      <div className="flex-1 md:pl-64 p-6">
      <h1 className="text-xs uppercase font mono tracking-widest text-slate-400 mb-4">
        Master Operating Shell Frame
      </h1>

      {/* Dashboard component */}
      <Dashboard companyName={companyName} />
    </div>
    </div>
  );
}