import { LayoutDashboard, CheckSquare, Calendar, ClipboardList, FileBarChart, CheckCircle2, PenTool } from 'lucide-react';

export const TASKS_TABS = [
  { id: 'overview', label: 'Operations Monitor', path: '', icon: LayoutDashboard },
  { id: 'open', label: 'Active Boards', path: 'open', icon: CheckSquare },
  { id: 'designer', label: 'Protocol Designer', path: 'designer', icon: PenTool },
  { id: 'recurring', label: 'Schedule Designer', path: 'recurring', icon: Calendar },
  { id: 'templates', label: 'Task Library', path: 'templates', icon: ClipboardList },
  { id: 'completed', label: 'Archived Tasks', path: 'completed', icon: CheckCircle2 },
  { id: 'reports', label: 'Audit Reports', path: 'reports', icon: FileBarChart }
];
