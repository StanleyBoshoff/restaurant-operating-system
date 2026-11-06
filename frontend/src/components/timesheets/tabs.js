import { Clock, Timer, Calendar, ShieldCheck, FileOutput, BarChart3, Users } from 'lucide-react';

export const ATTENDANCE_TABS = [
  { id: 'overview', label: 'Live Dashboard', path: '', icon: Clock },
  { id: 'individual-timesheets', label: 'Individual Timesheets', path: 'individual', icon: Users },
  { id: 'monthly-summary', label: 'Monthly Summary', path: 'monthly-summary', icon: BarChart3 },
  { id: 'payroll-export', label: 'Payroll Export', path: 'payroll-export', icon: FileOutput },
];
