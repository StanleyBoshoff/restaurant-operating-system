import { Clock, Timer, Calendar, ShieldCheck, FileOutput, BarChart3, CalendarDays } from 'lucide-react';

export const ATTENDANCE_TABS = [
  { id: 'overview', label: 'Overview', path: '', icon: Clock },
  { id: 'live-clock', label: 'Live Clock', path: 'live-clock', icon: Timer },
  { id: 'monthly-register', label: 'Monthly Register', path: 'monthly-register', icon: CalendarDays },
  { id: 'payroll-export', label: 'Payroll Export', path: 'payroll-export', icon: FileOutput },
];
