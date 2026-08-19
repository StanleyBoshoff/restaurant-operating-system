import { ClipboardList, LayoutDashboard, Sun, Moon, ChefHat, GlassWater, Brush, PenTool, FileBarChart } from 'lucide-react';

export const CHECKLISTS_TABS = [
  { id: 'overview', label: 'Overview', path: '', icon: LayoutDashboard },
  { id: 'opening', label: 'Opening Duty', path: 'opening', icon: Sun },
  { id: 'closing', label: 'Closing Duty', path: 'closing', icon: Moon },
  { id: 'kitchen', label: 'Kitchen', path: 'kitchen', icon: ChefHat },
  { id: 'bar', label: 'Bar & Floor', path: 'bar', icon: GlassWater },
  { id: 'cleaning', label: 'Cleaning', path: 'cleaning', icon: Brush },
  { id: 'custom', label: 'Protocol Designer', path: 'custom', icon: PenTool },
  { id: 'reports', label: 'History & Audits', path: 'reports', icon: FileBarChart }
];
