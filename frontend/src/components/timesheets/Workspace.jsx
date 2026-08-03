import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { TIMESHEET_TABS } from './tabs';

// Tab Components
import TabOverview from './TabOverview';
import TabLiveClock from './TabLiveClock';
import TabWeekly from './TabWeekly';
import TabMonthlyRegister from './TabMonthlyRegister';
import TabApprovals from './TabApprovals';
import TabPayrollExport from './TabPayrollExport';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="animate-in fade-in duration-500">
      <ModuleWorkspaceHeader
        title="Time & Attendance"
        description="Monitor staff hours, manage weekly timesheets, and handle payroll exports."
        icon={Clock}
      />

      <ModuleTabNavigation
        tabs={TIMESHEET_TABS}
        baseUrl="/timesheets"
      />

      <div className="min-h-[400px]">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="live-clock" element={<TabLiveClock />} />
          <Route path="weekly" element={<TabWeekly />} />
          <Route path="monthly-register" element={<TabMonthlyRegister />} />
          <Route path="approvals" element={<TabApprovals />} />
          <Route path="payroll-export" element={<TabPayrollExport />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
