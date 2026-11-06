import { LayoutDashboard, CheckSquare, Calendar, ClipboardList, FileBarChart, CheckCircle2, ChefHat, GlassWater, Brush, PenTool } from 'lucide-react';

export const TASKS_TABS = [
  { id: 'overview', label: 'Operations Monitor', path: '', icon: LayoutDashboard },
  { id: 'open', label: 'Active Boards', path: 'open', icon: CheckSquare },
  { id: 'kitchen', label: 'Kitchen', path: 'kitchen', icon: ChefHat },
  { id: 'bar', label: 'Bar & Floor', path: 'bar', icon: GlassWater },
  { id: 'cleaning', label: 'Cleaning', path: 'cleaning', icon: Brush },
  { id: 'designer', label: 'Protocol Designer', path: 'designer', icon: PenTool },
  { id: 'recurring', label: 'Schedule Designer', path: 'recurring', icon: Calendar },
  { id: 'templates', label: 'Task Library', path: 'templates', icon: ClipboardList },
  { id: 'completed', label: 'Archived Tasks', path: 'completed', icon: CheckCircle2 },
  { id: 'reports', label: 'Audit Reports', path: 'reports', icon: FileBarChart }
];
