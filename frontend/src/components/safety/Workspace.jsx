import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { SAFETY_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabAccidents from './TabAccidents';
import TabIncidents from './TabIncidents';
import TabNearMisses from './TabNearMisses';
import TabFirstAid from './TabFirstAid';
import TabFireDrills from './TabFireDrills';
import TabEquipmentSafety from './TabEquipmentSafety';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Health & Safety"
        description="Manage and monitor workplace health and safety compliance."
        icon={ShieldCheck}
      />

      <ModuleTabNavigation tabs={SAFETY_TABS} baseUrl="/safety" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="accidents" element={<TabAccidents />} />
          <Route path="incidents" element={<TabIncidents />} />
          <Route path="near-misses" element={<TabNearMisses />} />
          <Route path="first-aid" element={<TabFirstAid />} />
          <Route path="fire-drills" element={<TabFireDrills />} />
          <Route path="equipment-safety" element={<TabEquipmentSafety />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
