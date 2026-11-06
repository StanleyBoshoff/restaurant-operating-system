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

// Checklist duty tabs & protocol runner components
import TabKitchen from '../checklists/TabKitchen';
import TabBar from '../checklists/TabBar';
import TabCleaning from '../checklists/TabCleaning';
import TabCustom from '../checklists/TabCustom';
import ChecklistRunner from '../checklists/ChecklistRunner';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Tasks & Checklists"
        description="Manage daily operations, duty protocols, recurring tasks, and team assignments."
        icon={CheckSquare}
      />

      <ModuleTabNavigation tabs={TASKS_TABS} baseUrl="/tasks" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="open" element={<TabOpen />} />
          <Route path="kitchen" element={<TabKitchen />} />
          <Route path="bar" element={<TabBar />} />
          <Route path="cleaning" element={<TabCleaning />} />
          <Route path="designer" element={<TabCustom />} />
          <Route path="recurring" element={<TabRecurring />} />
          <Route path="templates" element={<TabTemplates />} />
          <Route path="completed" element={<TabCompleted />} />
          <Route path="reports" element={<TabReports />} />
          <Route path="run/:checklistId" element={<ChecklistRunner />} />
        </Routes>
      </div>
    </div>
  );
}
