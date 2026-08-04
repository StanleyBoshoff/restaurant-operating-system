import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { ATTENDANCE_TABS } from './tabs';

// Tab Components
import TabOverview from './TabOverview';
import TabLiveClock from './TabLiveClock';
import TabMonthlyRegister from './TabMonthlyRegister';
import TabPayrollExport from './TabPayrollExport';

export default function Workspace() {
  return (
    <div className="animate-in fade-in duration-500">
      <ModuleWorkspaceHeader
        title="Time & Attendance"
        description="Monitor staff hours, verify monthly registers, and handle payroll reporting."
        icon={Clock}
      />

      <ModuleTabNavigation
        tabs={ATTENDANCE_TABS}
        baseUrl="/attendance"
      />

      <div className="min-h-[400px]">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="live-clock" element={<TabLiveClock />} />
          <Route path="monthly-register" element={<TabMonthlyRegister />} />
          <Route path="payroll-export" element={<TabPayrollExport />} />
        </Routes>
      </div>
    </div>
  );
}
