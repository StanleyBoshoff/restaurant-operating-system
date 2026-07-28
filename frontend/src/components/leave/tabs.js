import { Calendar, Inbox, CalendarDays, Wallet, ShieldCheck, BarChart3 } from 'lucide-react';

export const LEAVE_TABS = [
  { id: 'overview', label: 'Overview', path: '', icon: Calendar },
  { id: 'requests', label: 'Requests', path: 'requests', icon: Inbox },
  { id: 'calendar', label: 'Calendar', path: 'calendar', icon: CalendarDays },
  { id: 'balances', label: 'Balances', path: 'balances', icon: Wallet },
  { id: 'approvals', label: 'Approvals', path: 'approvals', icon: ShieldCheck },
  { id: 'reports', label: 'Reports', path: 'reports', icon: BarChart3 },
];
