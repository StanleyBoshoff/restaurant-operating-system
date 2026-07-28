import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { COMMUNICATION_TABS } from './tabs';

import TabOverview from './TabOverview';
import TabAnnouncements from './TabAnnouncements';
import TabNotices from './TabNotices';
import TabPolicies from './TabPolicies';
import TabReceipts from './TabReceipts';

export default function Workspace() {
  return (
    <div className="max-w-7xl mx-auto">
      <ModuleWorkspaceHeader
        title="Internal Communication"
        description="Manage and monitor team announcements and messaging."
        icon={MessageSquare}
      />

      <ModuleTabNavigation tabs={COMMUNICATION_TABS} baseUrl="/communication" />

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="announcements" element={<TabAnnouncements />} />
          <Route path="notices" element={<TabNotices />} />
          <Route path="policies" element={<TabPolicies />} />
          <Route path="receipts" element={<TabReceipts />} />
        </Routes>
      </div>
    </div>
  );
}
