
import {
  LayoutGrid,
  Layers,
  CheckCircle,
  AlignLeft,
  Zap,
  BarChart2,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { type WorkspaceTab } from '@/store/study.store';

export interface NavItem {
  id: WorkspaceTab;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, description: 'Session summary' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, description: 'Active recall cards' },
  { id: 'quiz', label: 'Quiz', icon: CheckCircle, description: 'Practice questions' },
  { id: 'summary', label: 'Summary', icon: AlignLeft, description: 'Structured notes' },
  { id: 'mnemonics', label: 'Mnemonics', icon: Zap, description: 'Memory hooks' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, description: 'Study insights' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];
