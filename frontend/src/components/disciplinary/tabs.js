import { BarChart3, History, Wand2 } from 'lucide-react';

export const DISCIPLINARY_TABS = [
  { id: 'overview', label: 'Store Overview', path: '', icon: BarChart3 },
  { id: 'engine', label: 'Warning Engine', path: 'engine', icon: Wand2 },
  { id: 'records', label: 'All Warnings', path: 'records', icon: History },
];
