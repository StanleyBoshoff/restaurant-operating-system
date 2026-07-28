import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ModuleWorkspaceHeader from '../common/ModuleWorkspaceHeader';
import ModuleTabNavigation from '../common/ModuleTabNavigation';
import { TRAINING_TABS } from './tabs';

// Tab Components
import TabOverview from './TabOverview';
import TabCourses from './TabCourses';
import TabAssessments from './TabAssessments';
import TabCertificates from './TabCertificates';
import TabKnowledgeBase from './TabKnowledgeBase';
import TabReports from './TabReports';

export default function Workspace() {
  return (
    <div className="animate-in fade-in duration-500">
      <ModuleWorkspaceHeader
        title="Training & Development"
        description="Manage employee learning paths, certifications, and knowledge resources."
        icon={GraduationCap}
      />

      <ModuleTabNavigation
        tabs={TRAINING_TABS}
        baseUrl="/training"
      />

      <div className="min-h-[400px]">
        <Routes>
          <Route path="/" element={<TabOverview />} />
          <Route path="courses" element={<TabCourses />} />
          <Route path="assessments" element={<TabAssessments />} />
          <Route path="certificates" element={<TabCertificates />} />
          <Route path="knowledge-base" element={<TabKnowledgeBase />} />
          <Route path="reports" element={<TabReports />} />
        </Routes>
      </div>
    </div>
  );
}
