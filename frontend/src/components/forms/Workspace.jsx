import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FileText } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { FORMS_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabIncident from './TabIncident';
import TabDamage from './TabDamage';
import TabMaintenance from './TabMaintenance';
import TabCashUp from './TabCashUp';
import TabTempLogs from './TabTempLogs';
import TabCustom from './TabCustom';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Administrative Forms"
        description="Access and manage internal reports, maintenance logs, and financial records."
        icon={FileText}
      />

      <ModuleTabNavigation tabs={FORMS_TABS} baseUrl="/forms" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="incident" element={<TabIncident />} />
          <Route path="damage" element={<TabDamage />} />
          <Route path="maintenance" element={<TabMaintenance />} />
          <Route path="cash-up" element={<TabCashUp />} />
          <Route path="temp-logs" element={<TabTempLogs />} />
          <Route path="custom" element={<TabCustom />} />
        </Routes>
      </div>
    </div>
  );
}
