import { GraduationCap, BookOpen, ClipboardCheck, Award, Library, BarChart3 } from 'lucide-react';

export const TRAINING_TABS = [
  { id: 'overview', label: 'Overview', path: '', icon: GraduationCap },
  { id: 'courses', label: 'Courses', path: 'courses', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', path: 'assessments', icon: ClipboardCheck },
  { id: 'certificates', label: 'Certificates', path: 'certificates', icon: Award },
  { id: 'knowledge-base', label: 'Knowledge Base', path: 'knowledge-base', icon: Library },
  { id: 'reports', label: 'Reports', path: 'reports', icon: BarChart3 },
];
