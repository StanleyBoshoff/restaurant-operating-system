import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Settings } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { SETTINGS_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabUsers from './TabUsers';
import TabPermissions from './TabPermissions';
import TabBranches from './TabBranches';
import TabDepartments from './TabDepartments';
import TabPositions from './TabPositions';
import TabEmploymentTypes from './TabEmploymentTypes';
import TabLeaveTypes from './TabLeaveTypes';
import TabWarningTypes from './TabWarningTypes';
import TabDocumentTypes from './TabDocumentTypes';
import TabPayroll from './TabPayroll';
import TabTrainingCategories from './TabTrainingCategories';
import TabNotifications from './TabNotifications';
import TabSystem from './TabSystem';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Settings"
        description="Configure and manage system-wide parameters, user access, and organizational structures."
        icon={Settings}
      />

      <ModuleTabNavigation tabs={SETTINGS_TABS} baseUrl="/settings" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="users" element={<TabUsers />} />
          <Route path="permissions" element={<TabPermissions />} />
          <Route path="branches" element={<TabBranches />} />
          <Route path="departments" element={<TabDepartments />} />
          <Route path="positions" element={<TabPositions />} />
          <Route path="employment-types" element={<TabEmploymentTypes />} />
          <Route path="leave-types" element={<TabLeaveTypes />} />
          <Route path="warning-types" element={<TabWarningTypes />} />
          <Route path="document-types" element={<TabDocumentTypes />} />
          <Route path="payroll" element={<TabPayroll />} />
          <Route path="training-categories" element={<TabTrainingCategories />} />
          <Route path="notifications" element={<TabNotifications />} />
          <Route path="system" element={<TabSystem />} />
        </Routes>
      </div>
    </div>
  );
}
