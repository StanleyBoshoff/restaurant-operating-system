import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { TASKS_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabOpen from './TabOpen';
import TabRecurring from './TabRecurring';
import TabTemplates from './TabTemplates';
import TabCompleted from './TabCompleted';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Tasks & Assignments"
        description="Manage daily operations, recurring duties, and team assignments."
        icon={CheckSquare}
      />

      <ModuleTabNavigation tabs={TASKS_TABS} baseUrl="/tasks" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="open" element={<TabOpen />} />
          <Route path="recurring" element={<TabRecurring />} />
          <Route path="templates" element={<TabTemplates />} />
          <Route path="completed" element={<TabCompleted />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
