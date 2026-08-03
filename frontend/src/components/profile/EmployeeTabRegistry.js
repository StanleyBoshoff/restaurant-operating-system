import TabOverview from './TabOverview';
import TabDetails from './TabDetails';
import TabLeave from './TabLeave';
import TabWarnings from './TabWarnings';
import TabDocuments from './TabDocuments';

// Combined and new tab components
import TabTimeAttendance from './TabTimeAttendance';
import TabPerformanceTraining from './TabPerformanceTraining';
import TabTasksNotes from './TabTasksNotes';
import TabAuditLog from './TabAuditLog';

export const EMPLOYEE_TABS = [
  { id: 'overview', label: 'Overview', component: TabOverview, path: '' },
  { id: 'details', label: 'Details', component: TabDetails, path: 'details' },
  { id: 'documents', label: 'Documents', component: TabDocuments, path: 'documents', permissionId: 'can_submit_forms' },
  { id: 'leave', label: 'Leave', component: TabLeave, path: 'leave', permissionId: 'can_view_leave_tracker' },
  { id: 'time_attendance', label: 'Time & Attendance', component: TabTimeAttendance, path: 'time-attendance', permissionId: 'can_view_timesheets' },
  { id: 'performance_training', label: 'Performance & Training', component: TabPerformanceTraining, path: 'performance-training', permissionId: 'can_manage_training' },
  { id: 'warnings', label: 'Warnings', component: TabWarnings, path: 'warnings', permissionId: 'can_manage_disciplinary' },
  { id: 'tasks_notes', label: 'Tasks & Notes', component: TabTasksNotes, path: 'tasks-notes' },
  { id: 'audit', label: 'Audit Log', component: TabAuditLog, path: 'audit', permissionId: 'can_view_all_staff' },
];
