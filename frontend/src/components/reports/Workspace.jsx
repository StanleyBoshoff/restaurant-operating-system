import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { REPORTS_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabEmployees from './TabEmployees';
import TabAttendance from './TabAttendance';
import TabLeave from './TabLeave';
import TabLabour from './TabLabour';
import TabTraining from './TabTraining';
import TabWarnings from './TabWarnings';
import TabCompliance from './TabCompliance';
import TabPerformance from './TabPerformance';
import TabCustom from './TabCustom';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Operational Reports"
        description="Manage and monitor business analytics and performance reports."
        icon={BarChart3}
      />

      <ModuleTabNavigation tabs={REPORTS_TABS} baseUrl="/reports" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="employees" element={<TabEmployees />} />
          <Route path="attendance" element={<TabAttendance />} />
          <Route path="leave" element={<TabLeave />} />
          <Route path="labour" element={<TabLabour />} />
          <Route path="training" element={<TabTraining />} />
          <Route path="warnings" element={<TabWarnings />} />
          <Route path="compliance" element={<TabCompliance />} />
          <Route path="performance" element={<TabPerformance />} />
          <Route path="custom" element={<TabCustom />} />
        </Routes>
      </div>
    </div>
  );
}
