import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { LEAVE_TABS } from './tabs';

// Tab Components
import TabOverview from './TabOverview';
import TabRequests from './TabRequests';
import TabCalendar from './TabCalendar';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="animate-in fade-in duration-500">
      <ModuleWorkspaceHeader
        title="Leave Management"
        description="Track time off, manage holiday requests, and monitor staff availability."
        icon={Calendar}
      />

      <ModuleTabNavigation
        tabs={LEAVE_TABS}
        baseUrl="/leave"
      />

      <div className="min-h-[400px]">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="requests" element={<TabRequests />} />
          <Route path="calendar" element={<TabCalendar />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
