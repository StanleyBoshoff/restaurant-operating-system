import { Clock, Timer, Calendar, ShieldCheck, FileOutput, BarChart3 } from 'lucide-react';

export const TIMESHEET_TABS = [
  { id: 'overview', label: 'Overview', path: '', icon: Clock },
  { id: 'live-clock', label: 'Live Clock', path: 'live-clock', icon: Timer },
  { id: 'weekly', label: 'Weekly', path: 'weekly', icon: Calendar },
  { id: 'approvals', label: 'Approvals', path: 'approvals', icon: ShieldCheck },
  { id: 'payroll-export', label: 'Payroll Export', path: 'payroll-export', icon: FileOutput },
  { id: 'reports', label: 'Reports', path: 'reports', icon: BarChart3 },
];
