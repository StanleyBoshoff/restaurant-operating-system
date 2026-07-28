import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { CHECKLISTS_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabOpening from './TabOpening';
import TabClosing from './TabClosing';
import TabKitchen from './TabKitchen';
import TabBar from './TabBar';
import TabCleaning from './TabCleaning';
import TabCustom from './TabCustom';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Operational Checklists"
        description="Monitor and manage daily operational procedures and compliance checks."
        icon={ClipboardList}
      />

      <ModuleTabNavigation tabs={CHECKLISTS_TABS} baseUrl="/checklists" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="opening" element={<TabOpening />} />
          <Route path="closing" element={<TabClosing />} />
          <Route path="kitchen" element={<TabKitchen />} />
          <Route path="bar" element={<TabBar />} />
          <Route path="cleaning" element={<TabCleaning />} />
          <Route path="custom" element={<TabCustom />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
